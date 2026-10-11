---
name: typography
description: Type system for the portfolio — Archivo (variable width) + IBM Plex Mono, fluid scale tokens, line-height/tracking per role, loading via next/font, and typographic details. Use for any text styling decision.
---

# Typography

Typography is the primary design element. The hero headline, not the 3D, is the LCP element and the
first thing read.

## 1. Families

| Role | Family | Settings | Why |
|---|---|---|---|
| Display | **Archivo** (variable: `wght` 100–900, `wdth` 62–125) | `wdth` **72**, `wght` **600**, uppercase | Semi-condensed grotesk = poster/industrial editorial. Width axis lets huge sizes fit narrow columns. |
| Text / UI | **Archivo** | `wdth` 100, `wght` 400 / 500 | Same family keeps the page coherent; one font file. |
| Metadata | **IBM Plex Mono** | 400 / 500, uppercase for labels | Documentation heritage (technical manuals), not "hacker" mono. |

- **Maximum three weights on the page:** 400, 500, 600. No 700/800/900. No light weights.
- No third family. No serif accent (Instrument Serif et al. are an AI-landing-page trend).
- Loading: `next/font/google` — `Archivo({ subsets:['latin'], axes:['wdth'], variable:'--font-archivo', display:'swap' })`
  and `IBM_Plex_Mono({ weight:['400','500'], subsets:['latin'], variable:'--font-plex-mono', display:'swap' })`.
  next/font self-hosts and generates a size-adjusted fallback → no CLS from font swap.
- Width is set with `font-stretch: 72%` (maps to `wdth`), falling back to
  `font-variation-settings: "wdth" 72` only if `font-stretch` fails in testing.

## 2. Scale (fluid, CSS custom properties in `globals.css`)

Live Figure additions: `--fs-name` (hero name, `clamp(3.4rem, min(12.2vw, 15vh), 10.5rem)` → desktop
`min(8.4vw, 15.5vh)` capped at 9.75rem, Archivo wdth 72, weight 600, line-height .84) and `--fs-role`
(rotator, Archivo regular width, weight 500). The rotator animates per character through a mask with a
6–8 px blur; never a typing effect.


| Token | Value | Use |
|---|---|---|
| `--fs-label` | `0.6875rem` (11px) → `0.75rem` ≥ 1024px | mono labels, captions, indices |
| `--fs-small` | `0.875rem` | secondary UI, chips |
| `--fs-body` | `clamp(1rem, 0.96rem + 0.2vw, 1.125rem)` | paragraphs |
| `--fs-lead` | `clamp(1.1875rem, 1.05rem + 0.6vw, 1.625rem)` | intro paragraphs |
| `--fs-h3` | `clamp(1.75rem, 1.2rem + 2vw, 3rem)` | project titles in body, role titles |
| `--fs-h2` | `clamp(2.75rem, 1.2rem + 6.4vw, 8.5rem)` | section statements |
| `--fs-display` | `clamp(3.5rem, min(11vw, 15.5vh), 13rem)` | hero only |

The hero uses `min(vw, vh)` so all four lines + intro fit above the fold on 1440×900 and 1366×768.

## 3. Line-height, tracking, case

| Role | line-height | letter-spacing | case |
|---|---|---|---|
| Display / h2 | 0.86 | -0.01em | UPPERCASE |
| h3 | 0.95 | -0.005em | UPPERCASE (condensed) |
| Lead | 1.35 | -0.005em | Sentence |
| Body | 1.55 | 0 | Sentence |
| Mono label | 1.4 | +0.08em | UPPERCASE |
| Mono value (dates, codes) | 1.4 | +0.02em | as-is, `tabular-nums` |

## 4. Rules

- **Never center body text.** Left-aligned, ragged right. Centering is reserved for nothing on this site.
- **Measure**: paragraphs `max-width: 62ch`; lead `max-width: 40ch`.
- **Display line breaks are manual.** Each line is a span (`.line > span`) so it can be mask-revealed.
  Lines must make sense alone: `I BUILD / SYSTEMS / THAT MOVE / VALUE.`
- `text-wrap: balance` on h2/h3; `text-wrap: pretty` on paragraphs.
- Emphasis inside display type is done with the **signal dot** (the accent full stop) — never with
  colored words or gradient text. In body, emphasis is `--bone` vs `--mute`, not bold.
- Numerals in dates, indices, durations: `font-variant-numeric: tabular-nums`.
- Ranges use en dash with thin spaces: `Jul 2025 – Feb 2026`. Arrows are real glyphs: `→ ↓ ↗`.
- Apostrophes are typographic (`’`). In JSX write them as the literal character.
- Mono labels are short (≤ 4 words). If a label needs a sentence, it isn't a label.
- Links inside prose: `--bone`, 1px underline at 40% opacity, offset 0.2em; hover underline 100%.
- No `text-shadow`, no outline/stroked text, no all-caps paragraphs.

## 5. Hierarchy per viewport

Each viewport should have at most: **one** display/h2 mass, **one** lead/h3, body, and mono metadata.
If two huge headlines are visible together, demote one.

## 6. Accessibility

- Body never below 16px. Mono labels at 11px are metadata only — anything essential at 11px must
  also exist at body size elsewhere or be ≥ 4.5:1 (`--mute` on `--ink` is 5.6:1, OK).
- Uppercase is applied with CSS `text-transform`, not typed in caps, so screen readers read words
  normally (exception: acronyms like API, EVM, RPC, OCR).
- Display text that is split into line spans keeps its accessible name: the `<h1>` contains the spans
  directly; never `aria-hidden` a heading's visible text and duplicate it.
