import type { Project } from "@/types/content";

/**
 * Conteúdo real, limitado ao que consta na especificação.
 * Campos sem informação confirmada ficam vazios, nunca inventados.
 */
export const projects: readonly Project[] = [
  {
    id: "flow",
    name: "FLOW",
    subtitle: "Python Automation Process",
    summary: "Suíte de automações para processos industriais, composta por seis módulos.",
    kind: "professional",
    repository: "https://github.com/SirGusttavo/python_automation_process",
    modules: [
      {
        id: "pgr-orchestrator",
        name: "PGR Orchestrator",
        summary: "Automação do lançamento e atualização de indicadores industriais.",
        technologies: [],
        results: [],
      },
      {
        id: "sap-bridge",
        name: "SAP Bridge",
        summary:
          "Automação de extração e consolidação de relatórios SAP, com integração ao SAP GUI e tratamento de dados.",
        technologies: [],
        results: [],
      },
      {
        id: "lot-miner",
        name: "Lot Miner",
        summary:
          "Auditoria e rastreabilidade de lotes, integrando informações de relatórios SSRS e SAP.",
        technologies: [],
        results: [],
      },
      {
        id: "prod-forge",
        name: "Prod Forge",
        summary: "Automação de atualização e processamento de relatórios de produção.",
        technologies: [],
        results: [],
      },
      {
        id: "visconf-engine",
        name: "VISCONF Engine",
        summary: "Solução colaborativa para gestão e visibilidade de insumos.",
        technologies: [],
        results: [],
        notes: [
          "Desenvolvido em colaboração com João.",
          "5º lugar no Summit PRO+ da unidade Suzano Mogi.",
        ],
      },
      {
        id: "techlyst",
        name: "Techlyst",
        summary:
          "Extração e tratamento de estruturas técnicas de materiais (BOM), com integração ao SAP GUI e Excel. Utilizada em diferentes unidades industriais.",
        technologies: [],
        results: [],
      },
    ],
    attribution: ["Não atribuir a autoria original do VISCONF exclusivamente a Gustavo."],
  },
  {
    id: "python-course",
    name: "Python Course",
    subtitle: "Estudos e evolução em Python",
    summary: "Repositório de aprendizagem. Não é um produto profissional finalizado.",
    kind: "learning",
    repository: "https://github.com/SirGusttavo/python-course",
  },
  {
    id: "picture-in-picture-anything",
    name: "Picture-in-Picture Anything",
    subtitle: "Extensão de navegador",
    summary: "Extensão com funcionalidade Picture-in-Picture.",
    kind: "personal",
    repository: "https://github.com/SirGusttavo/picture-in-picture-anything",
    todo: [
      "Verificar histórico, créditos e origem do código antes de apresentar como autoria integral.",
    ],
  },
];
