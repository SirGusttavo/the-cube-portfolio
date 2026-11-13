/**
 * Integração com a API pública do GitHub.
 *
 * Camadas:
 *  1. servidor (`fetchGithubRepos`, usado pelo Route Handler): cache de 1 h no
 *     Next, então o GitHub recebe ~1 requisição/hora, não uma por visitante.
 *     Token opcional só em variável de ambiente do servidor; nunca no frontend.
 *  2. cliente (`loadRepos`): cache em localStorage, tolerância a falhas e
 *     dados antigos como reserva. O portfólio nunca depende da API.
 *
 * Contexto: sem token a cota é de 60 req/h por IP, compartilhada por quem está
 * atrás da mesma rede (empresa, faculdade). Chamar do navegador seria frágil.
 */

export interface RepoSummary {
  name: string;
  description: string | null;
  language: string | null;
  updatedAt: string;
  url: string;
  fork: boolean;
}

export type GithubErrorCode = "rate_limited" | "network" | "upstream";

export const CACHE_KEY = "the-cube.github.repos";
export const CACHE_TTL_MS = 60 * 60 * 1000;
export const REPOS_ENDPOINT = "/api/github/repos";

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;
const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

/** Valida e reduz a resposta da API. Entradas malformadas são descartadas, nunca inventadas. */
export function normalizeRepos(json: unknown): RepoSummary[] {
  if (!Array.isArray(json)) return [];
  const repos: RepoSummary[] = [];
  for (const item of json) {
    if (!isObject(item)) continue;
    const name = str(item.name);
    const url = str(item.html_url);
    const updatedAt = str(item.pushed_at) ?? str(item.updated_at);
    if (!name || !url || !updatedAt || !/^https:\/\/github\.com\//.test(url)) continue;
    repos.push({
      name,
      url,
      updatedAt,
      description: str(item.description),
      language: str(item.language),
      fork: item.fork === true,
    });
  }
  return repos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/* ---------------------------------- servidor --------------------------------- */

type FetchFn = (
  url: string,
  init?: RequestInit & { next?: { revalidate?: number } },
) => Promise<Response>;

export type ServerResult =
  | { ok: true; repos: RepoSummary[] }
  | { ok: false; code: GithubErrorCode; status: number };

export async function fetchGithubRepos(
  fetchFn: FetchFn,
  opts: { base: string; user: string; token?: string },
): Promise<ServerResult> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "the-cube-portfolio",
  };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let res: Response;
  try {
    res = await fetchFn(
      `${opts.base}/users/${encodeURIComponent(opts.user)}/repos?per_page=100&sort=pushed`,
      {
        headers,
        next: { revalidate: 3600 },
      },
    );
  } catch {
    return { ok: false, code: "network", status: 0 };
  }

  if (!res.ok) {
    const exhausted = res.headers.get("x-ratelimit-remaining") === "0";
    const limited = res.status === 429 || (res.status === 403 && exhausted);
    return { ok: false, code: limited ? "rate_limited" : "upstream", status: res.status };
  }
  try {
    return { ok: true, repos: normalizeRepos(await res.json()) };
  } catch {
    return { ok: false, code: "upstream", status: res.status };
  }
}

/* ----------------------------------- cliente --------------------------------- */

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type GithubResult =
  | { status: "ok"; repos: RepoSummary[]; fetchedAt: string }
  | { status: "stale"; repos: RepoSummary[]; fetchedAt: string; error: GithubErrorCode }
  | { status: "error"; error: GithubErrorCode };

interface CacheEntry {
  repos: RepoSummary[];
  fetchedAt: string;
}

function readCache(storage: KeyValueStorage | null): CacheEntry | null {
  try {
    const raw = storage?.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      !isObject(parsed) ||
      typeof parsed.fetchedAt !== "string" ||
      !Array.isArray(parsed.repos)
    )
      return null;
    const repos = normalizeCached(parsed.repos);
    return Number.isNaN(Date.parse(parsed.fetchedAt))
      ? null
      : { repos, fetchedAt: parsed.fetchedAt };
  } catch {
    return null; // cache corrompido ou storage bloqueado: ignora
  }
}

/** Reaproveita o validador exigindo o formato de saída (já normalizado). */
function normalizeCached(items: unknown[]): RepoSummary[] {
  return items.filter(
    (r): r is RepoSummary =>
      isObject(r) &&
      typeof r.name === "string" &&
      typeof r.url === "string" &&
      typeof r.updatedAt === "string",
  );
}

function writeCache(storage: KeyValueStorage | null, entry: CacheEntry) {
  try {
    storage?.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* sem espaço ou bloqueado: segue sem cache */
  }
}

export async function loadRepos(opts: {
  fetchFn: (input: string, init?: RequestInit) => Promise<Response>;
  storage: KeyValueStorage | null;
  now?: number;
  endpoint?: string;
  signal?: AbortSignal;
}): Promise<GithubResult> {
  const now = opts.now ?? Date.now();
  const cached = readCache(opts.storage);
  if (cached && now - Date.parse(cached.fetchedAt) < CACHE_TTL_MS) {
    return { status: "ok", repos: cached.repos, fetchedAt: cached.fetchedAt };
  }

  let error: GithubErrorCode = "network";
  try {
    const res = await opts.fetchFn(opts.endpoint ?? REPOS_ENDPOINT, {
      signal: opts.signal,
    });
    if (res.ok) {
      const body: unknown = await res.json();
      if (
        isObject(body) &&
        Array.isArray(body.repos) &&
        typeof body.fetchedAt === "string"
      ) {
        const entry = { repos: normalizeCached(body.repos), fetchedAt: body.fetchedAt };
        writeCache(opts.storage, entry);
        return { status: "ok", ...entry };
      }
      error = "upstream";
    } else {
      error = res.status === 429 ? "rate_limited" : "upstream";
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    error = "network";
  }

  // Falhou: dados antigos (mesmo vencidos) são melhores que tela vazia.
  if (cached)
    return { status: "stale", repos: cached.repos, fetchedAt: cached.fetchedAt, error };
  return { status: "error", error };
}
