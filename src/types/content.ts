/** Tipos de conteúdo do portfólio. Mantidos separados da lógica 3D de propósito. */

export type FaceId =
  "projects" | "tech" | "experience" | "about" | "playground" | "contact";

/** Posição física da face no cubo (a orientação pode ser ajustada na Fase 2). */
export type FacePosition = "front" | "top" | "right" | "left" | "bottom" | "back";

export interface CubeFaceConfig {
  id: FaceId;
  /** Número exibido nos identificadores editoriais: 01 / PROJECTS */
  index: number;
  label: string;
  /** Texto curto do tooltip de hover. */
  hint: string;
  position: FacePosition;
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  positioning: string;
  github: string;
  linkedin: string;
  email: string;
}

export interface ProjectModule {
  id: string;
  name: string;
  summary: string;
  /** Preencher na Fase 4, depois de ler a documentação pública do repositório. */
  technologies: string[];
  /** Somente resultados comprovados. Vazio = nada a exibir. */
  results: string[];
  notes?: string[];
}

export interface Project {
  id: string;
  name: string;
  subtitle: string;
  summary: string;
  kind: "professional" | "learning" | "personal";
  repository: string;
  modules?: ProjectModule[];
  /** Ressalvas de autoria/origem que a interface deve exibir ou respeitar. */
  attribution?: string[];
  /** Pendências de verificação antes de publicar. */
  todo?: string[];
}

export interface ExperienceEntry {
  id: string;
  organization: string;
  role: string;
  area: string;
  period: string;
  /** IDs de projetos em `projects.ts` entregues nesta etapa. */
  deliverables: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  program: string;
  note?: string;
}

export type TechCategoryId = "development" | "automation" | "data" | "tools";

export interface Technology {
  id: string;
  name: string;
  category: TechCategoryId;
  /**
   * Como a tecnologia foi usada. Deliberadamente opcional: só preencher com
   * informação confirmada (profissional / pessoal / em estudo).
   */
  provenance?: "professional" | "personal" | "learning";
}
