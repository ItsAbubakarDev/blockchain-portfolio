"use client";

import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { CameraRig as Rig } from "@/lib/three/CameraRig";
import { stage } from "@/lib/three/store";

/** Section poses + pointer parallax + intro dolly. Registered first so others read a fresh camera. */
export default function CameraRig() {
  const [rig] = useState(() => new Rig());

  useFrame((state, delta) => {
    rig.update(state.camera as PerspectiveCamera, Math.min(delta, 0.05), {
      aspect: state.size.width / Math.max(1, state.size.height),
      hero: stage.scroll.hero,
      about: stage.scroll.about,
      contact: stage.scroll.contact,
      pointerX: stage.pointer.x,
      pointerY: stage.pointer.y,
      intro: stage.reducedMotion ? 1 : stage.intro,
      portrait: stage.portrait,
      phone: state.size.width < 768,
      still: stage.reducedMotion,
    });
  });

  return null;
}
