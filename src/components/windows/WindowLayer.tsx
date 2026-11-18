"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { useWindows } from "@/contexts/WindowManager";
import { windowLayout } from "@/lib/windows/reducer";
import { APPS } from "./apps";
import { WindowFrame } from "./WindowFrame";

/**
 * Janelas ficam montadas enquanto abertas (mesmo minimizadas) para preservar o estado.
 * A ordem de renderização é estável; o empilhamento é só por z-index (ver `windowLayout`).
 */
export function WindowLayer() {
  const { t } = useI18n();
  const { state } = useWindows();
  return (
    <>
      {windowLayout(state).map(({ id, win, zIndex }) => {
        const { icon, Content } = APPS[id];
        return (
          <WindowFrame
            key={id}
            id={id}
            title={t(`apps.${id}`)}
            icon={icon}
            win={win}
            zIndex={zIndex}
            focused={state.focused === id}
          >
            <Content />
          </WindowFrame>
        );
      })}
    </>
  );
}
