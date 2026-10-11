"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register once for the whole app. Importing this module is the only way components get gsap.
gsap.registerPlugin(ScrollTrigger, useGSAP);

// Shared easing vocabulary — mirrors the CSS custom properties in globals.css.
export const EASE = {
  out: "expo.out",
  inOut: "power3.inOut",
  snap: "power2.out",
} as const;

export const DUR = {
  micro: 0.18,
  short: 0.26,
  comp: 0.56,
  cine: 1.1,
} as const;

export { gsap, ScrollTrigger, useGSAP };
