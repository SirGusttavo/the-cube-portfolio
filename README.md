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
npm run format
```

Requer Node 20+ (desenvolvido em Node 22).

## Estado atual

- [x] Fase 1 — Arquitetura, layout inicial, dados reais
- [ ] Fase 2 — Cubo 3D (hoje há um `CubeScene` placeholder)
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
- `npm audit` acusa `minimatch` (moderada) no toolchain de lint; é só dev, e o `--force` faria downgrade do `eslint-config-next`.

## Regras de conteúdo

Nada de métricas, links ou screenshots inventados. Campos sem informação confirmada ficam vazios
ou com `TODO(Gustavo)` nos arquivos de `src/data/`.
