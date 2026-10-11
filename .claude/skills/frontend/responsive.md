---
name: responsive
description: Breakpoints, test widths, viewport-unit rules, touch replacements and intentional mobile layouts per section. Use when implementing or reviewing any layout.
---

# Responsive Design

## 1. Breakpoints & test matrix

Tailwind v4 defaults: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.
Every section is checked at: **320, 375, 390, 430, 768, 1024, 1440, 1920** (and 1366×768 for the
hero fold). Check both orientations at 768/1024.

Custom variants (declared in `globals.css` with `@custom-variant`):
- `hover-fine:` → `@media (hover: hover) and (pointer: fine)` — every hover-only style uses this.
- `motion-safe` / `motion-reduce` built-ins for animation differences.

## 2. Viewport units

- Hero `min-height: 100svh` (small viewport: never hidden under mobile browser chrome).
- The WebGL canvas covers its stage element, not the viewport, so mobile address-bar changes never resize it.
- Never `100vh` on mobile layouts. Never `100vw` widths (scrollbar overflow).
- `env(safe-area-inset-*)` padding on the fixed header and the mobile menu.

## 3. Mobile is designed, not shrunk

Live Figure specifics (Oct 2026):
- Portrait (`< 768px` or aspect `< 0.8`): figure centred high, text block at the bottom, canvas only in the
  hero, stronger bottom vignette; upright tablets lift the figure and step the camera back.
- Narrow landscape (4:3): camera steps back and pushes the figure aside so the ring clears the copy.
- Project simulations switch to a portrait layout under 520 px (short labels, stacked state/log, event
  stream above the document). The canvas box carries the aspect ratio (4:4.6 / 16:10) so captions never squeeze it.
- Showcase stacking only at ≥1024 × 720; experience rail dimming only on desktop.
- Verified with no horizontal overflow at 320, 375, 390, 768, 1024×768, 1366×768, 1440×900, 1920×1080.

### Previous table

| Section | Desktop | Mobile (< 768) |
|---|---|---|
| Header | wordmark · indexed links · ISB clock | wordmark · `Menu` button → full-screen overlay with large links (h2 scale), clock in overlay |
| Hero | headline left, 3D right/behind, caption bottom-right | headline full-width; 3D figure *below* headline in its own region (aspect 4:3); caption beneath; low tier |
| About | 3 numbered columns + spec sheet offset | single column; spec sheet rows label-over-value |
| Work index | table row: № · title · domain · stack | № + title, domain on second line; stack hidden |
| Case study | steps + sticky diagram | diagram transposed to vertical flow, placed above steps, not sticky; steps stacked |
| Experience | rows + sticky inspector | accordion rows; first (current) open by default |
| Stack | 5 columns + SVG patch cables | stacked categories, wrapping chips; selection highlights related chips + readout; no cables |
| Principles | 2×2 offset grid | list |
| Contact | huge statement + spec sheet | statement at h2 min size; email on its own line with `overflow-wrap:anywhere`; big tap targets |

## 4. Touch rules

- Tap targets ≥ 44×44px (pad small links with `padding-block` rather than enlarging text).
- No hover-only disclosure anywhere: every hover reveal also opens on tap/focus.
- No custom cursor, no Lenis, no proximity effects on touch (`pointer: coarse`).
- Avoid `:hover` styles leaking to touch (use the `hover-fine:` variant).

## 5. Fluid type & spacing

- All type sizes are `clamp()` tokens (see typography). No per-breakpoint font-size soup.
- Section padding is a `clamp()` token. Grid margins/gutters change at md and lg only.

## 6. SVG diagrams

- Diagrams are generated from grid coordinates. On < 768px the layout **transposes** (columns ↔ rows)
  so flows read top→bottom and labels stay ≥ 10px rendered. One data source, two orientations.
- `viewBox` + `width: 100%` + `height: auto`; never fixed pixel widths.

## 7. Overflow checklist (each width)

- No horizontal scrollbar (`document.documentElement.scrollWidth === innerWidth`).
- Long words in display type: condensed width + `hyphens: manual`; if a single word exceeds the
  column at 320px, reduce `--fs-display` min rather than breaking the word.
- Chips/tags wrap (`flex-wrap`), never scroll horizontally.
