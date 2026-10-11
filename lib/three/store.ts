// Mutable state shared between the DOM (scroll, pointer, UI) and the WebGL scene.
// Plain numbers written by listeners and read inside the render loop: no React state per frame.

export type Tier = "high" | "medium" | "low";

export const stage = {
  /** Pointer in normalised device coordinates (-1..1), y up. */
  pointer: { x: 0, y: 0, active: false, lastMove: 0 },
  /** Scroll progress through the sections the scene reacts to (0..1 each). */
  scroll: { hero: 0, about: 0, exit: 0, contact: 0 },
  /** Opacity of the canvas layer, derived from scroll. */
  opacity: 1,
  /** 0 → 1 once the loader has handed over to the hero (drives the entrance). */
  intro: 0,
  /** Index of the focus area hovered in About (-1 = none). */
  focus: -1,
  /** Blocks appended to the ring since the page opened. */
  height: 0,
  /** Narrow/portrait framing. */
  portrait: false,
  reducedMotion: false,
};

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

/** Low-frequency events only (scene ready, block appended, intro start). */
export function on(event: string, fn: Listener) {
  let set = listeners.get(event);
  if (!set) listeners.set(event, (set = new Set()));
  set.add(fn);
  return () => {
    set.delete(fn);
  };
}

export function emit(event: string) {
  listeners.get(event)?.forEach((fn) => fn());
}
