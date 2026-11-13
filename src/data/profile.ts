import type { Profile } from "@/types/content";
import data from "./profile.json";

/**
 * Fonte única das informações pessoais. O mesmo `profile.json` é lido pelo
 * gerador de PDF em Python (scripts/build_resume.py).
 */
export const profile: Profile = {
  ...data,
  tagline: "Build. Debug. Improve.",
};
