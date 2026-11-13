import type { EducationEntry, ExperienceEntry } from "@/types/content";

export const experience: readonly ExperienceEntry[] = [
  { id: "suzano", organization: "Suzano S.A.", deliverables: ["flow"] },
];

export const education: readonly EducationEntry[] = [
  { id: "etec", institution: "ETEC Presidente Vargas", textKey: "etec" },
  { id: "cruzeiro", institution: "Universidade Cruzeiro do Sul", textKey: "cruzeiro" },
];
