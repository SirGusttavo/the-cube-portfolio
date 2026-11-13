"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { useWindows } from "@/contexts/WindowManager";
import { APPS } from "./apps";
import { WindowFrame } from "./WindowFrame";

/** Janelas ficam montadas enquanto abertas (mesmo minimizadas) para preservar o estado. */
export function WindowLayer() {
  const { t } = useI18n();
  const { state } = useWindows();
  return (
    <>
      {state.order.map((id, index) => {
        const win = state.windows[id];
        if (!win) return null;
        const { icon, Content } = APPS[id];
        return (
          <WindowFrame
            key={id}
            id={id}
            title={t(`apps.${id}`)}
            icon={icon}
            win={win}
            zIndex={20 + index}
            focused={state.focused === id}
          >
            <Content />
          </WindowFrame>
        );
      })}
    </>
  );
}
