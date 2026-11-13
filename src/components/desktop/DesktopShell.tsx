"use client";

import { useCallback, useEffect, useState } from "react";
import { CubeSceneLoader } from "@/components/cube/CubeSceneLoader";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { BackgroundGrid } from "@/components/effects/BackgroundGrid";
import { Footer } from "@/components/interface/Footer";
import { Header } from "@/components/interface/Header";
import { WindowLayer } from "@/components/windows/WindowLayer";
import { useWindows } from "@/contexts/WindowManager";
import { faces } from "@/data/faces";
import { profile } from "@/data/profile";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { usePlatform } from "@/hooks/usePlatform";
import { useI18n } from "@/i18n/I18nProvider";
import type { FaceId } from "@/types/content";
import { CubeTooltip } from "./CubeTooltip";
import { Taskbar } from "./Taskbar";

/** Monta o ambiente: cubo ao fundo, janelas por cima, barra de tarefas e central de comandos. */
export function DesktopShell() {
  const { t } = useI18n();
  const wm = useWindows();
  const platform = usePlatform();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Permite estilizar chrome específico do Windows (fonte do sistema) via CSS.
  useEffect(() => {
    document.documentElement.dataset.os = platform;
  }, [platform]);

  useGlobalShortcuts({
    paletteOpen,
    togglePalette: () => setPaletteOpen((o) => !o),
    openApp: wm.open,
    closeActive: wm.closeActive,
  });

  const { open } = wm;
  const onSelectFace = useCallback(
    (face: FaceId) => open(faces.find((f) => f.id === face)!.app),
    [open],
  );

  return (
    <>
      <h1 className="sr-only">
        {profile.name} — {t("header.role")}
      </h1>
      <BackgroundGrid />
      <CubeSceneLoader ariaLabel={t("cube.aria")} onSelectFace={onSelectFace} />
      <CubeTooltip />
      <Header />
      <Footer />
      <WindowLayer />
      <Taskbar onOpenPalette={() => setPaletteOpen(true)} />
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </>
  );
}
