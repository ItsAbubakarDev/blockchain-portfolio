---
name: performance
description: Web performance and delivery rules — budgets, server/client component split, lazy 3D, fonts, event handling, measuring, plus the SEO/metadata contract. Use for architecture decisions and before shipping.
---

# Frontend Performance (and delivery/SEO)

## 1. Budgets (Live Figure, measured on the production build, Oct 2026)

Initial JS ≈ 206 KB gz (React/Next + GSAP + Lenis + app). Lazy 3D chunk 263 KB gz + GLB ≈ 206 KB over
the wire, both after first paint. Desktop LCP 0.12 s, CLS 0. Throttled mobile LCP 0.8 s, CLS 0.
SEO: title "Muhammad Abubakar — Blockchain & AI Engineer", Person JSON-LD with `worksFor` from the current
role, generated OG + Twitter images (`lib/utils/og.tsx`), sitemap, robots, canonical.

### Previous budgets

| Metric (mobile, Lighthouse, 4× CPU) | Target |
|---|---|
| LCP | < 2.0s (LCP element = hero `<h1>`) |
| CLS | < 0.02 |
| TBT | < 150ms |
| INP | < 150ms |
| Initial JS (route, gz) | framework baseline (React 19 + Next 16 ≈ 120kb) + **≤ 45kb app code**. Measured: 157kb total |
| Lazy 3D chunk (three + R3F + scene, gz) | ≤ 250kb, requested after idle. Measured: 242kb |
| Fonts | ≤ 3 files (Archivo variable, Plex Mono 400, 500), woff2, latin subset |

## 2. Server vs client components

- Default is **Server Component**. Every section's markup and copy render on the server.
- Client islands (and only these):
  `SiteHeader` (scroll state, active section, menu, clock) · `SmoothScroll` (Lenis) ·
  `RevealObserver` · `Cursor` · `HeroStage` (tier detection + lazy canvas) · `CaseStudy` steps tracker ·
  `ExperienceTimeline` · `StackPatchBay` · `CopyEmail` · `LocalTime`.
- Data (`data/*.ts`) is imported by server components; client islands receive only the slices they
  need as props (keeps RSC payload small).
- No `"use client"` at the top of section files that are 90% static — extract the interactive leaf.

## 3. Loading strategy

- 3D: `next/dynamic` with `ssr:false`, rendered after `requestIdleCallback` (timeout 1200ms) and
  only if tier ≠ off. Fallback SVG is server-rendered and is the loading state.
- No images in the critical path; the OG image is generated (`app/opengraph-image.tsx`).
- No third-party scripts, no analytics by default.
- Lenis is small (~4kb gz) and imported statically by its island; it is fine.

## 4. Fonts

- `next/font/google` (self-hosted at build). `display: 'swap'`, `adjustFontFallback` default on.
- Archivo with `axes: ['wdth']` — one variable file covers display + text.
- Plex Mono: weights 400/500 only. `preload: true` for both families (both are above the fold).

## 5. Runtime rules

- Scroll/pointer listeners are `{ passive: true }` and rAF-throttled; one listener per concern,
  shared via small stores — not one per component.
- Cache layout reads (`getBoundingClientRect`) on resize/ResizeObserver; never read layout inside
  scroll handlers when writing styles in the same tick (layout thrash).
- IntersectionObserver for: reveals (1 observer), nav active section (1), case-study steps (1 per
  case study), canvas visibility (1), diagram animation pause (1).
- SVG SMIL packets: pause with `svg.pauseAnimations()` when off-screen.
- `React.memo` only where a parent re-renders on interaction (patch bay chips, timeline rows).
  `useCallback`/`useMemo` only for values passed to memoised children or expensive derivations.
- CSS animations on `transform`/`opacity` only (compositor). `content-visibility: auto` on long
  below-the-fold sections **only** if measured to help (it can break sticky + anchor offsets — test).

## 6. Measure, don't guess

Measured (production build): desktop LCP 0.1s, CLS 0.005; mobile with 4× CPU + throttled network
LCP 1.77s, CLS 0, long-task time ≈ 137ms. Fonts: 3 files (88kb + 2 × 10kb).


1. `npm run build` → read the route size table; the `/` First Load JS must meet the budget.
2. Chrome DevTools → Performance (4× CPU throttle, mobile viewport): record load + scroll to bottom.
   Look for long tasks, forced reflows, and the 3D chunk timing relative to LCP.
3. Lighthouse (mobile + desktop) on the production build (`npm start`), never on `next dev`.
4. Fix the largest measured cost first; record before/after numbers in the PR/commit message.

## 7. SEO & metadata contract

- `metadataBase: new URL('https://itsabubakar.me')`, `alternates.canonical: '/'`.
- Title: `Muhammad Abubakar — Backend Blockchain Engineer`; template `%s — Muhammad Abubakar`.
- Description (≤ 160 chars), factual, from the brief's positioning and stack.
- Open Graph: type `profile` (`firstName`, `lastName`), `url`, `siteName`, `locale en_US`;
  image from `app/opengraph-image.tsx` (1200×630, brand style, generated with `next/og`).
- Twitter: `summary_large_image` (no handle — none provided).
- `app/sitemap.ts` (single URL), `app/robots.ts` (allow all, sitemap link), `app/icon.svg`.
- JSON-LD `Person` in the layout: `name`, `url`, `jobTitle`, `address` (Islamabad, PK), `sameAs`
  (GitHub, LinkedIn), `knowsAbout` (from the technologies data). Rendered with
  `<script type="application/ld+json">` and `JSON.stringify(...).replace(/</g, '\\u003c')`.
- Viewport export: `themeColor: '#0B0B0A'`, `colorScheme: 'dark'`.
- Semantic HTML and the heading outline in accessibility.md are part of SEO; all key content
  (roles, projects, stack) is server-rendered text, never inside canvas or images.
