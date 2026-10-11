"use client";

import { useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ChainRing } from "@/lib/three/ChainRing";
import { emit, stage } from "@/lib/three/store";
import { smoothstep } from "@/lib/utils/math";

/**
 * The floating objects are a chain: blocks linked in sequence, orbiting the figure.
 * A block is appended every few seconds; the counter in the hero reads the same event.
 */
export default function FloatingObjects({ capacity }: { capacity: number }) {
  const [ring] = useState(() => new ChainRing(capacity, 6));
  const size = useThree((s) => s.size);

  useEffect(() => {
    stage.height = ring.initialLength;
    emit("block");
    ring.setOnAppend(() => {
      stage.height += 1;
      emit("block");
    });
    return () => ring.dispose();
  }, [ring]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const intro = stage.intro;
    // Blocks begin appending only once the figure is lit.
    ring.update(dt, !stage.reducedMotion && intro > 0.6);
    // Scrolling into About opens the ring a little, as if the camera passes through it.
    const { hero, about, contact } = stage.scroll;
    // Narrow landscape and upright tablets have less room beside the copy.
    const aspect = size.width / Math.max(1, size.height);
    const narrow = stage.portrait ? smoothstep(0.55, 0.8, aspect) * 0.6 : smoothstep(1.6, 1.3, aspect) * 0.5;
    const tight = Math.max(smoothstep(0.04, 0.3, about), smoothstep(0, 0.8, contact), narrow);
    const open = smoothstep(0, 0.6, hero) * (1 - tight);
    ring.setPose(0.2 + 0.85 * smoothstep(0.2, 0.9, intro), open, tight);
  });

  return <primitive object={ring.group} />;
}
