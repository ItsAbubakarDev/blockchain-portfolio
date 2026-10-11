"use client";

import { useEffect, useRef } from "react";
import { loadingSnapshot, subscribeLoading } from "@/lib/loading";

/**
 * Shown only if the intro hands over before the 3D is ready (slow connections):
 * real progress of the remaining assets, replaced by the live chain readout once the scene runs.
 */
export default function SceneStatus({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = () => {
      const html = document.documentElement;
      const { progress, label } = loadingSnapshot();
      const waiting = html.classList.contains("is-ready") && html.dataset.scene !== "live" && progress < 1;
      el.style.visibility = waiting ? "visible" : "hidden";
      if (waiting) el.textContent = `3D scene · ${label.toLowerCase()} ${String(Math.floor(progress * 100)).padStart(2, "0")}%`;
    };
    write();
    const unsub = subscribeLoading(write);
    const mo = new MutationObserver(write);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-scene"] });
    return () => {
      unsub();
      mo.disconnect();
    };
  }, []);

  return <span ref={ref} className={className} style={{ visibility: "hidden" }} />;
}
