---
name: threejs-interaction
description: Pointer, idle, scroll and reduced-motion behaviour of the 3D figure and ring — input plumbing, look-at maths, damping constants and touch behaviour.
---

# Three.js Interaction

## 1. Input plumbing

- `SceneStage` owns all listeners and writes plain numbers to `lib/three/store.ts` (`stage`):
  `pointer {x, y, active, lastMove}` (NDC, y up), `scroll {hero, about, exit, contact}` (0..1 from
  ScrollTrigger), `opacity`, `intro`, `portrait`, `reducedMotion`, `height` (chain height).
- Low-frequency events go through `on/emit`: `scene:ready`, `intro`, `block`, `visibility`, `frame`.
- No React state changes per frame. Never attach OrbitControls or capture wheel/touch.

## 2. Look-at

- Project the head point `(0, 1.56, 0)` to NDC every frame; look target = pointer − head (×0.95, clamped).
- Weight follows pointer activity: rises fast (λ 6) on movement, decays slowly (λ 1.2) after 3.5 s idle,
  blending into an idle wander (two slow sines). New block + idle pointer → 1.4 s glance toward it.
- In About the gaze is biased toward the copy (screen right) so the figure reads it.
- Damping everywhere: `damp(a, b, λ, dt) = a + (b − a)(1 − e^(−λ dt))`. Head λ 4.2, camera λ 3.2,
  parallax λ 2.6, key-light drift λ 2.

## 3. Touch & small screens

- Tap = brief look toward the tap (no hover). Lower particle count, same scene.
- Portrait: canvas fades out over hero progress .25–.70; no About/Contact return.

## 4. Reduced motion

- `frameloop="demand"`; rigs run with `still = true` (no wander, blink or breathing, camera snaps).
- The scene re-renders on `frame` events (intro set, scroll pose changes) so the still frame is correct.
- Ring does not append; the hero chain counter stays at its starting height.

## 5. Restraint

- Rotation limits are small (yaw ±29°, pitch ±13°). Nothing spins continuously; the ring moves one slot
  per append (1.2 s, ease in-out) plus a gentle per-block tumble.
- Flashes: one block, once per 6 s, decaying over 2.4 s (well under 3 flashes/s).
