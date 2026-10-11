---
name: anti-generic
description: Concrete tests and replacement rules that keep the portfolio from looking like a template or an AI-generated landing page. Run these checks on every section before calling it done.
---

# Anti-Generic Rules

## 1. Banned by default (each needs a written reason to appear)

| Pattern | Why it reads as generic | Do this instead |
|---|---|---|
| Purple→blue / cyan gradients, purple glow behind the figure | Default "tech" palette since 2019 | Warm ink + bone + one signal orange (as rim light) |
| Glowing orb / sphere / blob hero | Three.js starter demo | The figure in its chain ring — every moving part means something |
| Gradient text | AI landing-page tell #1 | Weight/width change, or the signal dot |
| Glassmorphism cards | Dribbble 2021 | Hairline rules on solid ink |
| `rounded-2xl` + `shadow-xl` cards | Template SaaS | Radius 0–2px, no shadows, structure by rules |
| 3-column "feature" cards with icons | Every landing page | Numbered editorial columns, text-led |
| Skill bars / percentages / "90% React" | Meaningless and unfalsifiable | Patch bay showing *relationships* |
| Logo wall of 30 technologies | Says nothing | Grouped, interactive, with roles per tech |
| Fake terminal / typing effect | Overused, slows reading | Real content set in mono where it's metadata |
| "Hi, I'm X 👋" / "Hello World" | Junior portfolio tell | A statement about the work |
| Dense particle field | Screensaver | Sparse dust (≤ 260) in the light around the figure, depth-faded |
| Floating random cubes | Decorative 3D | Blocks only as a linked chain that appends in sequence |
| Everything fades up identically | Template motion | Motion type chosen per element role |
| Centered everything | Default flex centering | Asymmetric 12-col placements |
| Lucide/Heroicons sprinkled on every row | Icon noise | Typographic markers: `→`, `§`, `L0`, `01` |
| Big stat counters ("50+ projects") | Invented or vanity | Only derived facts (see truth rules) |
| Stock photos / store-bought avatars / 3D memoji | Generic | One original sculpted figure (code-built) + live system simulations |
| Neon on black, "cyber" fonts | Crypto cliché | Editorial grotesk + Plex Mono |

## 2. The five tests (run on every section)

1. **Swap test** — replace the name with another developer's. If the section still works unchanged,
   it is generic. Each section must reference the *layer model*, the *signal*, or Muhammad's actual
   domain (payments, chains, nodes, OCR).
2. **Squint test** — blur the screenshot. There must be one dominant shape (usually a huge headline
   or a diagram) and clear asymmetric masses. If you see an even grid of equal boxes, redesign.
3. **Template test** — could this section be produced by a "portfolio template" prompt? Card grid,
   centered title + subtitle, three icons? Then it fails.
4. **Copy test** — delete every adjective. If the sentence loses no information, keep it deleted.
   Search the copy for: passionate, seamless, cutting-edge, leverage, robust, innovative, elevate,
   unlock, journey, crafting, world-class, next-generation, synergy, "I love". Remove all.
5. **Motion test** — for each animation, state *what it communicates* (arrival, causality, state
   change, progression, position). If the answer is "it looks nice", delete it or make it 50% smaller.

## 3. Things that make a site look *designed*, used deliberately here

- One extreme type size per viewport (hero display ≈ 11–15vh) next to tiny 11px mono metadata.
  The contrast of scale is the design.
- Controlled line breaks in display type (manual `<br>`/line spans), never left to chance.
- Edges that align: every left edge snaps to a grid column; hairlines run full-bleed to the margins.
- Real typographic details: tabular numbers in dates, true arrows (→ ↓), en dashes in ranges
  (`Jul 2025 – Feb 2026`), proper apostrophes (’), non-breaking spaces before units.
- Captions and indices (`FIG. 03`, `§ 04`, `01/07`) that are *correct* — numbering must match.
- Empty space that is intentional: at least one column left empty in most desktop sections.

## 4. Specific traps for *this* site

- The figure must not become a mascot: no waving, no speech bubbles, no costume changes. It looks,
  blinks, breathes, glances. That is all.
- Project visuals must stay *simulations of the described architecture*, labelled as such — never fake
  dashboards with invented numbers.

- The orange must not drift toward Bitcoin amber; no ₿ symbols; no coins; no "to the moon" energy.
- Do not label things "Web3" in display type. Say what the system does (payments, wallets, nodes).
- The 3D must not become a screensaver: it has a boot sequence (lights come up), a reason for motion
  (blocks appended to a chain, a gaze that follows you), and it stops when not visible.
- Architecture diagrams must not become "boxes with arrows" clip-art: consistent grid, mono labels,
  hairline strokes, one highlighted path at a time, captioned.
- No "Download CV" button unless a CV file exists (enforced by `lib/contact-links.ts`, which checks the file).
- No popups or exit-intent modals. The only floating element is the owner-requested WhatsApp/email
  pair (`FloatingContact`), which hides over the hero and near Contact.
- No fake availability badges ("Available for work") — not provided.
