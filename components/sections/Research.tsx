import { articles } from "@/data/research";
import { site } from "@/data/site";
import { formatMonth } from "@/lib/utils/dates";
import SectionHead, { Statement } from "@/components/ui/SectionHead";

/**
 * Research: the Medium articles, as an editorial index (no cards). Each row leads with what a
 * reader gets from it in plain words; the technical keywords sit under it in mono.
 */
export default function Research() {
  return (
    <section id="research" aria-labelledby="research-title" className="section relative z-[1] bg-ink">
      <div className="wrap">
        <SectionHead index="03" label="Research" meta={`${String(articles.length).padStart(2, "0")} articles · Medium`} />

        <div className="grid-edit mt-[var(--head-gap)] gap-y-10">
          <Statement id="research-title" lines={["Notes from", "the protocol", "layer"]} className="col-span-full lg:col-span-8" />
          <p className="t-lead col-span-full max-w-[34ch] self-end text-bone/90 md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9" data-reveal>
            What I learn running Bitcoin forks and exchange backends, written up so the next engineer doesn’t lose a week to the
            same problem.
          </p>
        </div>

        <ol className="mt-16 border-t border-rule lg:mt-24">
          {articles.map((a, i) => (
            <li key={a.id} className="border-b border-rule" data-reveal style={{ "--i": Math.min(i, 5) } as React.CSSProperties}>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="research-row group grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 py-6 md:grid-cols-[8.5rem_minmax(0,1fr)_auto] md:gap-x-8 md:py-8"
              >
                <p className="t-label col-span-2 flex flex-wrap gap-x-3 text-mute md:col-span-1 md:flex-col md:gap-y-1.5 md:pt-1.5">
                  <time dateTime={a.date}>{formatMonth(a.date.slice(0, 7))}</time>
                  <span aria-hidden="true" className="md:hidden">
                    ·
                  </span>
                  <span className="text-bone">{a.area}</span>
                </p>
                <div className="min-w-0">
                  <h3 className="text-[clamp(1.2rem,1rem+0.8vw,1.75rem)] font-medium leading-[1.2] tracking-[-0.01em]">
                    <span className="link-draw">{a.title}</span>
                  </h3>
                  <p className="mt-2.5 max-w-[60ch] text-bone/85">{a.plain}</p>
                  <p className="t-label mt-3 text-mute">{a.topics.join(" · ")}</p>
                </div>
                <span aria-hidden="true" className="arrow arrow-ne self-start pt-1 text-[1.25rem] text-mute md:pt-0.5">
                  ↗
                </span>
                <span className="sr-only">(opens on Medium in a new tab)</span>
              </a>
            </li>
          ))}
        </ol>

        <p className="mt-10" data-reveal>
          <a href={site.medium.url} target="_blank" rel="noopener noreferrer" className="t-label group inline-flex min-h-11 items-center gap-2 text-bone">
            <span className="link-draw">All writing on Medium</span>
            <span aria-hidden="true" className="arrow arrow-ne">
              ↗
            </span>
            <span className="sr-only">(opens in new tab)</span>
          </a>
        </p>
      </div>
    </section>
  );
}
