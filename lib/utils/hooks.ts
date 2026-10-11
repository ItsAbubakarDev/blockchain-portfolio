"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribe to a media query. `serverValue` is what SSR and hydration assume;
 * choose the value that is safest to render before JS knows the truth.
 */
export function useMediaQuery(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Defaults to `true` on the server so nothing animates before we know. */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)", true);
}

export function useFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)", false);
}
