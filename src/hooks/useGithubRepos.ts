import { useEffect, useState } from "react";
import { loadRepos, type GithubResult } from "@/lib/github";

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null; // acesso bloqueado pelo navegador
  }
}

/** `result === null` significa carregando. A requisição é cancelada ao desmontar. */
export function useGithubRepos() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<GithubResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    loadRepos({ fetchFn: fetch, storage: safeStorage(), signal: controller.signal })
      .then((r) => {
        if (!controller.signal.aborted) setResult(r);
      })
      .catch(() => {
        /* AbortError: o componente já foi desmontado */
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = () => {
    setResult(null);
    setAttempt((a) => a + 1);
  };
  return { result, retry };
}
