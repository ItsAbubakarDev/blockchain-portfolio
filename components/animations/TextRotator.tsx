"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animations/gsap";
import { on } from "@/lib/three/store";

type Props = { words: readonly string[]; interval?: number; className?: string };

/**
 * Rotates role titles character by character: the outgoing word lifts and blurs out of a mask,
 * the next rises in and sharpens. Decorative (aria-hidden) — the full list is in the DOM as text.
 * Pauses off-screen, in background tabs and on hover; static under reduced motion.
 */
export default function TextRotator({ words, interval = 2.6, className = "" }: Props) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let i = 0;
    let timer = 0;
    let visible = true;
    let hovered = false;
    let started = false;
    let busy = false;

    const render = (word: string) => {
      root.textContent = "";
      const chars: HTMLSpanElement[] = [];
      for (const ch of word) {
        const span = document.createElement("span");
        span.className = "rot-char";
        span.textContent = ch === " " ? " " : ch;
        root.appendChild(span);
        chars.push(span);
      }
      return chars;
    };

    const next = () => {
      if (busy) return;
      busy = true;
      const out = Array.from(root.children);
      gsap.to(out, {
        yPercent: -105,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.42,
        ease: "power3.in",
        stagger: 0.012,
        onComplete: () => {
          i = (i + 1) % words.length;
          if (indexRef.current) indexRef.current.textContent = String(i + 1).padStart(2, "0");
          const chars = render(words[i]);
          gsap.fromTo(
            chars,
            { yPercent: 105, opacity: 0, filter: "blur(8px)" },
            {
              yPercent: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.02,
              onComplete: () => {
                gsap.set(chars, { clearProps: "filter" });
                busy = false;
                schedule();
              },
            },
          );
        },
      });
    };

    let first = true;
    const schedule = () => {
      window.clearTimeout(timer);
      if (!started || !visible || hovered || document.hidden) return;
      // The first change comes quickly, so the rotation reads within the first few seconds.
      timer = window.setTimeout(next, (first ? 1.4 : interval) * 1000);
      first = false;
    };

    // First word arrives with the hero entrance, then rotation starts.
    const begin = () => {
      if (started) return;
      started = true;
      const chars = render(words[0]);
      gsap.fromTo(
        chars,
        { yPercent: 105, opacity: 0, filter: "blur(8px)" },
        { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "expo.out", stagger: 0.025, delay: 0.55, onComplete: schedule },
      );
    };
    const offIntro = on("intro", begin);
    if (document.documentElement.classList.contains("is-ready")) begin();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    io.observe(root);
    const host = root.closest("[data-rotator]") ?? root;
    const enter = () => {
      hovered = true;
      window.clearTimeout(timer);
    };
    const leave = () => {
      hovered = false;
      schedule();
    };
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", schedule);

    return () => {
      offIntro();
      window.clearTimeout(timer);
      io.disconnect();
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", schedule);
      gsap.killTweensOf(root.children);
    };
  }, [words, interval]);

  return (
    <span className={`rotator ${className}`} data-rotator>
      <span className="rotator__index t-label" aria-hidden="true">
        <span ref={indexRef}>01</span>/{String(words.length).padStart(2, "0")}
      </span>
      <span ref={rootRef} className="rotator__word" aria-hidden="true">
        {words[0]}
      </span>
      <span className="sr-only">{words.join(", ")}</span>
    </span>
  );
}
