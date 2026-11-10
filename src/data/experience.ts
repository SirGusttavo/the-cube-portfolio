import type { EducationEntry, ExperienceEntry } from "@/types/content";

export const experience: readonly ExperienceEntry[] = [
  {
    id: "suzano",
    organization: "Suzano S.A.",
    // TODO(Gustavo): a spec cita "Engenharia de Processos" e também pede para não
    // te apresentar como engenheiro. Usei "Controle de Processos"; confirme o título.
    role: "Jovem Aprendiz — Aprendiz de Controle de Processos",
    area: "Controle de Produção / Automação de Processos Industriais",
    period: "2025–2026",
    deliverables: ["flow"],
  },
];

export const education: readonly EducationEntry[] = [
  {
    id: "etec",
    institution: "ETEC Presidente Vargas",
    program: "Técnico em Automação Industrial",
  },
  {
    id: "cruzeiro-do-sul",
    institution: "Universidade Cruzeiro do Sul",
    program: "Tecnólogo em Ciência de Dados",
    note: "Início em 2026.",
  },
];
