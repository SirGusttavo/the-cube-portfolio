import { profile } from "@/data/profile";
import { fetchGithubRepos } from "@/lib/github";

/** Cache de 1 h no servidor: o GitHub recebe ~1 requisição/hora, não uma por visitante. */
export const revalidate = 3600;

export async function GET() {
  const result = await fetchGithubRepos(fetch, {
    // GITHUB_API_URL só existe para testes locais com um servidor falso.
    base: process.env.GITHUB_API_URL ?? "https://api.github.com",
    user: profile.githubUser,
    // Opcional e exclusivo do servidor: sobe a cota de 60 para 5000 req/h.
    token: process.env.GITHUB_TOKEN,
  });

  if (!result.ok) {
    return Response.json(
      { error: result.code },
      {
        status: result.code === "rate_limited" ? 429 : 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
  return Response.json({ repos: result.repos, fetchedAt: new Date().toISOString() });
}
