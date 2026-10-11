import type { Tier } from "./store";

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

export type TierConfig = {
  dpr: [number, number];
  antialias: boolean;
  particles: number;
  blocks: number;
};

export const TIERS: Record<Tier, TierConfig> = {
  high: { dpr: [1, 1.75], antialias: true, particles: 260, blocks: 12 },
  medium: { dpr: [1, 1.5], antialias: true, particles: 160, blocks: 12 },
  low: { dpr: [1, 1.5], antialias: true, particles: 80, blocks: 10 },
};

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Decide once, before the canvas mounts, how much 3D this device gets.
 * "off" keeps the poster frame (no WebGL, Save-Data, or reduced data).
 * `?quality=high|medium|low|off` overrides detection for testing.
 */
export function detectTier(): Tier | "off" {
  if (typeof window === "undefined") return "off";

  const override = new URLSearchParams(window.location.search).get("quality");
  if (override === "off") return "off";
  if (override === "high" || override === "medium" || override === "low") {
    return hasWebGL2() ? override : "off";
  }

  const nav = navigator as NavigatorExtras;
  if (nav.connection?.saveData) return "off";
  if (window.matchMedia("(prefers-reduced-data: reduce)").matches) return "off";
  if (!hasWebGL2()) return "off";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const width = window.innerWidth;
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;

  if (coarse || width < 768 || memory <= 2 || cores < 4) return "low";
  if (width < 1280 || memory <= 4 || cores <= 4) return "medium";
  return "high";
}
