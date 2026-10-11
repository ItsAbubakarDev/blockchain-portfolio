---
name: motion-design
description: Motion principles, duration/easing tokens, library split (CSS vs GSAP/ScrollTrigger vs Lenis vs R3F), the loader → hero choreography, and the reduced-motion policy. Use before adding any animation.
---

# Motion Design

## 1. Principles

1. **Motion explains**: arrival, causality, state change, progression or position. "It looks nice" is not a reason.
2. **One cinematic thing at a time** per viewport. At rest only the figure (breathing/looking), the ring
   and the visible project simulation move.
3. **Reversible when it represents position** (scroll-scrubbed); **once** when it represents arrival.
4. Text is readable within ~600 ms of entering the viewport.

## 2. Tokens (CSS in `globals.css`, JS in `lib/animations/gsap.ts`)

| Token | Value |
|---|---|
| `--dur-micro` / `--dur-short` / `--dur-comp` / `--dur-cine` | 180 / 260 / 560 / 1100 ms |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` (GSAP `expo.out`) |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` (GSAP `power3.inOut`) |
| `--ease-snap` | `cubic-bezier(0.2, 0, 0, 1)` |

Stagger 70–90 ms, max ~6 items. Entrances move ≤ 28 px (or a line height through a mask).

## 3. Library split

| Need | Tool |
|---|---|
| Hover, focus, reveals (`data-reveal`), hero intro (`data-intro`, keyed to `html.is-ready`) | CSS + one IntersectionObserver |
| Scroll-scrubbed values (scene progress, word reveal, showcase stacking, timeline rail) | GSAP ScrollTrigger |
| Timelines (loader exit, rotator characters, magnetic buttons via `quickTo`) | GSAP |
| Smooth wheel scrolling | Lenis (desktop fine pointer only), driven by `gsap.ticker` |
| 3D | R3F `useFrame` → plain classes |

Motion (Framer) is not installed: nothing unmounts with an exit animation.

## 4. First five seconds

```
0        loader: chain syncs with real progress; large counter
≥1.3 s   100% → counter rises out, blocks collapse, curtain lifts (1.1 s)
+0.5 s   html.is-ready: label (120 ms) · name lines rise (200/290 ms) · rotator first word (≈550 ms)
         · sentence + CTAs (650/760 ms) · nav (700–900 ms) · bottom rail (950 ms)
         scene: rim lights first, then key; camera dollies in; figure rises (2.6 s)
+~2 s    ring begins appending blocks; rotator changes after 1.4 s, then every 2.6 s
```

## 5. Reduced motion

Loader is a 200 ms fade; reveals become opacity-only; scrubbed effects are skipped (content fully
visible); Lenis and the custom cursor are off; rotator static; simulations render one representative
still frame; 3D is a single correct frame.
