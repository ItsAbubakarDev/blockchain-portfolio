---
name: scroll-animation
description: Lenis + GSAP ScrollTrigger setup, scroll-driven scene progress, data-attribute scroll effects (scrub words, stacked showcases, parallax), the experience rail, IO reveals, and scroll anti-patterns. Use for anything tied to scroll position.
---

# Scroll Animation

## 1. Lenis + ScrollTrigger (`components/animations/SmoothScroll.tsx`)

- Lenis only with `(hover: hover) and (pointer: fine)` and no reduced motion. Options:
  `{ lerp: 0.1, smoothWheel: true, autoRaf: false, anchors: false }`.
- One clock: `lenis.on("scroll", ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`,
  `gsap.ticker.lagSmoothing(0)`. Stopped while the loader or mobile menu is open.
- Anchor clicks are intercepted and routed through `scrollToId` (`lib/animations/scroll.ts`), which moves
  focus to the target section afterwards.
- GSAP plugins are registered once in `lib/animations/gsap.ts`; import gsap only from there.

## 2. Scene progress (`components/3d/SceneStage.tsx`)

ScrollTriggers write `stage.scroll`: `hero` (top top → bottom top), `about` (top bottom → bottom top),
`exit` (the `[data-scene-exit]` block in About, top 92% → top 45%), `contact` (top 85% → top 15%).
Layer opacity = max(1 − exit, contact fade-in); portrait = hero only. Camera and ring damp toward
these values, so native touch scrolling still eases.

## 3. Declarative effects (`components/animations/ScrollAnimations.tsx`)

| Attribute | Effect |
|---|---|
| `[data-scrub-words]` | words brighten in reading order (top 82% → bottom 45%); markup from `ScrubWords` (server) |
| `[data-stack]` + `[data-stack-inner]` | sticky project panels; the one underneath scales to .93, dims and blurs as the next slides over — only at ≥1024 px wide **and** ≥720 px tall |
| `[data-parallax="0.08"]` | gentle drift (fraction of own height) |

All scrubbed, all reversible, all skipped under reduced motion (words shown lit).

## 4. Experience rail (`components/sections/experience/Timeline.tsx`)

One trigger fills the rail (`scaleY`) and moves the signal dot; one per role sets the active role at the
62% line, which rolls the pinned year (CSS odometer, 1 s, per-digit 45 ms delay).

## 5. Entrance reveals

One IntersectionObserver (`RevealObserver`) adds `.is-in` to `[data-reveal]` (`lines`, `rule`, `frame`
variants). Hidden states only apply under `html.js`; a 2.5 s safety reveals anything above the fold.

## 6. Never

Scroll-jacking or snapping, horizontal scroll sections, pinned sections on phones, text that only appears
at a precise scroll position, layout reads inside scroll handlers.
