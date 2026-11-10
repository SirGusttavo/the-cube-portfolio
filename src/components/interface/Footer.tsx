import { Mail } from "lucide-react";
import { siGithub } from "simple-icons";
import { BrandIcon } from "./BrandIcon";
import { Instructions } from "./Instructions";
import { profile } from "@/data/profile";

const linkClass =
  "grid size-10 place-items-center rounded-lg border border-line/70 text-ink-secondary transition-colors hover:border-accent hover:text-accent";

export function Footer() {
  return (
    <footer className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-5 px-5 py-6 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4 md:px-10 md:py-8">
      <p className="hidden font-mono text-[10px] tracking-[0.3em] text-ink-muted uppercase md:block">
        {profile.tagline}
      </p>
      <div className="md:col-start-2 md:justify-self-center">
        <Instructions />
      </div>
      <nav
        aria-label="Links externos"
        className="flex items-center gap-2 md:col-start-3 md:justify-self-end"
      >
        <a
          href={profile.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub (abre em nova aba)"
          className={linkClass}
        >
          <BrandIcon path={siGithub.path} className="size-[18px]" />
        </a>
        {/* lucide-react 1.x e simple-icons não incluem a marca do LinkedIn; usamos o monograma "in". */}
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn (abre em nova aba)"
          className={linkClass}
        >
          <span aria-hidden className="font-display text-[15px] leading-none font-bold">
            in
          </span>
        </a>
        <a
          href={`mailto:${profile.email}`}
          aria-label="Enviar e-mail"
          className={linkClass}
        >
          <Mail aria-hidden className="size-[18px]" />
        </a>
      </nav>
    </footer>
  );
}
