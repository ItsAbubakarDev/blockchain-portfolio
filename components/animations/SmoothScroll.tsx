"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { scrollToId, setLenis } from "@/lib/animations/scroll";

/**
 * Lenis on desktop with a fine pointer; native scrolling on touch and under reduced motion.
 * Lenis is driven by GSAP's ticker so ScrollTrigger and the smooth scroll share one clock.
 * Also owns same-page anchor navigation so it behaves the same with or without Lenis.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    const raf = (time: number) => lenis?.raf(time * 1000);

    const setup = () => {
      lenis?.destroy();
      lenis = null;
      gsap.ticker.remove(raf);
      if (fine.matches && !reduced.matches) {
        lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: false, anchors: false });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        if (document.documentElement.classList.contains("is-loading")) lenis.stop();
      }
      setLenis(lenis);
    };
    setup();
    fine.addEventListener("change", setup);
    reduced.addEventListener("change", setup);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
      if (!anchor || anchor.target === "_blank") return;
      // Same-document hash links only: "#work" here, and "/#work" when already on "/".
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      const id = url.hash.slice(1);
      if (!id || (id !== "top" && !document.getElementById(id))) return;
      event.preventDefault();
      // The skip link should jump, not glide.
      if (anchor.classList.contains("skip-link")) {
        const target = document.getElementById(id)!;
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus();
        return;
      }
      scrollToId(id);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      fine.removeEventListener("change", setup);
      reduced.removeEventListener("change", setup);
      gsap.ticker.remove(raf);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
