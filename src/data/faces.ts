import type { CubeFaceConfig } from "@/types/content";

/**
 * Mapeamento face → categoria. Consumido pela cena 3D (Fase 2/3) e pela
 * navegação alternativa acessível, para que as duas nunca divirjam.
 */
export const faces: readonly CubeFaceConfig[] = [
  {
    id: "projects",
    index: 1,
    label: "PROJECTS",
    hint: "Explore my work",
    position: "front",
  },
  {
    id: "tech",
    index: 2,
    label: "TECH STACK",
    hint: "Tools I build with",
    position: "top",
  },
  {
    id: "experience",
    index: 3,
    label: "EXPERIENCE",
    hint: "Professional path",
    position: "right",
  },
  { id: "about", index: 4, label: "ABOUT", hint: "Who I am", position: "left" },
  {
    id: "playground",
    index: 5,
    label: "PLAYGROUND",
    hint: "Experiments and studies",
    position: "bottom",
  },
  { id: "contact", index: 6, label: "CONTACT", hint: "Get in touch", position: "back" },
];
