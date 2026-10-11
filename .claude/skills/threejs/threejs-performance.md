---
name: threejs-performance
description: WebGL budgets, quality tiers, loading pipeline (real progress), frameloop control, allocation and disposal rules, and the no-WebGL poster for the Live Figure scene. Follow for every Three.js change.
---

# Three.js Performance

## 1. Budgets (measured Oct 2026, production build)

| Metric | Budget | Measured |
|---|---|---|
| Lazy 3D chunk (three + R3F + scene) | ≤ 280 KB gz, never in the initial route | 263 KB |
| Avatar GLB | ≤ 300 KB, ≤ 45k tris | 279 KB (≈206 KB over the wire), 37.7k tris |
| Draw calls | ≤ 25 | ≈20 (avatar meshes + ring 3 + dust 1) |
| Textures | 0 downloaded | 0 (environment generated on the GPU) |
| Post-processing / shadows | none | none |

## 2. Quality tiers (`lib/three/quality.ts`, decided once before mount)

`off` (no WebGL2, Save-Data, prefers-reduced-data) → poster image · `low` (coarse pointer, < 768 px,
≤ 2 GB, < 4 cores) · `medium` (< 1280 px, ≤ 4 GB/cores) · `high`. Override with `?quality=…`.

| Tier | DPR | Particles | Blocks |
|---|---|---|---|
| high | 1–1.75 | 260 | 12 |
| medium | 1–1.5 | 160 | 12 |
| low | 1–1.5 | 80 | 10 |

## 3. Loading pipeline (the loader shows real progress)

`lib/loading.ts` tasks: `fonts` .12 · `chunk` .30 · `model` .38 (streamed byte progress) · `compile` .20.
At hydration `SceneStage` starts the GLB fetch (`lib/three/assets.ts`) **and** the dynamic import of
`HeroScene` in parallel. `Avatar` parses with GLTFLoader + MeshoptDecoder and calls
`renderer.compileAsync` before the first visible frame. The loader never waits more than 4 s
(slow networks: the hero arrives first, `SceneStatus` shows remaining progress, the figure lights up
when ready). Min loader time 1.3 s first visit, 0.45 s repeat (sessionStorage).

## 4. Render loop

- `frameloop` `always` only while the layer has opacity > 0 and the tab is visible; otherwise `never`.
  Reduced motion: `demand` + `invalidate()` on `frame` events.
- Delta is clamped to 50 ms everywhere.

## 5. Allocation & disposal

- Per-frame code allocates nothing: scratch vectors/matrices/colours are class fields; ring pruning
  (array filter) happens once per append, not per frame.
- Classes own their GPU resources and expose `dispose()`; R3F wrappers call it on unmount.
  `applyEnvironment` returns a cleanup that disposes the PMREM target.

## 6. No-WebGL poster

`public/images/avatar-poster.webp` (40 KB, transparent) is a still of the same scene, shown by
`SceneStage` for tier `off`. Regenerate it whenever the avatar or lighting changes (screenshot the
canvas with everything else hidden, encode WebP), so the fallback never drifts from the live scene.

## 7. Measure

Production build only (`npm run build && npm start`): LCP, CLS, long tasks, and the network waterfall
(3D chunk and GLB must start after first paint). Desktop measured: LCP 0.12 s, CLS 0. Throttled mobile
(4× CPU, slow 4G): LCP 0.8 s, CLS 0.
