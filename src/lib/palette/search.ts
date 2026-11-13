export interface Searchable {
  label: string;
  keywords?: string;
}

/** Minúsculas e sem acento: "experiencia" encontra "Experiência". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function rank(item: Searchable, tokens: string[]): number | null {
  const label = normalize(item.label);
  const words = label.split(/[\s\-_/·]+/);
  const extra = normalize(item.keywords ?? "");
  let score = 0;
  for (const token of tokens) {
    if (label.startsWith(token)) score += 0;
    else if (words.some((w) => w.startsWith(token))) score += 1;
    else if (label.includes(token)) score += 2;
    else if (extra.includes(token)) score += 3;
    else return null; // todos os termos precisam casar
  }
  return score;
}

/** Filtra e ordena por relevância, mantendo a ordem original nos empates. */
export function filterItems<T extends Searchable>(
  items: readonly T[],
  query: string,
): T[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [...items];
  return items
    .map((item, index) => ({ item, index, score: rank(item, tokens) }))
    .filter((r): r is { item: T; index: number; score: number } => r.score !== null)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((r) => r.item);
}
