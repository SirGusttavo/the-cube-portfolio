import type { TechCategoryId, Technology } from "@/types/content";

export const techCategories: Record<TechCategoryId, string> = {
  development: "Desenvolvimento",
  automation: "Automação e integração",
  data: "Dados",
  tools: "Ferramentas",
};

/**
 * `provenance` fica indefinido de propósito: a spec exige diferenciar uso
 * profissional, pessoal e em estudo, mas não informa qual é qual.
 */
export const technologies: readonly Technology[] = [
  { id: "python", name: "Python", category: "development" },
  { id: "java", name: "Java", category: "development" },
  { id: "cpp", name: "C++", category: "development" },
  { id: "javascript", name: "JavaScript", category: "development" },
  { id: "selenium", name: "Selenium", category: "automation" },
  { id: "sap-gui-scripting", name: "SAP GUI Scripting", category: "automation" },
  { id: "pywin32", name: "pywin32", category: "automation" },
  { id: "tkinter", name: "Tkinter", category: "automation" },
  { id: "powershell", name: "PowerShell", category: "automation" },
  { id: "pandas", name: "pandas", category: "data" },
  { id: "excel", name: "Excel", category: "data" },
  { id: "openpyxl", name: "openpyxl", category: "data" },
  { id: "sql", name: "SQL", category: "data" },
  { id: "mysql", name: "MySQL", category: "data" },
  { id: "power-bi", name: "Power BI", category: "data" },
  { id: "git", name: "Git", category: "tools" },
  { id: "github", name: "GitHub", category: "tools" },
  { id: "vscode", name: "VS Code", category: "tools" },
];
