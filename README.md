# THE CUBE

Portfólio interativo 3D de Gustavo Morais. Um cubo modular (4×4×4) é o sistema de navegação.
**BUILD. DEBUG. IMPROVE.**

## Rodando

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de produção
npm run typecheck  # tsc --noEmit
npm run lint
npm test           # vitest (lógica pura do cubo)
npm run format
```

Requer Node 20+ (desenvolvido em Node 22).

## Estado atual

- [x] Fase 1 — Arquitetura, layout inicial, dados reais
- [x] Fase 2 — Cubo 3D (56 blocos, iluminação, base luminosa, rotação e flutuação)
- [ ] Fase 3 — Interação · Fase 4 — Painéis · Fase 5 — GitHub API
- [ ] Fase 6 — Refinamento visual · Fase 7 — Testes

## Estrutura

- `src/data/` — conteúdo (perfil, projetos, experiência, tecnologias, faces). Fonte única.
- `src/types/` — tipos do conteúdo.
- `src/components/cube/` — tudo que é 3D. Não importa nada de `panels/`.
- `src/components/interface/` — header, footer, instruções.
- `src/lib/palette.ts` — paleta para WebGL (espelha os tokens de `globals.css`).

## Decisões técnicas

- **Fontes locais** via `@fontsource-variable/*` (Inter, Space Grotesk, JetBrains Mono): sem requisição ao Google, sem dependência de rede no build.
- **Cena 3D com `dynamic(..., { ssr: false })`** dentro de um Client Component, em chunk separado.
- **Ícones de marca**: `lucide-react` 1.x removeu marcas; GitHub vem de `simple-icons`. LinkedIn e Power BI não existem em `simple-icons` (pendência para a Fase 4).
- **`cacheComponents` desativado**: o scaffold o ligava, mas o site é estático e não precisa. Reavaliar na Fase 5 (GitHub API).
- **Dependências adiadas** até haver uso real: Vitest, Playwright, Framer Motion, postprocessing.
- **Somente tema escuro** por ora.
- **56 blocos, não 64**: os 8 do miolo 2×2×2 nunca são visíveis. O miolo oco deixa a luz do núcleo vazar pelas frestas.
- **Meshes individuais, não `InstancedMesh`**: cada bloco precisa de emissão própria (hover/seleção, Fase 3). 56 draw calls são irrelevantes.
- **Cor base do metal `#3c424d`** (`CubeBlock.tsx`): em PBR a refletância do metal vem da cor base; com `#171A20` o bloco renderiza preto. A paleta segue valendo para a UI.
- **Environment procedural** (Lightformers do drei): reflexos sem baixar HDR externo.
- **Lógica do cubo em funções puras** (`src/lib/cube/`), com testes, separada dos componentes R3F.
- `@types/node` alinhado a `^22` (exigência de peer do vitest 5; runtime é Node 22).
- `npm audit` acusa `minimatch` (moderada) no toolchain de lint; é só dev, e o `--force` faria downgrade do `eslint-config-next`.

## Problemas conhecidos

- Aviso de console `THREE.Clock deprecated`: vem do R3F 9.8.2 internamente; inofensivo.
- Sem fallback para dispositivos sem WebGL (Fase 6/7).
- Sem bloom: o brilho laranja ainda é mais chapado que na referência (Fase 6).
- Em celular estreito a base luminosa vaza pelas bordas da tela.

## Regras de conteúdo

Nada de métricas, links ou screenshots inventados. Campos sem informação confirmada ficam vazios
ou com `TODO(Gustavo)` nos arquivos de `src/data/`.
