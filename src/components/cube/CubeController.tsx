"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import {
  CLICK_THRESHOLD_MOUSE,
  CLICK_THRESHOLD_TOUCH,
  DRAG_SENSITIVITY,
  INITIAL_YAW,
  TILT,
  WHEEL_SENSITIVITY,
} from "@/lib/cube/constants";
import { interaction } from "@/lib/cube/interactionStore";
import {
  beginDrag,
  createRotationState,
  dragBy,
  endDrag,
  nudge,
  rotationConfig,
  stepRotation,
  type KeyInput,
} from "@/lib/cube/rotation";

interface CubeControllerProps {
  target: RefObject<Group | null>;
  /** Elemento focável que recebe ponteiro, roda e teclado. */
  root: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
}

const ARROWS: Record<string, keyof KeyInput> = {
  ArrowLeft: "yaw",
  ArrowRight: "yaw",
  ArrowUp: "pitch",
  ArrowDown: "pitch",
};

/**
 * Liga eventos de ponteiro/roda/teclado à física de `lib/cube/rotation.ts`.
 *
 * Não usa setPointerCapture: com captura, o `click` seria entregue ao elemento
 * raiz e o R3F nunca veria o clique nos blocos. Os listeners de movimento ficam
 * na `window` durante o arraste.
 */
export function CubeController({ target, root, reducedMotion }: CubeControllerProps) {
  const state = useRef(createRotationState(INITIAL_YAW, TILT));
  const keys = useRef<KeyInput>({ yaw: 0, pitch: 0 });
  const config = useMemo(() => rotationConfig(reducedMotion), [reducedMotion]);
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const s = state.current;
    const pressed = new Set<string>();

    let activePointer: number | null = null;
    let pointerType = "mouse";
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointer) return;
      const dt = Math.max((e.timeStamp - lastT) / 1000, 0.001);
      dragBy(
        s,
        (e.clientX - lastX) * DRAG_SENSITIVITY,
        (e.clientY - lastY) * DRAG_SENSITIVITY,
        dt,
        configRef.current,
      );
      s.dragDistance = Math.hypot(e.clientX - startX, e.clientY - startY);
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = e.timeStamp;
    };

    const stop = (e: PointerEvent) => {
      if (e.pointerId !== activePointer) return;
      activePointer = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      const threshold =
        pointerType === "touch" ? CLICK_THRESHOLD_TOUCH : CLICK_THRESHOLD_MOUSE;
      endDrag(s, (e.timeStamp - lastT) / 1000, threshold);
      interaction.dragging = false;
      interaction.wasDrag = s.wasDrag; // lido pelo onClick dos blocos, que dispara depois
    };

    const onDown = (e: PointerEvent) => {
      if (activePointer !== null) return; // ignora o segundo dedo
      if (e.pointerType === "mouse" && e.button !== 0) return;
      activePointer = e.pointerId;
      pointerType = e.pointerType;
      startX = lastX = e.clientX;
      startY = lastY = e.clientY;
      lastT = e.timeStamp;
      beginDrag(s);
      interaction.dragging = true;
      interaction.wasDrag = false;
      interaction.setHover(null);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", stop);
      window.addEventListener("pointercancel", stop);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinça do trackpad = zoom do navegador
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : 1;
      const clampPx = (v: number) => Math.max(-120, Math.min(120, v * unit));
      nudge(
        s,
        clampPx(e.deltaX) * WHEEL_SENSITIVITY,
        clampPx(e.deltaY) * WHEEL_SENSITIVITY,
        configRef.current,
      );
    };

    const syncKeys = () => {
      keys.current = {
        yaw: (pressed.has("ArrowRight") ? 1 : 0) - (pressed.has("ArrowLeft") ? 1 : 0),
        pitch: (pressed.has("ArrowDown") ? 1 : 0) - (pressed.has("ArrowUp") ? 1 : 0),
      };
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.key in ARROWS) || e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      pressed.add(e.key);
      syncKeys();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (pressed.delete(e.key)) syncKeys();
    };
    const onBlur = () => {
      pressed.clear();
      syncKeys();
    };
    const onHover = () => {
      el.style.cursor = interaction.getHoverFace() ? "pointer" : "";
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("keydown", onKeyDown);
    el.addEventListener("keyup", onKeyUp);
    el.addEventListener("blur", onBlur);
    const unsubscribe = interaction.subscribe(onHover);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("keyup", onKeyUp);
      el.removeEventListener("blur", onBlur);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      unsubscribe();
    };
  }, [root]);

  useFrame((_, delta) => {
    // Delta limitado: ao voltar de uma aba em segundo plano ele pode ser enorme.
    const dt = Math.min(delta, 0.1);
    stepRotation(state.current, dt, configRef.current, keys.current);
    target.current?.rotation.set(state.current.pitch, state.current.yaw, 0);
  });

  return null;
}
