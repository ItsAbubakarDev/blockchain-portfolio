"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";

/**
 * Page-wide scroll effects declared with data attributes, so sections stay server components:
 *  - [data-scrub-words]  words brighten in reading order as the paragraph crosses the viewport
 *  - [data-stack]        project showcases: the card underneath recedes as the next one slides over
 *  - [data-parallax="n"] gentle vertical drift (n = fraction of the element's height)
 * Everything is reversible (scrubbed), and nothing runs under reduced motion.
 */
export default function ScrollAnimations() {
  // A stacked case study only sticks if its content fits the panel; a taller one would trap its
  // own last lines behind the next card, so it scrolls normally instead ([data-overflow]).
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-stack]"));
    const measure = () => {
      let changed = false;
      for (const card of cards) {
        const text = card.querySelector<HTMLElement>(".showcase__text");
        const inner = card.querySelector<HTMLElement>("[data-stack-inner]");
        if (!text || !inner) continue;
        // Measure in the sticky (fixed-height) state, so an unstuck card can stick again. The text
        // column grows with its content; the fixed-height panel around it is what would clip.
        const was = card.hasAttribute("data-overflow");
        card.removeAttribute("data-overflow");
        const fixed = getComputedStyle(card).position === "sticky";
        const over = fixed && text.scrollHeight > inner.clientHeight + 1;
        if (over) card.setAttribute("data-overflow", "");
        if (over !== was) changed = true;
      }
      if (changed) ScrollTrigger.refresh();
    };
    measure();
    document.fonts?.ready.then(measure);
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Opening or closing a <details> layer changes the page height under every trigger below it.
  useEffect(() => {
    let raf = 0;
    const onToggle = (e: Event) => {
      if (!(e.target instanceof HTMLDetailsElement)) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    document.addEventListener("toggle", onToggle, true);
    return () => {
      document.removeEventListener("toggle", onToggle, true);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      document.querySelectorAll("[data-scrub-words] .w").forEach((w) => w.classList.add("on"));
      return;
    }

    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>("[data-scrub-words]").forEach((el) => {
        const words = Array.from(el.querySelectorAll(".w"));
        let lit = -1;
        ScrollTrigger.create({
          trigger: el,
          start: "top 82%",
          end: "bottom 45%",
          onUpdate: (self) => {
            const n = Math.round(self.progress * words.length);
            if (n === lit) return;
            lit = n;
            words.forEach((w, i) => w.classList.toggle("on", i < n));
          },
        });
      });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (min-height: 720px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-stack]");
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          const inner = card.querySelector<HTMLElement>("[data-stack-inner]") ?? card;
          gsap.to(inner, {
            scale: 0.93,
            opacity: 0.35,
            filter: "blur(2px)",
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top top+=96", scrub: true },
          });
        });
      });

      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax) || 0.08;
        gsap.fromTo(
          el,
          { yPercent: amount * 100 },
          {
            yPercent: -amount * 100,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    });

    // Layout can shift after fonts swap in; re-measure once.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => ctx.revert();
  }, []);

  return null;
}
