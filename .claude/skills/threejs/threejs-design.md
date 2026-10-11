---
name: threejs-design
description: Scene specification for the "Live Figure" hero — the baked avatar asset and its pipeline, the chain ring, dust, lighting, camera poses per section, and where 3D is not used. Read before writing any Three.js / R3F code.
---

# Three.js Design — the Live Figure

## 1. Where 3D is used

One fixed, full-viewport canvas (`components/3d/SceneStage.tsx`), behind content (`z-index: 0`,
`pointer-events: none`). Visible in **Hero → About** and again in **Contact**; opacity 0 (and the render
loop stopped) everywhere else. On portrait screens (phones, upright tablets) it belongs to the hero only.

Not 3D: project visuals (2D canvas simulations — legible text, cheap), architecture diagrams (SVG,
accessible), OCR lab (2D canvas, real pixels), timeline and patch bay (HTML).

## 2. The avatar asset

- `public/models/avatar.glb` (~280 KB, ~38k triangles, meshopt-compressed) is **generated** by
  `npm run avatar` → `scripts/avatar/build-avatar.mjs`. Sculpted parts are signed-distance functions in
  `scripts/avatar/character.mjs` (skin, hair, hoodie) meshed with Surface Nets (`mesher.mjs`);
  hard-surface parts (eyes, brows, mouth, glasses, headphones, drawstrings) are three.js geometry.
  Simplified with meshoptimizer, written with glTF-Transform. Materials use clearcoat (clay, eyes) and
  sheen (hair, fabric).
- **Node contract** used by `lib/three/AvatarRig.ts`: `Head` (pivot at the neck; rotates to look),
  `EyeL`/`EyeR` (scale Y to blink), `Body` (breathes). Common Ready Player Me / Mixamo names are also
  recognised, so a replacement GLB keeps head tracking. Replace the file, keep the names.
- It is an original character. Do not swap in a likeness of a real person or a known character.

## 3. Scene parts (each a plain class in `lib/three/`, wrapped by a thin R3F component)

| Part | Class | Notes |
|---|---|---|
| Avatar | `AvatarRig` | look-at (yaw ±0.5, pitch ±0.22, slight roll), blinks every 2.4–6 s (18% double), breathing, idle Lissajous wander, glance at new blocks, rises during intro |
| Chain ring | `ChainRing` | ≤12 rounded blocks on a tilted ellipse (r 1.3 × 0.98) at chest height; one InstancedMesh + 2 line buffers; append every 6 s (first ~2 s after lights-up); newest block flashes signal and lights the figure with a short-range point light |
| Dust | `Particles` | 80–260 points, all motion in the vertex shader, depth-scaled pointer parallax, 7% warm |
| Camera | `CameraRig` | section poses (below), pointer parallax (±4.5° az, ±2.6° el), intro dolly, all damped |
| Lights | `Lighting.tsx` | key/rim/rim/hemi + GPU-generated `RoomEnvironment` (no HDR download); intro brings rims up first, then key |

Renderer: ACES filmic, exposure 1.02, sRGB output, transparent clear, no post-processing, no shadows.

## 4. Camera poses

Landscape poses specify where the figure sits on screen (`sx`, NDC) and are resolved per aspect ratio
(narrower screens step back and push the figure further aside). Portrait poses centre the figure high.

| Pose | Landscape | Portrait |
|---|---|---|
| hero | figure right (`sx` .3), r 5.9, fov 30 | centred, high, fov 36 |
| about | figure left (`sx` −.48), az 26°, gaze biased toward the copy | — (canvas hidden) |
| contact | figure right (`sx` .53), closer | — |

Transitions are scroll-position driven (reversible): hero→about over About progress .06–.30; contact over
its trigger. The ring tightens (`tight`) whenever it shares the screen with copy.

## 5. Interaction

- Window-level `pointermove` → `stage.pointer` (NDC). Head look is computed relative to the head's
  projected screen position. Touch: a tap is a brief look.
- Pointer idle > 3.5 s → wander + glances. Reduced motion → still frame (`frameloop="demand"`).
- Never capture wheel/touch; the canvas never blocks text or links.
