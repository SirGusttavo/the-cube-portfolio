/** Tipos de conteúdo do portfólio. Textos traduzíveis ficam em `src/i18n/locales`. */

export type FaceId =
  "projects" | "tech" | "experience" | "about" | "playground" | "contact";

/** Posição física da face no cubo. */
export type FacePosition = "front" | "top" | "right" | "left" | "bottom" | "back";

/** Áreas que abrem como janela. */
export type AppId = "projects" | "tech" | "experience" | "about" | "terminal" | "contact";

export interface CubeFaceConfig {
  id: FaceId;
  /** Número exibido nos identificadores editoriais: 01 / PROJETOS */
  index: number;
  position: FacePosition;
  /** Janela aberta ao clicar na face. */
  app: AppId;
}

export interface Profile {
  name: string;
  githubUser: string;
  github: string;
  linkedin: string;
  email: string;
  /** Assinatura da marca; não é traduzida. */
  tagline: string;
}

/** Quanto ao vínculo do repositório com o autor. Nunca assumir autoria sem confirmação. */
export type ProjectKind = "professional" | "learning" | "personal" | "fork";

/** Chave de texto em `projects.*` nos dicionários. */
export type ProjectTextKey = "flow" | "pythonCourse" | "pip";

export interface ProjectModule {
  id: "pgr" | "sap" | "lot" | "prod" | "visconf" | "techlyst";
  name: string;
}

export interface Project {
  id: string;
  textKey: ProjectTextKey;
  name: string;
  kind: ProjectKind;
  repository: string;
  /** Para forks: repositório do autor original. */
  originalRepository?: string;
  /** Nomes de tecnologia exibidos como estão (não traduzidos). */
  technologies?: string[];
  modules?: ProjectModule[];
}

export interface ExperienceEntry {
  id: string;
  organization: string;
  /** IDs de projetos em `projects.ts` entregues nesta etapa. */
  deliverables: string[];
}

export interface EducationEntry {
  id: "etec" | "cruzeiro";
  institution: string;
  textKey: "etec" | "cruzeiro";
}

export type TechCategoryId = "development" | "automation" | "data" | "tools";

export interface Technology {
  id: string;
  name: string;
  category: TechCategoryId;
  /**
   * Projetos em que o uso está documentado. Deliberadamente opcional: só
   * preenchido com evidência. Sem barras de proficiência.
   */
  usedIn?: string[];
}
