---
name: micro-interactions
description: Exact specs for links, buttons, nav indicator, copy-to-clipboard, focus rings, the custom cursor, and hover→touch equivalents. Use when building any interactive element.
---

# Micro-interactions

All micro-interactions use `--dur-micro` (180ms) or `--dur-short` (260ms) with `--ease-snap`.

## 1. Links

- **Inline/text links**: underline is a pseudo-element (`::after`, 1px, `currentColor`), resting at
  `scaleX(1)` and 35% opacity. Hover/focus: opacity 100%. No color change.
- **Nav / list links**: underline draws in from the left on hover (`transform-origin: left; scaleX 0→1`),
  and on leave retracts to the right (`transform-origin: right`). Achieve with two origin states.
- **Arrow links** (`→`, `↗`): arrow translates 4px in its direction on hover. External links use `↗`.

## 2. Buttons (CTAs) — `components/ui/Button.tsx`

- Two variants: `btn` (hairline) and `btn--solid` (bone fill; hover fills signal from the bottom).
- Static (no magnetic pointer-following since Oct 11 2026).

### Previous spec

- Shape: rectangular, 0–2px radius, 1px `--bone` border at 30%, height 48px (44px min touch target).
- Hover: background fills from bottom (`::before` scaleY 0→1, `--bone`), label inverts to `--ink`.
  260ms `--ease-snap`.
- Active/press: `scale(0.98)` for 120ms. No bounce.
- Primary CTA has the signal dot before the label; the dot does not animate.

## 3. Focus

- `:focus-visible` → `outline: 2px solid var(--signal); outline-offset: 3px;` on everything.
  Never remove outlines without this replacement. Not shown on mouse click (`:focus-visible`).
- On the paper section, outline color is `--ink`.

## 4. Nav active indicator

- Active section link: `--bone` text + a 6px square signal dot before the label. Inactive: `--mute`.
- Section change: the dot fades out/in (180ms) — no sliding pill (sliding pills read as template).
- Header is **persistent** (Oct 2026): it carries the contact action (`■ Contact` on phones,
  `■ Get in touch` from md), so it never hides on scroll. Contact is not repeated in the desktop nav list.
- After 40px scroll: background `rgb(11 11 10 / 0.72)` + `backdrop-filter: blur(10px)` + bottom hairline.

## 5. Copy-to-clipboard (email)

- Button next to the email: label `Copy` → `Copied` for 1600ms, then back. Signal dot appears
  while in "Copied" state. Announce via an `aria-live="polite"` region ("Email address copied").
- If `navigator.clipboard` is unavailable, the button is not rendered (mailto link remains).

## 6. Live clock (header / contact)

- Shows Islamabad time `HH:MM` + `UTC+5`, `tabular-nums`. Updates once per minute aligned to the
  minute boundary (`setTimeout` to next minute, then `setInterval(60_000)`). No seconds (seconds
  would be constant motion). Rendered client-side only after mount to avoid hydration mismatch.

## 7. Custom cursor — REMOVED (Oct 11 2026, owner request: "make the cursor movement simple")

The native cursor is used everywhere. `CustomCursor.tsx` and the magnetic `Button` motion are gone;
buttons keep only their hover fill. Kept below for history.

### Former spec — `components/ui/CustomCursor.tsx`

Update: labels come from `data-cursor-label` on any element (e.g. `"Live"` over simulations and the OCR
sample): the ring fills bone (scale 1.85) with the label in ink. No 3D node labels any more.

### Previous spec

- Enabled only when `(hover: hover) and (pointer: fine)` and reduced motion is off.
- Elements: a 6px bone dot (follows pointer exactly) + a 32px ring (follows with damping,
  `λ = 18`), both `position: fixed`, `pointer-events: none`, `aria-hidden`, `mix-blend-mode: difference`
  only on the dot.
- States (set by delegated `pointerover` on `[data-cursor]`, `a`, `button`):
  - default: ring 32px, 30% opacity
  - link/button: ring scales to 56px, 60% opacity, dot hides
  - `data-cursor="label"` + `data-cursor-label="…"`: ring becomes a small mono label pill
    (used for 3D node hover: `L2 · API`)
- Native cursor is **kept** over text inputs and anywhere `data-cursor="native"`. Otherwise hidden
  via `html.has-cursor * { cursor: none }` — only after the custom cursor has rendered its first frame.
- One rAF loop, writes `transform: translate3d()` directly; the loop sleeps when the pointer has not
  moved for 500ms and the ring has settled. Hide when pointer leaves the window.
- The cursor never carries information that isn't also in the DOM (3D node labels are decorative;
  the layer legend is the real content).

## 8. Hover → touch equivalents

| Desktop hover | Touch replacement |
|---|---|
| Experience row hover → inspector updates | Tap row → expands inline (accordion) |
| Stack tech hover → cables preview | Tap chip → select (toggle), readout updates |
| Case-study step hover → diagram highlight | Scroll position (IO) drives highlight |
| 3D node hover → label | Not available; tap sends a signal from the nearest node |
| Link underline draw | Underline always visible at 35% |

Use `@media (hover: hover) and (pointer: fine)` (Tailwind custom variant `hover-fine:`) for every
hover-only style so touch devices never get sticky hover states.
