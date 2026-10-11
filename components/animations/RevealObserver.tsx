"use client";

import { useEffect } from "react";

/**
 * One IntersectionObserver for every [data-reveal] element on the page.
 * Server components opt in with a data attribute instead of a client wrapper.
 */
export default function RevealObserver() {
  useEffect(() => {
    const reveal = (el: Element) => el.classList.add("is-in");
    const pending = document.querySelectorAll("[data-reveal]:not(.is-in)");

    if (!("IntersectionObserver" in window)) {
      pending.forEach(reveal);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    pending.forEach((el) => io.observe(el));

    // Safety net: never leave above-the-fold content hidden.
    const safety = window.setTimeout(() => {
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
      });
    }, 2500);

    return () => {
      window.clearTimeout(safety);
      io.disconnect();
    };
  }, []);

  return null;
}
