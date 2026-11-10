"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { cameraDistance } from "@/lib/cube/camera";

/** Reenquadra o cubo quando o viewport muda (desktop, tablet, retrato no celular). */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const aspect = useThree((s) => s.size.width / s.size.height);

  useLayoutEffect(() => {
    // Mutação imperativa da câmera é o uso esperado no R3F.
    camera.position.set(0, 0, cameraDistance(aspect, camera.fov));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, aspect]);

  return null;
}
