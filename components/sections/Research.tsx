import { articles } from "@/data/research";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { formatMonth } from "@/lib/utils/dates";
import SectionHead, { Statement } from "@/components/ui/SectionHead";

/**
 * Research: the Medium articles, as an editorial index (no cards). Each row leads with what a
 * reader gets from it in plain words; the technical keywords sit under it in mono, and it links to
 * the case study it is evidence for (and case studies link back to #article-<id>).
 */
export default function Research() {
  return (
    <section
      id="research"
      aria-labelledby="research-title"
      className="section relative z-[1] bg-ink pb-[calc(var(--section-y)*0.5)]"
    >
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
          {articles.map((a, i) => {
            const studies = projects.filter((p) => p.articles?.includes(a.id));
            return (
              <li
                key={a.id}
                id={`article-${a.id}`}
                className="scroll-mt-[calc(var(--nav-h)+16px)] border-b border-rule"
                data-reveal
                style={{ "--i": Math.min(i, 5) } as React.CSSProperties}
              >
                <div className="grid grid-cols-[minmax(0,1fr)] gap-y-3 py-6 md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-x-8 md:py-8">
                  <p className="t-label flex flex-wrap gap-x-3 text-mute md:flex-col md:gap-y-1.5 md:pt-1.5">
                    <time dateTime={a.date}>{formatMonth(a.date.slice(0, 7))}</time>
                    <span aria-hidden="true" className="md:hidden">
                      ·
                    </span>
                    <span className="text-bone">{a.area}</span>
                  </p>
                  <div className="min-w-0">
                    <h3 className="text-[clamp(1.2rem,1rem+0.8vw,1.75rem)] font-medium leading-[1.2] tracking-[-0.01em]">
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="group">
                        <span className="link-draw">{a.title}</span>
                        <span aria-hidden="true" className="arrow arrow-ne ml-2 text-mute">
                          ↗
                        </span>
                        <span className="sr-only">(opens on Medium in a new tab)</span>
                      </a>
                    </h3>
                    <p className="mt-2.5 max-w-[60ch] text-bone/85">{a.plain}</p>
                    <p className="t-label mt-3 text-mute">{a.topics.join(" · ")}</p>
                    {studies.length ? (
                      <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <span className="t-label text-mute">Evidence for</span>
                        {studies.map((p) => (
                          <a key={p.id} href={`#project-${p.id}`} className="group inline-flex min-h-9 items-baseline gap-1.5 text-[0.9375rem] text-bone">
                            <span className="link-u">{p.title}</span>
                            <span aria-hidden="true" className="arrow arrow-r text-mute">
                              ↑
                            </span>
                          </a>
                        ))}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="pt-6" data-reveal>
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
