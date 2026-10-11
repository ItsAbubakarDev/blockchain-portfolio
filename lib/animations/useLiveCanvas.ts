"use client";

import { useEffect, type RefObject } from "react";

export type CanvasScene = {
  /** Called on mount and on every resize, with CSS-pixel dimensions. */
  resize?(w: number, h: number): void;
  /** Draw one frame. `t` is seconds the scene has been running, `dt` the step. */
  draw(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number): void;
};

export const INK = "#0b0b0a";
export const BONE = "#ece7dc";
export const MUTE = "#8e897f";
export const FAINT = "#5c5851";
export const SIGNAL = "#ff5a1f";
export const STEEL = "#8fa3af";
export const RULE = "rgba(236,231,220,0.12)";

/** The mono family next/font registered, for canvas text. */
export function monoFont(size: number, weight = 400) {
  const family = getComputedStyle(document.documentElement).getPropertyValue("--font-plex-mono").trim() || "ui-monospace, monospace";
  return `${weight} ${size}px ${family}`;
}

/**
 * Runs a 2D canvas scene only while it is on screen. DPR-aware, resizes with its box,
 * waits for fonts, and under reduced motion advances the simulation off-screen and paints
 * one representative still frame instead of animating.
 */
export function useLiveCanvas(ref: RefObject<HTMLCanvasElement | null>, create: () => CanvasScene) {
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const scene = create();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let t = 0;
    let visible = false;
    let warmed = false;

    const paint = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      scene.draw(ctx, w, h, t, dt);
    };

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      t += dt;
      paint(dt);
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    const start = () => {
      if (raf || reduced || !w) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };

    const still = () => {
      // Step the simulation forward so the still frame shows things in motion, mid-flow.
      for (let i = 0; i < 240; i++) {
        t += 1 / 30;
        scene.draw(ctx, w, h, t, 1 / 30);
      }
      paint(0);
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene.resize?.(w, h);
      if (!warmed) {
        // Run a few seconds of simulation first, so the visual is already mid-flow when seen.
        warmed = true;
        for (let i = 0; i < 150; i++) {
          t += 1 / 30;
          scene.draw(ctx, w, h, t, 1 / 30);
        }
      }
      if (reduced) still();
      else if (!raf) paint(0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { rootMargin: "120px 0px" },
    );
    io.observe(canvas);
    document.fonts?.ready.then(resize);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
    // `create` is a stable module-level factory for each visual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}
