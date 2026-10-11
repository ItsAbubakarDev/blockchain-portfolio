"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type Props = { term: string; definition: string; children: ReactNode };

/**
 * A technical word with a plain definition one tap away. Built on the Popover API: the button is
 * a popovertarget, so tap / click / Enter toggle it, Esc and outside clicks dismiss it, and only
 * one is open at a time — with or without JS. JS adds placement next to the word and, on a fine
 * pointer, a hover preview. The popover lives in the top layer, so panels never clip it.
 */
export default function Term({ term, definition, children }: Props) {
  const id = useId();
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const viaHover = useRef(false);

  useEffect(() => {
    const btn = btnRef.current;
    const pop = popRef.current;
    if (!btn || !pop) return;

    const place = () => {
      const b = btn.getBoundingClientRect();
      const w = pop.offsetWidth;
      const h = pop.offsetHeight;
      const left = Math.max(16, Math.min(b.left, window.innerWidth - 16 - w));
      const below = b.bottom + 8;
      const top = below + h > window.innerHeight - 16 ? Math.max(16, b.top - 8 - h) : below;
      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;
    };

    const onToggle = (e: Event) => {
      const open = (e as ToggleEvent).newState === "open";
      if (open) {
        place();
        window.addEventListener("scroll", place, { passive: true });
        window.addEventListener("resize", place);
      } else {
        viaHover.current = false;
        window.removeEventListener("scroll", place);
        window.removeEventListener("resize", place);
      }
    };
    pop.addEventListener("toggle", onToggle);

    // Hover preview only where a real hover exists; touch uses the tap.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let timer = 0;
    const isOpen = () => pop.matches(":popover-open");
    const enter = () => {
      window.clearTimeout(timer);
      if (isOpen()) return;
      timer = window.setTimeout(() => {
        viaHover.current = true;
        pop.showPopover();
      }, 120);
    };
    const leave = () => {
      window.clearTimeout(timer);
      if (!viaHover.current) return;
      timer = window.setTimeout(() => {
        if (viaHover.current && isOpen()) pop.hidePopover();
      }, 160);
    };
    if (fine) {
      for (const el of [btn, pop]) {
        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointerleave", leave);
      }
    }

    return () => {
      window.clearTimeout(timer);
      pop.removeEventListener("toggle", onToggle);
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
      for (const el of [btn, pop]) {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
      }
    };
  }, []);

  // A click on a hover-opened term pins it open instead of toggling it shut.
  const onClick = (e: React.MouseEvent) => {
    if (viaHover.current) {
      e.preventDefault();
      viaHover.current = false;
    }
  };

  return (
    <>
      <button ref={btnRef} type="button" popoverTarget={id} className="term" onClick={onClick}>
        {children}
        <span className="sr-only"> (definition)</span>
      </button>
      <span ref={popRef} id={id} popover="auto" className="term-pop">
        <span className="t-label block text-mute">{term}</span>
        <span className="mt-1.5 block">{definition}</span>
      </span>
    </>
  );
}
