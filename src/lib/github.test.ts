import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CACHE_KEY,
  CACHE_TTL_MS,
  fetchGithubRepos,
  loadRepos,
  normalizeRepos,
  type KeyValueStorage,
  type RepoSummary,
} from "./github";

const apiRepo = (over: Record<string, unknown> = {}) => ({
  name: "python_automation_process",
  html_url: "https://github.com/SirGusttavo/python_automation_process",
  description: "FLOW",
  language: "Python",
  pushed_at: "2026-10-01T10:00:00Z",
  updated_at: "2026-09-01T10:00:00Z",
  fork: false,
  stars: 999, // campo ignorado
  ...over,
});

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    ...init,
  });

function memoryStorage(
  initial: Record<string, string> = {},
): KeyValueStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = v) };
}

const sample: RepoSummary[] = [
  {
    name: "a",
    url: "https://github.com/x/a",
    updatedAt: "2026-01-01T00:00:00Z",
    description: null,
    language: null,
    fork: false,
  },
];

describe("normalizeRepos", () => {
  it("mantém só os campos esperados e ordena do mais recente ao mais antigo", () => {
    const out = normalizeRepos([
      apiRepo({
        name: "velho",
        html_url: "https://github.com/u/velho",
        pushed_at: "2025-01-01T00:00:00Z",
      }),
      apiRepo(),
    ]);
    expect(out.map((r) => r.name)).toEqual(["python_automation_process", "velho"]);
    expect(out[0]).toEqual({
      name: "python_automation_process",
      url: "https://github.com/SirGusttavo/python_automation_process",
      description: "FLOW",
      language: "Python",
      updatedAt: "2026-10-01T10:00:00Z",
      fork: false,
    });
  });

  it("descarta entradas inválidas e URLs que não são do GitHub, sem inventar dados", () => {
    expect(normalizeRepos(null)).toEqual([]);
    expect(normalizeRepos({ message: "x" })).toEqual([]);
    expect(
      normalizeRepos([
        1,
        null,
        {},
        apiRepo({ html_url: "https://evil.example/x" }),
        apiRepo({ name: undefined }),
      ]),
    ).toEqual([]);
  });

  it("aceita descrição e linguagem nulas", () => {
    const [r] = normalizeRepos([apiRepo({ description: null, language: null })]);
    expect(r.description).toBeNull();
    expect(r.language).toBeNull();
  });
});

describe("fetchGithubRepos (servidor)", () => {
  const opts = { base: "https://api.github.com", user: "SirGusttavo" };

  it("devolve repositórios normalizados e não envia token se não houver", async () => {
    const fetchFn = vi.fn().mockResolvedValue(json([apiRepo()]));
    const r = await fetchGithubRepos(fetchFn, opts);
    expect(r.ok && r.repos).toHaveLength(1);
    expect(fetchFn.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("usa o token só quando configurado no servidor", async () => {
    const fetchFn = vi.fn().mockResolvedValue(json([]));
    await fetchGithubRepos(fetchFn, { ...opts, token: "t0k3n" });
    expect(fetchFn.mock.calls[0][1].headers.Authorization).toBe("Bearer t0k3n");
  });

  it("reconhece o limite de requisições (403 com remaining=0, resposta real do GitHub)", async () => {
    const res = json(
      {
        message: "API rate limit exceeded for 203.0.113.7.",
        documentation_url:
          "https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting",
      },
      {
        status: 403,
        headers: { "x-ratelimit-remaining": "0", "x-ratelimit-limit": "60" },
      },
    );
    expect(await fetchGithubRepos(vi.fn().mockResolvedValue(res), opts)).toEqual({
      ok: false,
      code: "rate_limited",
      status: 403,
    });
  });

  it("429 também é limite; 403 sem esgotar cota e 500 são erro do GitHub", async () => {
    expect(
      await fetchGithubRepos(vi.fn().mockResolvedValue(json({}, { status: 429 })), opts),
    ).toMatchObject({ code: "rate_limited" });
    expect(
      await fetchGithubRepos(
        vi
          .fn()
          .mockResolvedValue(
            json({}, { status: 403, headers: { "x-ratelimit-remaining": "12" } }),
          ),
        opts,
      ),
    ).toMatchObject({ code: "upstream" });
    expect(
      await fetchGithubRepos(vi.fn().mockResolvedValue(json({}, { status: 500 })), opts),
    ).toMatchObject({ code: "upstream" });
  });

  it("falha de rede e JSON quebrado viram erros tratados, nunca exceções", async () => {
    expect(
      await fetchGithubRepos(
        vi.fn().mockRejectedValue(new TypeError("fetch failed")),
        opts,
      ),
    ).toMatchObject({ ok: false, code: "network" });
    expect(
      await fetchGithubRepos(
        vi.fn().mockResolvedValue(new Response("<html>", { status: 200 })),
        opts,
      ),
    ).toMatchObject({ ok: false, code: "upstream" });
  });
});

describe("loadRepos (cliente)", () => {
  const now = Date.parse("2026-11-12T12:00:00Z");
  let storage: ReturnType<typeof memoryStorage>;
  beforeEach(() => {
    storage = memoryStorage();
  });

  it("busca, devolve e grava no cache", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(json({ repos: sample, fetchedAt: "2026-11-12T11:59:00Z" }));
    const r = await loadRepos({ fetchFn, storage, now });
    expect(r).toMatchObject({ status: "ok", repos: sample });
    expect(JSON.parse(storage.data[CACHE_KEY]).fetchedAt).toBe("2026-11-12T11:59:00Z");
  });

  it("usa o cache enquanto está fresco, sem tocar na rede", async () => {
    storage.data[CACHE_KEY] = JSON.stringify({
      repos: sample,
      fetchedAt: new Date(now - CACHE_TTL_MS + 60_000).toISOString(),
    });
    const fetchFn = vi.fn();
    const r = await loadRepos({ fetchFn, storage, now });
    expect(r.status).toBe("ok");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("cache vencido + rede ok: atualiza", async () => {
    storage.data[CACHE_KEY] = JSON.stringify({
      repos: [],
      fetchedAt: new Date(now - CACHE_TTL_MS - 1).toISOString(),
    });
    const fetchFn = vi
      .fn()
      .mockResolvedValue(json({ repos: sample, fetchedAt: "2026-11-12T12:00:00Z" }));
    expect(await loadRepos({ fetchFn, storage, now })).toMatchObject({
      status: "ok",
      repos: sample,
    });
  });

  it("limite atingido SEM cache: erro tratado com o código certo", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(json({ error: "rate_limited" }, { status: 429 }));
    expect(await loadRepos({ fetchFn, storage, now })).toEqual({
      status: "error",
      error: "rate_limited",
    });
  });

  it("falha com cache vencido: mostra os dados antigos marcados como 'stale'", async () => {
    storage.data[CACHE_KEY] = JSON.stringify({
      repos: sample,
      fetchedAt: new Date(now - 5 * CACHE_TTL_MS).toISOString(),
    });
    const fetchFn = vi.fn().mockRejectedValue(new TypeError("offline"));
    const r = await loadRepos({ fetchFn, storage, now });
    expect(r).toMatchObject({ status: "stale", error: "network", repos: sample });
  });

  it("resposta com formato inesperado vira erro 'upstream'", async () => {
    const fetchFn = vi.fn().mockResolvedValue(json({ surprise: true }));
    expect(await loadRepos({ fetchFn, storage, now })).toEqual({
      status: "error",
      error: "upstream",
    });
  });

  it("cache corrompido ou storage indisponível não quebra", async () => {
    storage.data[CACHE_KEY] = "{not json";
    // Response só pode ser lida uma vez: cada chamada precisa de uma resposta nova.
    const fetchFn = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(json({ repos: sample, fetchedAt: "2026-11-12T12:00:00Z" })),
      );
    expect((await loadRepos({ fetchFn, storage, now })).status).toBe("ok");
    expect((await loadRepos({ fetchFn, storage: null, now })).status).toBe("ok");
    const throwing: KeyValueStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect((await loadRepos({ fetchFn, storage: throwing, now })).status).toBe("ok");
  });

  it("propaga AbortError (a UI cancela ao desmontar)", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError"));
    await expect(loadRepos({ fetchFn, storage, now })).rejects.toThrow("aborted");
  });
});
