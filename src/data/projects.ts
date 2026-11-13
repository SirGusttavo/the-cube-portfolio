import type { Project } from "@/types/content";

/**
 * Estrutura dos projetos. Descrições, resultados e avisos ficam em i18n.
 * Tipos foram verificados em repositório público (README e página do GitHub).
 */
export const projects: readonly Project[] = [
  {
    id: "flow",
    textKey: "flow",
    name: "FLOW",
    kind: "professional",
    repository: "https://github.com/SirGusttavo/python_automation_process",
    // Lista do README do repositório (nem tudo está na lista geral de tecnologias).
    technologies: [
      "Python",
      "Selenium",
      "SAP GUI Scripting",
      "pywin32 / COM",
      "pandas",
      "openpyxl",
      "xlwings",
      "Tkinter",
      "Excel",
    ],
    modules: [
      { id: "pgr", name: "PGR Orchestrator" },
      { id: "sap", name: "SAP Bridge" },
      { id: "lot", name: "Lot Miner" },
      { id: "prod", name: "Prod Forge" },
      { id: "visconf", name: "VISCONF Engine" },
      { id: "techlyst", name: "Techlyst" },
    ],
  },
  {
    id: "python-course",
    textKey: "pythonCourse",
    name: "Python Course",
    kind: "learning",
    repository: "https://github.com/SirGusttavo/python-course",
  },
  {
    id: "picture-in-picture-anything",
    textKey: "pip",
    name: "Picture-in-Picture Anything",
    // A página do GitHub aponta `boryssey/picture-in-picture-anything` como projeto pai.
    kind: "fork",
    repository: "https://github.com/SirGusttavo/picture-in-picture-anything",
    originalRepository: "https://github.com/boryssey/picture-in-picture-anything",
  },
];
