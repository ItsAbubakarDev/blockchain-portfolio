import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

const easeInOutExpo = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

/** Scroll to a section, move focus there, and update the hash — with or without Lenis. */
export function scrollToId(id: string) {
  const target = id === "top" ? document.body : document.getElementById(id);
  if (!target) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const focusTarget = () => {
    const el = id === "top" ? document.getElementById("top") : target;
    if (!el) return;
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };

  if (lenis) {
    lenis.scrollTo(id === "top" ? 0 : target, {
      duration: 1.2,
      easing: easeInOutExpo,
      onComplete: focusTarget,
    });
  } else {
    if (id === "top") window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    window.setTimeout(focusTarget, reduced ? 0 : 600);
  }
  history.replaceState(null, "", id === "top" ? window.location.pathname : `#${id}`);
}
