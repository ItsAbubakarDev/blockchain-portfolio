"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type * as THREE from "three";
import { applyEnvironment } from "@/lib/three/environment";
import { stage } from "@/lib/three/store";
import { damp, smoothstep } from "@/lib/utils/math";

/**
 * Cinematic three-point setup: warm key from front-left, signal-orange rim from behind right,
 * cool steel rim from behind left. Lights come up in sequence during the intro and drift
 * slightly with the pointer so the figure feels lit by a real room.
 */
export default function Lighting() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const cool = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.HemisphereLight>(null);
  const shift = useRef(0);

  useEffect(() => applyEnvironment(gl, scene, 0.3), [gl, scene]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const intro = stage.intro;
    // Rim lights first (silhouette), then key and fill (form).
    const rimIn = smoothstep(0.0, 0.55, intro);
    const keyIn = smoothstep(0.25, 1.0, intro);
    shift.current = damp(shift.current, stage.reducedMotion ? 0 : stage.pointer.x, 2, dt);
    if (key.current) {
      key.current.intensity = 1.55 * keyIn;
      key.current.position.x = -3.6 + shift.current * 0.8;
    }
    if (rim.current) rim.current.intensity = 5.2 * rimIn;
    if (cool.current) cool.current.intensity = 2.4 * rimIn;
    if (fill.current) fill.current.intensity = 0.22 * keyIn;
  });

  return (
    <>
      <directionalLight ref={key} color="#fff1e4" position={[-3.6, 2.8, 2.6]} intensity={0} />
      <directionalLight ref={rim} color="#ff5a1f" position={[3.2, 1.6, -2.6]} intensity={0} />
      <directionalLight ref={cool} color="#8fa3af" position={[-3.6, 1.2, -2.2]} intensity={0} />
      <hemisphereLight ref={fill} color="#d9d3c7" groundColor="#0b0b0a" intensity={0} />
    </>
  );
}
