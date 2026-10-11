"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TIERS } from "@/lib/three/quality";
import { on, stage, type Tier } from "@/lib/three/store";
import Avatar from "./Avatar";
import CameraRig from "./CameraRig";
import FloatingObjects from "./FloatingObjects";
import Lighting from "./Lighting";
import Particles from "./Particles";

/** Pauses rendering whenever the layer is invisible; one still frame under reduced motion. */
function FrameloopController() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const sync = () => {
      if (stage.reducedMotion) {
        setFrameloop("demand");
        invalidate();
      } else {
        setFrameloop(stage.opacity > 0 && !document.hidden ? "always" : "never");
      }
    };
    sync();
    const offVisibility = on("visibility", sync);
    const offReady = on("scene:ready", sync);
    // On-demand mode (reduced motion): render again whenever the pose or lighting changes.
    const offFrame = on("frame", () => {
      if (stage.reducedMotion) invalidate();
    });
    document.addEventListener("visibilitychange", sync);
    return () => {
      offVisibility();
      offReady();
      offFrame();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [setFrameloop, invalidate]);

  return null;
}

export default function HeroScene({ tier }: { tier: Tier }) {
  const cfg = TIERS[tier];
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={cfg.dpr}
      gl={{ antialias: cfg.antialias, alpha: true, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 30, near: 0.1, far: 60, position: [0, 1.6, 8] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.02;
      }}
    >
      <CameraRig />
      <Lighting />
      <Avatar />
      <FloatingObjects capacity={cfg.blocks} />
      <Particles count={cfg.particles} />
      <FrameloopController />
    </Canvas>
  );
}
