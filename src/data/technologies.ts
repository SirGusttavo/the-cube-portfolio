import type { TechCategoryId, Technology } from "@/types/content";

export const techCategoryOrder: readonly TechCategoryId[] = [
  "development",
  "automation",
  "data",
  "tools",
];

/**
 * `usedIn` só aparece onde há evidência pública (README do FLOW). As demais
 * ficam sem classificação até Gustavo informar: pessoal, estudo ou em andamento.
 */
export const technologies: readonly Technology[] = [
  { id: "python", name: "Python", category: "development", usedIn: ["flow"] },
  { id: "java", name: "Java", category: "development" },
  { id: "cpp", name: "C++", category: "development" },
  { id: "javascript", name: "JavaScript", category: "development" },
  { id: "selenium", name: "Selenium", category: "automation", usedIn: ["flow"] },
  {
    id: "sap-gui-scripting",
    name: "SAP GUI Scripting",
    category: "automation",
    usedIn: ["flow"],
  },
  { id: "pywin32", name: "pywin32", category: "automation", usedIn: ["flow"] },
  { id: "tkinter", name: "Tkinter", category: "automation", usedIn: ["flow"] },
  { id: "powershell", name: "PowerShell", category: "automation" },
  { id: "pandas", name: "pandas", category: "data", usedIn: ["flow"] },
  { id: "excel", name: "Excel", category: "data", usedIn: ["flow"] },
  { id: "openpyxl", name: "openpyxl", category: "data", usedIn: ["flow"] },
  { id: "sql", name: "SQL", category: "data" },
  { id: "mysql", name: "MySQL", category: "data" },
  { id: "power-bi", name: "Power BI", category: "data" },
  { id: "git", name: "Git", category: "tools" },
  { id: "github", name: "GitHub", category: "tools" },
  { id: "vscode", name: "VS Code", category: "tools" },
];
