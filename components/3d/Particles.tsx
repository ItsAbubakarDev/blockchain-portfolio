"use client";

import { useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Particles as Dust } from "@/lib/three/Particles";
import { stage } from "@/lib/three/store";

/** Sparse dust in the light around the figure. */
export default function Particles({ count }: { count: number }) {
  const [dust] = useState(() => new Dust(count));
  const dpr = useThree((s) => s.viewport.dpr);

  useEffect(() => () => dust.dispose(), [dust]);
  useEffect(() => {
    dust.setPixelRatio(dpr);
  }, [dust, dpr]);

  useFrame((_, delta) => {
    dust.update(Math.min(delta, 0.05), stage.pointer.x, stage.pointer.y, stage.intro, !stage.reducedMotion);
  });

  return <primitive object={dust.points} />;
}
