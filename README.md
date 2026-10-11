# itsabubakar.me

Portfolio of Muhammad Abubakar, lead blockchain engineer (exchange infrastructure & L1 forks). Next.js 16 (App Router), React 19,
Tailwind v4, Three.js via React Three Fiber, GSAP + ScrollTrigger, Lenis.

The art direction is called **Live Figure**. A stylised 3D developer, sculpted in code, stands in a ring of
linked blocks that appends a new block every few seconds. The head follows your pointer. Around it the site
reads like a technical journal, and each project is shown as a working simulation of its architecture.
Design and engineering rules live in `.claude/skills/`.

```bash
npm run dev      # http://localhost:3000
npm run build    # production build (fetches Google Fonts and generates the OG/Twitter images)
npm start
npm run avatar   # re-bake public/models/avatar.glb from scripts/avatar/
```

## Editing content

All copy lives in `data/`, separate from the components:

| File | Contents |
|---|---|
| `data/site.ts` | name, roles cycled in the hero, email, WhatsApp, Calendly, Medium, links, location |
| `data/experience.ts` | roles, from the résumé (titles, dates, products, figures) |
| `data/research.ts` | Medium articles shown in Research |
| `data/projects.ts` | projects, their problem/architecture/result copy and architecture-diagram data |
| `data/technologies.ts` | technologies, categories and the relationships drawn in the Skills patch bay |

## Contact form (Resend)

The form posts to `app/api/contact/route.ts`, which validates (`lib/contact.ts`, shared with the client)
and emails the message through [Resend](https://resend.com) with `reply_to` set to the sender.

1. Create a Resend account → **Domains** → add `itsabubakar.me` and the DNS records it shows (SPF/DKIM).
2. **API Keys** → create a key with *Sending access*.
3. Set three environment variables (see `.env.example`) in `.env.local` and in your host's dashboard:
   `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (your inbox), `CONTACT_FROM_EMAIL` (e.g. `Portfolio <contact@itsabubakar.me>`).
4. Redeploy, send yourself a test message.

Until configured, the endpoint answers 503 and the form says plainly that nothing was sent and gives the email
address. Spam protection: honeypot, 3 s minimum fill time, 5 sends / 10 min per IP (in-memory, per instance —
move to Upstash/Vercel KV if spam gets through), link limit, same-origin check. Submissions carry an
idempotency key so retries never send twice.

`public/resume.pdf` is generated from `Muhammad_Abubakar_Lead_Blockchain_Engineer.docx`; to update it, replace
the PDF (Word → File → Save As → PDF). Book-a-call and résumé buttons only render when the link / file exist.

## Structure

```
app/                      layout (fonts, metadata, JSON-LD), page, OG + Twitter images, sitemap, robots
components/
  3d/                     SceneStage (fixed lazy layer) → HeroScene (Canvas) → Avatar, FloatingObjects
                          (chain ring), Particles, CameraRig, Lighting
  animations/             SmoothScroll (Lenis + GSAP ticker), ScrollAnimations, RevealObserver,
                          TextRotator, ScrubWords
  sections/               Hero, About, Work (+ work/: Showcase, SystemFigure, ArchitectureDiagram), Research,
                          Experience (+ rolling-year timeline), Skills (+ patch bay), Contact
  ui/                     Navigation, Loader, FloatingContact, Button, SectionHead, Depth, Term, Footer, …
  visuals/                canvas simulations for the four blockchain projects
lib/
  three/                  scene classes (AvatarRig, ChainRing, Particles, CameraRig), store, quality tiers,
                          asset fetch, environment
  animations/             gsap registration, scroll helpers, useLiveCanvas
  utils/                  dates, seo, og, hooks, math
  loading.ts              real loading progress shared by the loader and the 3D stage
scripts/avatar/           SDF sculpt + Surface Nets mesher + GLB bake (glTF-Transform, meshopt)
public/models/avatar.glb  baked avatar (~280 KB)
public/images/            poster of the 3D scene for devices without WebGL
```

## The avatar

`npm run avatar` rebuilds the model from `scripts/avatar/character.mjs` (signed-distance sculpt) and
`build-avatar.mjs` (hard-surface parts, materials, compression). To use a different model, replace
`public/models/avatar.glb`. Head tracking, blinking and breathing look for nodes named `Head`, `EyeL`/`EyeR`
and `Body`; Ready Player Me and Mixamo names also work. If you change the avatar or the lighting,
regenerate `public/images/avatar-poster.webp` too. It's the still shown when WebGL is unavailable.

## 3D quality tiers

Before mounting, `lib/three/quality.ts` picks `high`, `medium` or `low`. It picks `off` when WebGL2 is
missing, Save-Data is on, or the user prefers reduced data, and then the poster image is shown. Force a tier with
`?quality=high|medium|low|off`. With `prefers-reduced-motion` the scene renders as a single still frame, the
loader is a short fade and scroll effects are disabled.
