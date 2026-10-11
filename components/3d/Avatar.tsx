"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { AvatarRig } from "@/lib/three/AvatarRig";
import { fetchAvatar } from "@/lib/three/assets";
import { emit, on, stage } from "@/lib/three/store";
import { completeTask, reportTask } from "@/lib/loading";
import { clamp, lerp, smoothstep } from "@/lib/utils/math";

const HEAD_WORLD = new THREE.Vector3(0, 1.56, 0);
const ndc = new THREE.Vector3();

/**
 * Loads the avatar GLB (already being fetched by the stage), compiles its shaders before the
 * first visible frame, and drives the rig: the head follows the pointer, eyes blink, the chest
 * breathes. When the pointer is idle the figure wanders and glances at new blocks.
 */
export default function Avatar() {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const [rig, setRig] = useState<AvatarRig | null>(null);
  const weight = useRef(0);

  useEffect(() => {
    let disposed = false;
    let created: AvatarRig | null = null;
    (async () => {
      const buffer = await fetchAvatar();
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      const gltf = await loader.parseAsync(buffer, "");
      if (disposed) return;
      reportTask("compile", 0.4);
      created = new AvatarRig(gltf.scene);
      // Compile against the lit scene so the first frame doesn't hitch.
      await gl.compileAsync(gltf.scene, camera, scene);
      if (disposed) return;
      setRig(created);
      completeTask("compile");
      emit("scene:ready");
      invalidate();
    })().catch((err) => {
      console.error("[avatar]", err);
      completeTask("compile");
      emit("scene:error");
    });
    return () => {
      disposed = true;
      created?.dispose();
    };
  }, [gl, camera, scene, invalidate]);

  useEffect(() => {
    if (!rig) return;
    return on("block", () => {
      if (!stage.pointer.active) rig.glance(0.55);
    });
  }, [rig]);

  useFrame((state, delta) => {
    if (!rig) return;
    const dt = Math.min(delta, 0.05);
    const still = stage.reducedMotion;
    const now = performance.now();

    // Follow the pointer while it is moving; fade back to idle wander after a few seconds.
    const recent = stage.pointer.active && now - stage.pointer.lastMove < 3500;
    weight.current += ((recent ? 1 : 0) - weight.current) * (1 - Math.exp(-(recent ? 6 : 1.2) * dt));

    // Look direction relative to where the head is on screen.
    ndc.copy(HEAD_WORLD).project(state.camera);
    let x = clamp((stage.pointer.x - ndc.x) * 0.95, -1, 1);
    let y = clamp((stage.pointer.y - ndc.y) * 0.95, -1, 1);
    // In About the copy sits to the figure's left (screen right): bias the gaze toward it.
    const reading = smoothstep(0.06, 0.3, stage.scroll.about) * (1 - smoothstep(0.0, 0.5, stage.scroll.contact));
    x = lerp(x, Math.max(x, 0.55), reading * 0.7);
    y = lerp(y, -0.1, reading * 0.4);

    rig.update(dt, { x, y, weight: Math.max(weight.current, reading * 0.8) }, still);
    rig.entrance(still ? 1 : stage.intro);
  });

  return rig ? <primitive object={rig.root} /> : null;
}
