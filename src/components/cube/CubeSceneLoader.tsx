"use client";

import dynamic from "next/dynamic";

/**
 * `ssr: false` só é permitido em Client Components (docs do Next). O WebGL não
 * existe no servidor, então a cena carrega apenas no navegador, em chunk separado.
 */
const CubeScene = dynamic(() => import("./CubeScene").then((m) => m.CubeScene), {
  ssr: false,
});

export function CubeSceneLoader() {
  return <CubeScene />;
}
