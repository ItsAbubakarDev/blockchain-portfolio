"use client";

import { useEffect, useRef } from "react";
import { on, stage } from "@/lib/three/store";

/** Live count of blocks the 3D ring has appended since the page opened. */
export default function ChainHeight() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const write = () => {
      if (ref.current && stage.height) ref.current.textContent = String(stage.height).padStart(4, "0");
    };
    write();
    return on("block", write);
  }, []);
  return <span ref={ref}>0000</span>;
}
