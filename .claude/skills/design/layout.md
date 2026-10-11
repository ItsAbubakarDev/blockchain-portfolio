---
name: layout
description: Editorial grid, spacing scale, section anatomy and per-section desktop/mobile layouts for the portfolio. Use when placing anything on the page.
---

# Layout

## 1. Grid

| Range | Columns | Outer margin | Gutter |
|---|---|---|---|
| < 768px | 4 | 16px (`--margin`) | 16px |
| 768–1023px | 8 | 32px | 24px |
| ≥ 1024px | 12 | 48px (≥1440: 64px) | 32px |

- Container: full width minus margins, `max-width: 1760px`, centered. On 1920px the margins grow;
  the grid never stretches beyond 1760px.
- Implement with a `.grid-edit` utility: `display:grid; grid-template-columns: repeat(var(--cols), minmax(0,1fr)); column-gap: var(--gutter)`
  and Tailwind `col-span-*` / `col-start-*` per breakpoint (Tailwind v4 defaults: md = 768, lg = 1024, xl = 1280).
- `minmax(0,1fr)` always — plain `1fr` lets long words blow out columns and cause horizontal scroll.

## 2. Spacing scale (8px base)

`4 8 12 16 24 32 48 64 96 128 192` px. Section vertical padding:
`--section-y: clamp(6rem, 4rem + 8vw, 12rem)`. Inside sections, space between head and content:
`clamp(3rem, 2rem + 4vw, 6rem)`.

## 3. Section anatomy (identical everywhere)

```
§ 02   WORK                                                    07 PROJECTS
──────────────────────────────────────────────────────────────────────────────  ← full-bleed hairline
[ huge statement, cols 1–9 ]
                                   [ supporting copy, cols 7–12 or 8–12 ]
```

- Section head row: mono label left (`§ 0N` + name), mono meta right. Hairline below spans container.
- Every section is a `<section id aria-labelledby>`; its visible h2 is the statement.

## 4. Asymmetry rules

- The statement (h2) starts at column 1 and spans 8–10 columns. Never centered.
- Supporting text starts at column 5, 7 or 8 — **never at column 1 directly under the headline**
  on desktop. The offset creates the editorial diagonal.
- Leave at least 2 empty columns somewhere in every desktop section.
- Mobile collapses to a single column but keeps the *order* and the hierarchy, and keeps mono
  metadata on its own lines (not squeezed beside text).

## 5. Surfaces

- No cards. Structure = hairlines (`border-color: var(--rule)`), spacing and type.
- Radius: 0 for structural elements; 2px max for small chips/buttons; 999px only for the signal dot.
- No box-shadows. No backdrop-blur except the nav after scrolling (8px blur, ink at 70%).

## 6. z-index scale

`canvas: 0` · `content: 1` · `grain: 40` · `nav: 50` · `menu overlay: 60` · `cursor: 70` · `skip link: 80`.

## 7. Section layouts (Live Figure, Oct 2026 — supersedes older notes below where they differ)

- **Hero**: text column left 50% (label → name `--fs-name` → rotator → sentence → CTAs), figure right
  (3D, fixed layer). Bottom rail: links · scroll cue · current role + live chain height. Phones/upright
  tablets: figure top, text block bottom over the scene vignette.
- **About**: content in cols 6–12 (figure occupies the left half on desktop); principles full-width at the
  end (`data-scene-exit` — the figure leaves here).
- **Work**: statement + case-study index; four sticky showcase panels (5/7 split: argument | visual with
  Simulation/Architecture toggle, Result under the visual); Applied AI block with the OCR lab panel
  (stages | sample | output shape); "Also built" two-up.
- **Experience**: pinned rolling year cols 1–5, roles with progress rail cols 6–12. Phones: year inline.
- **Skills**: patch bay (5 columns + cables; stacked chips on phones).
- **Contact**: statement + email/links cols 1–7, figure returns on the right (desktop).

### Previous (Exploded View) layouts, kept for reference

**Hero** (`min-height: 100svh`)
- Desktop: meta row (4 mono items across cols 1–3 / 4–6 / 7–9 / 10–12). Headline in the left 50% at
  `--fs-display`. Intro paragraph (body size, 44ch) + CTAs under it. 3D figure anchored to the right 52%;
  the canvas covers the whole hero so the descent can bleed behind the text. Figure caption under the
  figure. No scroll cue (it collided with the CTAs and duplicated "Selected work ↓").
- Everything — headline, intro, CTAs, caption — must fit above the fold at 1440×900 and 1366×768.
- Mobile: meta row → 2 lines. Headline full width. Figure (3D or fallback) sits *below* the headline
  as a 4:3 region; caption under it. Intro after. No text over busy 3D on small screens.

**About**: statement cols 1–10. Three numbered columns (01/02/03) at cols 1–4 / 5–8 / 9–12 on
desktop, stacked on mobile. Spec sheet `<dl>` at cols 5–12 below, hairline rows.

**Work**: contents index (table-like list 01–07: number · title · domain · stack) cols 1–12. Then
each case study: header (number + huge title cols 1–10, summary cols 7–12), body = steps column
cols 1–5 + sticky diagram cols 6–12 (`position: sticky; top: calc(nav + 4vh)`). Mobile: diagram
(transposed, vertical) above the steps, not sticky.

**Experience**: time axis full width; rows (cols 1–7) with proportional bars; inspector panel
cols 8–12 sticky. Mobile: rows stack; details expand inline under the active row.

**Stack**: five columns (one per category) across 12 cols with an SVG overlay for patch cables.
Readout line spans full width below. Tablet: 3+2 grid, no cables. Mobile: categories stacked, chips wrap.

**Principles** (paper ground, full-bleed): statement cols 1–8; four principles in a 2×2 at
cols 5–12 on desktop (number, title, one sentence), list on mobile.

**Contact**: statement cols 1–11 at `--fs-h2`. Contact spec sheet (email / GitHub / LinkedIn /
location / local time) cols 5–12. Footer colophon row at the bottom with hairline above.

## 8. Overflow guard

- `html, body { overflow-x: clip; }` as a safety net, but never rely on it: test every section at
  320px. Long tokens (email, URLs) get `overflow-wrap: anywhere`.
- Full-bleed elements use `margin-inline: calc(var(--margin) * -1)` inside the container, never `100vw`
  (100vw includes the scrollbar → horizontal scroll on Windows).
