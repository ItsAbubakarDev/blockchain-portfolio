---
name: accessibility
description: WCAG-oriented rules for this portfolio — document outline, landmarks, focus, widget patterns for the timeline/patch bay/case studies, canvas alternatives, contrast table, reduced motion and the test checklist.
---

# Accessibility

## 1. Document outline (Live Figure)

`h1` name (lines separated by a real space) → `h2` per section statement → `h3` focus areas,
principles, projects, roles, skill groups. Loader and canvas are `aria-hidden`; the rotator is
`aria-hidden` with the full role list as sr-only text. Showcase figures: the Architecture view is an
`svg role="img"` with the flow as `<desc>`; Simulation/Architecture are `aria-pressed` buttons. OCR stages
are `aria-pressed` buttons with an `aria-live` caption. Verified: 1 h1, no unnamed controls, no duplicate
ids, visible signal focus ring on every tab stop.

### Previous outline

```
<a class="skip-link" href="#main">Skip to content</a>
<header> nav (aria-label="Primary")
<main id="main">
  <section id="top" aria-labelledby="hero-title">       h1  I build systems that move value.
  <section id="about" aria-labelledby="about-title">    h2
  <section id="work">                                    h2, each project h3, steps h4
  <section id="experience">                              h2, each role h3
  <section id="stack">                                   h2, each category h3
  <section id="principles">                              h2, each principle h3
  <section id="contact">                                 h2
<footer>
```

- Exactly one `h1`. No skipped levels. Visual size is independent of heading level.
- Section ids double as nav anchors; sections are focusable targets (`tabindex="-1"`) after nav clicks.

## 2. Focus

- Global `:focus-visible { outline: 2px solid var(--signal); outline-offset: 3px }`; on paper: ink.
- Focus order follows visual order. The fixed header re-shows when it contains focus.
- `scroll-margin-top: calc(var(--nav-h) + 16px)` on sections so focused targets aren't hidden under the nav.
- Mobile menu: focus moves to the first link on open; `Esc` closes; focus returns to the toggle;
  background is `inert` while open.

## 3. Widget patterns

- **Experience timeline**: each role header is a `<button aria-expanded aria-controls>` inside an
  `h3`. The desktop inspector panel is **not** a live region (announcing on hover is noisy); it is the
  `aria-controls` target of the active button, so screen-reader users reach it by expanding the row
  and moving forward. Mobile renders the details inline under the row instead. Inline details
  (`lg:hidden`) and the panel (`hidden lg:block`) are never exposed at the same time —
  `display:none` removes the inactive copy from the accessibility tree.
- **Stack patch bay**: technologies are `<button aria-pressed>`; category lists are `<ul>` under h3.
  Selection updates a `role="status"` readout: "Solidity connects to Ethereum, BSC, Base, Polygon,
  Ethers.js." Cables are `aria-hidden` SVG. `Esc` clears selection.
- **Case-study steps**: plain content (`h4` + paragraph). The diagram is an `<svg role="img"
  aria-labelledby>` with a `<title>` + `<desc>` that lists the flow in text ("Client → Payment API →
  …"); the figure caption is visible text. Step highlighting is visual only, no announcements.
- **Copy email**: `<button>` with visible label; result announced via `aria-live="polite"`.
- **Depth** (technical layer): native `<details>/<summary>`, summary ≥ 44px, body never animates in. Keep
  headings outside the summary (summary flattens heading semantics).
- **Term** (annotation): `<button popovertarget>` + `popover="auto"` — tap/click/Enter toggles, Esc and
  outside click close, works without JS; JS only positions it and adds hover preview on fine pointers.
- **Contact form**: visible labels; errors linked with `aria-describedby` + `aria-invalid`, shown after
  blur or submit and cleared as soon as fixed; on submit with errors focus moves to the first invalid
  field and a polite live region counts them; success replaces the form and takes focus; failures use
  `role="alert"` and always offer the email address. Native validation + plain POST without JS.

## 4. Canvas / 3D

- The canvas wrapper is `aria-hidden="true"`; the canvas never receives focus.
- The hero `<figure>` has a visible `<figcaption>` describing the system in one sentence and a
  visible layer legend (L4 Users … L0 Chain) in HTML.
- The "Send a transaction" control is a real `<button>`, keyboard reachable, hidden when reduced motion
  is on or WebGL is unavailable.
- No information exists only in 3D, only on hover, or only in the custom cursor.

## 5. Contrast (WCAG 2.2 AA)

| Pair | Ratio | Allowed for |
|---|---|---|
| bone on ink | ~16:1 | everything |
| mute on ink | ~5.6:1 | body text, labels |
| signal on ink | ~6.3:1 | small text OK, states, focus |
| faint on ink | ~2.9:1 | **decoration only** (ornaments, inactive strokes) |
| ink on paper | ~16:1 | everything |
| paper-mute on paper | ~5.5:1 | body text |
| signal on paper | ~2.6:1 | **marks only** (dots/rules), never text |

Non-text UI (borders of buttons, focus indicators) must be ≥ 3:1 against adjacent colours.

## 6. Motion & sensory

- `prefers-reduced-motion` honoured globally (see motion-design §5) and in JS (3D, Lenis, cursor).
- No flashing > 3 per second. Signals flash blocks for 700ms at most once per arrival.
- No autoplaying audio. No content that moves for > 5s without being able to stop it, except the
  3D background, which is decorative, pauses off-screen, and is static under reduced motion.

## 7. Links & content

- Link text describes the destination (`GitHub — ItsAbubakarDev`, not "click here").
- External links: `target="_blank" rel="noopener noreferrer"` plus visually hidden "(opens in new tab)"
  and a `↗` glyph marked `aria-hidden`.
- `lang="en"` on `<html>`. Dates in `<time dateTime="2026-02">`.
- Uppercase via CSS only. Decorative glyphs (`§`, `→`, dots) are `aria-hidden`.

## 8. Test checklist (each release)

- Keyboard only: reach every control, see focus everywhere, operate timeline/stack/menu/copy.
- VoiceOver (Safari) rotor: headings outline matches §1; landmarks present; no duplicated content.
- 200% zoom and 320px width: no loss of content, no horizontal scroll.
- Reduced motion on: no transforms animate, canvas static, Lenis off.
- WebGL disabled (`chrome://flags` or `--disable-webgl`): fallback schematic shown, no error text.
- Lighthouse accessibility = 100 (and manual checks above, since Lighthouse misses most of them).
