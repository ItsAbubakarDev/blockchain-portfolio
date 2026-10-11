---
name: visual-direction
description: The chosen art direction ("Live Figure") for Muhammad Abubakar's portfolio — concept, narrative, colour tokens, signature devices, copy voice and truth rules. Read before any visual or copy decision.
---

# Visual Direction — "Live Figure"

## 1. Concept

An interactive engineering portfolio built around one living object: a stylised 3D figure of a developer
(clay-white vinyl-figure finish, glasses, dark hoodie, headphones around the neck) standing inside a
**ring of linked blocks** that orbits at chest height. Every few seconds a block is appended at the
front of the chain, flashes signal orange, and the oldest drops off the tail. The figure follows the
pointer with its head, blinks, breathes, and glances at new blocks when the visitor is idle.

The figure is the warmth; the rest of the site is a technical journal: large condensed type, mono
metadata, hairlines, and **working models** of each project instead of screenshots.

History: this replaced "Exploded View" (layered system diagram hero) in Oct 2026 at the owner's request
for a reference-level 3D/loader/hero experience (inspiration: redoyanulhaque.me). Nothing was copied:
the character, palette, layout, loader and copy are original. Old code is in
`../portfolio-backup-pre-redesign-2026-10-05.tgz`.

## 2. Narrative (the scroll is the story)

1. **Loader** — "Syncing": a 12-block chain fills with *real* loading progress (fonts, 3D engine, model
   bytes, shader compile) next to a large counter. The curtain lifts; the figure is lit rim-first.
2. **Hero** — name, rotating role, one sentence, two CTAs. Figure right, text left (phones: figure top).
3. **About** — the figure moves left and turns to read the copy (camera pose change, gaze bias).
   Statement → a sentence that brightens as it's read → six focus areas → four working principles.
   The figure leaves as "How I work" arrives.
4. **Work** — four blockchain systems as stacked sticky panels (argument left, live simulation right,
   toggle to the exact architecture drawing), then "Also built".
4b. **Research** — the Medium articles as an editorial index.
5. **Experience** — a pinned year that rolls like an odometer (2026 → 2025 → 2024) beside the roles and a
   progress rail.
6. **Skills** — the patch bay: technologies as ports, relationships as cables.
7. **Contact** — the figure returns on the right, looking at the visitor. "Let’s build the part that has to work."

## 3. Colour (unchanged tokens — they are the brand)

| Token | Value | Use |
|---|---|---|
| `--color-ink` | `#0B0B0A` | page ground (warm near-black) |
| `--color-ink-raised` / `--color-ink-2` | `#121211` / `#161514` | panels, visual grounds |
| `--color-bone` | `#ECE7DC` | primary text, the figure's clay |
| `--color-mute` | `#8E897F` | secondary text, labels (AA on ink) |
| `--color-faint` | `#5C5851` | ornament only — never essential text |
| `--color-rule` | `rgb(236 231 220 / .12)` | hairlines |
| `--color-signal` | `#FF5A1F` | accent: the rim light, the newest block, active state, focus ring |
| `--color-steel` | `#8FA3AF` | secondary accent: cool rim light, return/confirmation paths, webhooks |

- **Accent budget**: signal < ~3% of a viewport. In 3D it is light (rim, block flash), not paint.
  In the visuals it marks the thing moving *now* (payment merging, block propagating). Confirmation
  cells, state boxes and log text are bone/mute.
- No purple/blue, no neon gradients, no glassmorphism. The only gradients are alpha falloffs
  (scene vignette, the faint warm halo behind the figure).
- Three.js lights: warm key `#FFF1E4` front-left, signal rim back-right, steel rim back-left, dim hemisphere.

## 4. Signature devices

- **The signal square** — the full stop of the name and statements, the nav mark, active markers.
- **Chain motif** — the ring in 3D, the loader's 12 blocks, the OG image's block row. Always "a chain
  growing", never coins or token symbols.
- **Mono metadata** — `01 / 05 — Payments`, `Fig. 02 — …`, `Chain height 0012 · appended live`.
  Numbers shown are real (counts from data, blocks appended this session, figures from the résumé).
- **Simulation, labelled** — project visuals say "Simulation" and their captions describe exactly what is drawn.

## 5. Two readers, one page (Oct 2026)

Every section serves a non-technical visitor (recruiter, founder, client) and a technical one (CTO,
engineering lead) through **progressive disclosure, never duplication or a mode switch**:

- Lead with one plain-language sentence, outcome first, then why it's hard (hero: "I build the systems that
  let a business take payments in crypto and know, for certain, that the money arrived…"). Plain lines are
  bone; technical lines are mute.
- Depth one step down: `Depth` (native `<details>`, "Technical detail" / "Under the hood") for focus areas,
  project cards, experience roles and "Also built"; `Term` annotations (`[[term]]` in copy, definitions in
  `data/glossary.ts`) for jargon inside technical text.
- The technical layer keeps its full detail — nothing is watered down; only the order changes.
- Contact is reachable from every screenful: the header never hides and carries "Hire me".

### Owner decisions (Oct 11 2026)

- **No AI.** The applied-AI/OCR work is removed from the site (project, lab, focus area, skills,
  metadata). Positioning: *Lead Blockchain Engineer · Exchange Infrastructure & L1 Forks*.
- **Résumé is the source of truth** for roles, dates and figures (`data/experience.ts`); the PDF at
  `public/resume.pdf` is offered as Preview (new tab) and Download.
- **Research** section lists the Medium articles (`data/research.ts`).
- **Floating WhatsApp + email** bottom-right, requested by the owner. Kept compact and hidden over the
  hero and the Contact section/footer so it never covers the opening sentence or form fields.
- **Native cursor.** The custom cursor ring/labels and the magnetic buttons were removed for simplicity.
- **Work = named case studies** (SILPRE, SWAP21, the chain split, forks, wallets, marketplace), each with
  what-it-is → numbers → problem → what I built → result → stack. Only figures the owner has stated:
  SILPRE's $600k / $340k / $40k. No other project carries metrics.
- **Live products are buttons,** not text links: `Visit user.silpre.net ↗` / `Visit swap21.com ↗`.
- **Proof:** real interface screenshots in `public/shots/` with a lightbox. Never publish a screenshot
  containing a third party's data — check every one before it enters `public/`.
- **Contact form posts to Formspree** (`site.formspreeId`) through `/api/contact`, which keeps the site's own
  validation and error states.
- **OVEX and MicroSlush are both current;** MicroSlush is labelled "Concurrent contract".
- **Section seams:** `.section + .section` halves the top padding, so two stacked sections don't read as an
  empty band.
- **Case-study pages** at `/work/<id>` for studies with `detail: true` (SILPRE, SWAP21). Same design
  language, one `h1` per page, attribution beside the title, gallery and figure full-width.
- **Attribution is required** on employer work: name the company, role, period, and what part was
  delivered, so a reader never assumes Muhammad owns the product. Never present client or employer
  products as personal projects.

## 6. Voice & truth rules (non-negotiable)

- Declarative, short, technical, first person. No "passionate", "seamless", "cutting-edge", no "Hi, I'm".
- Only facts in `data/*.ts` (roles, dates, project titles/summaries, stack, links, location) plus what the
  owner stated in the résumé. Never invent clients,
  metrics, links, testimonials or availability. The résumé download and "Book a call" render only when
  `public/resume.pdf` / `site.bookingUrl` exist (`lib/contact-links.ts`); in dev they show as dashed
  placeholders. Copy that mentions them must be conditional too.
- Project visuals are simulations of the described architecture, and say so.
