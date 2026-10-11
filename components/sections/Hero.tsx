import { roles } from "@/data/experience";
import { rotatorRoles, site } from "@/data/site";
import TextRotator from "@/components/animations/TextRotator";
import Button from "@/components/ui/Button";
import ChainHeight from "@/components/ui/ChainHeight";
import SceneStatus from "@/components/ui/SceneStatus";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/**
 * The first five seconds: name, role, one sentence, two actions — set against the live 3D figure.
 * Text is server-rendered and never waits for WebGL; the intro choreography keys off html.is-ready.
 */
export default function Hero() {
  const current = roles.find((r) => r.end === null);

  return (
    <section id="top" aria-labelledby="hero-title" className="relative z-[1] flex min-h-svh flex-col">
      <div className="hero-halo" aria-hidden="true" />

      <div className="wrap relative flex flex-1 flex-col pb-5 pt-[calc(var(--nav-h)+env(safe-area-inset-top))] md:pb-7">
        {/* Phones: the copy anchors to the bottom and may rise over the figure's torso on short
            screens — the sentence must be readable without scrolling, the figure can give way. */}
        <div className="flex flex-1 flex-col justify-end pt-[22svh] md:pt-[50svh] lg:justify-center lg:pt-0">
          <div className="lg:w-[50%]">
            <p className="t-label flex items-center gap-3 text-mute" data-intro style={d(120)}>
              <span className="sq" aria-hidden="true" />
              Exchanges &amp; L1 forks — {site.location.city}
            </p>

            <h1 id="hero-title" className="hero-name mt-4 lg:mt-6">
              <span className="line" data-intro="line" style={d(200)}>
                <span>{site.firstName} </span>
              </span>
              <span className="line" data-intro="line" style={d(290)}>
                <span>
                  {site.lastName}
                  <span className="stop" aria-hidden="true" />
                </span>
              </span>
            </h1>

            <p className="mt-3 text-[length:var(--fs-role)] font-medium leading-none tracking-[-0.01em] lg:mt-6">
              <TextRotator words={rotatorRoles} />
            </p>

            {/* Plain layer first (the ten-second read), technical layer under it in mono. */}
            <p className="mt-4 max-w-[44ch] text-base leading-[1.5] text-bone/90 md:text-[1.0625rem] lg:mt-7 lg:max-w-[42ch]" data-intro="up" style={d(650)}>
              {site.plain}
            </p>
            <p className="t-label mt-3 max-w-[52ch] leading-[1.6] text-mute lg:mt-4" data-intro="up" style={d(700)}>
              {site.stackLine}
            </p>

            <div className="mt-5 flex flex-wrap gap-3 lg:mt-8" data-intro="up" style={d(760)}>
              <Button href="#work" variant="solid">
                <span className="sq" aria-hidden="true" />
                Selected work
                <span aria-hidden="true" className="arrow arrow-d">
                  ↓
                </span>
              </Button>
              <Button href="#contact">
                Hire me
                <span aria-hidden="true" className="arrow arrow-r">
                  →
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom rail: links · scroll cue · live status */}
        <div className="mt-8 hidden grid-cols-3 items-end gap-6 md:grid lg:mt-0" data-intro style={d(950)}>
          <ul className="t-label flex gap-6">
            <li>
              <a href={site.github.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-11 items-end gap-1.5 text-mute hover-fine:hover:text-bone">
                <span className="link-draw">GitHub</span>
                <span aria-hidden="true" className="arrow arrow-ne">
                  ↗
                </span>
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </li>
            <li>
              <a href={site.linkedin.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-11 items-end gap-1.5 text-mute hover-fine:hover:text-bone">
                <span className="link-draw">LinkedIn</span>
                <span aria-hidden="true" className="arrow arrow-ne">
                  ↗
                </span>
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </li>
          </ul>

          <a href="#about" className="t-label mx-auto flex flex-col items-center gap-3 text-mute hover-fine:hover:text-bone" aria-label="Scroll to About">
            <span className="scroll-cue__line" aria-hidden="true" />
            Scroll
          </a>

          <div className="t-label text-right text-mute">
            {current ? (
              <p>
                Now — <span className="text-bone">{current.title}</span>, {current.company}
              </p>
            ) : null}
            <p className="mt-1 grid" aria-hidden="true">
              <span className="scene-only col-start-1 row-start-1">
                Chain height <span className="text-bone"><ChainHeight /></span> · appended live
              </span>
              <SceneStatus className="col-start-1 row-start-1" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
