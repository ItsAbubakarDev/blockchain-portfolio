import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isWritten, projects } from "@/data/projects";
import { articles } from "@/data/research";
import { gallery } from "@/data/gallery";
import { site } from "@/data/site";
import Annotated, { plainText } from "@/components/ui/Annotated";
import Gallery from "@/components/sections/work/Gallery";
import Delivered from "@/components/sections/work/Delivered";
import Footer from "@/components/ui/Footer";
import SystemFigure from "@/components/sections/work/SystemFigure";
import ChainSplitFigure from "@/components/sections/work/ChainSplitFigure";
import NodesVisual from "@/components/visuals/NodesVisual";
import WalletVisual from "@/components/visuals/WalletVisual";
import MarketplaceVisual from "@/components/visuals/MarketplaceVisual";

const dev = process.env.NODE_ENV === "development";

const PRIMARY: Record<string, { node: React.ReactNode; caption: string; kind: "Simulation" | "Concept" }> = {
  "chain-split": {
    node: <ChainSplitFigure />,
    caption: "One history becomes two, then one again — illustrative, not a trace of the incident",
    kind: "Concept",
  },
  forks: { node: <NodesVisual />, caption: "A block propagating across peers, build pipeline below", kind: "Simulation" },
  "evm-wallets": { node: <WalletVisual />, caption: "Per-chain nonce queues through an isolated signer", kind: "Simulation" },
  "real-estate": { node: <MarketplaceVisual />, caption: "Contract events replayed into the off-chain index", kind: "Simulation" },
};

const detailed = projects.filter((p) => p.detail);
const pad = (n: number) => String(n).padStart(2, "0");

export function generateStaticParams() {
  return detailed.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = detailed.find((p) => p.id === slug);
  if (!project) return {};
  const description = `${project.what} ${project.delivery ? `Delivered at ${project.delivery.org}.` : ""}`.trim();
  return {
    title: `${project.title} — ${project.kind}`,
    description,
    alternates: { canonical: `/work/${project.id}` },
    openGraph: {
      type: "article",
      url: `/work/${project.id}`,
      title: `${project.title} — ${project.kind}`,
      description,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = detailed.find((p) => p.id === slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.id === project.id);
  const others = detailed.filter((p) => p.id !== project.id);
  const story = project.story ?? [];
  const written = story.filter(isWritten);
  const pending = story.filter((p) => !isWritten(p));
  const related = (project.articles ?? []).map((id) => articles.find((a) => a.id === id)).filter((a) => !!a);
  const groups = gallery[project.id];
  const primary = PRIMARY[project.id];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    about: project.kind,
    description: plainText(project.what),
    url: `${site.url}/work/${project.id}`,
    author: { "@type": "Person", name: site.name, url: site.url },
    ...(project.delivery ? { sourceOrganization: { "@type": "Organization", name: project.delivery.org } } : {}),
    ...(project.live ? { sameAs: project.live.url } : {}),
  };

  return (
    <>
      <main id="main" className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <article className="section cs">
        <div className="wrap">
          {/* ---------------------------------------------------------------- head */}
          <div className="section-head">
            <p className="t-label flex flex-wrap gap-x-3 gap-y-1">
              <Link href="/#work" className="group inline-flex items-center gap-2 text-mute hover-fine:hover:text-bone">
                <span aria-hidden="true" className="arrow">
                  ←
                </span>
                <span className="link-draw">Selected work</span>
              </Link>
              <span aria-hidden="true" className="text-faint">
                /
              </span>
              <span className="text-bone">Case study {pad(index + 1)}</span>
            </p>
            <p className="t-label text-right text-mute">{project.kind}</p>
          </div>

          <div className="grid-edit mt-[var(--head-gap)] gap-y-10">
            <div className="col-span-full lg:col-span-7">
              <h1 className="t-h2 text-[clamp(2.75rem,1.5rem+6vw,7rem)]">
                {project.title}
                <span className="stop" aria-hidden="true" />
              </h1>
              <p className="t-lead mt-7 max-w-[40ch] text-bone">{project.what}</p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {project.live ? (
                  <a href={project.live.url} target="_blank" rel="noopener noreferrer" className="btn btn--solid group">
                    <span className="live-dot" aria-hidden="true" />
                    <span className="btn__label flex items-center gap-3">
                      Visit {project.live.label}
                      <span aria-hidden="true" className="arrow arrow-ne">
                        ↗
                      </span>
                    </span>
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                ) : null}
                <Link href="/#contact" className="btn group">
                  <span className="btn__label flex items-center gap-3">
                    Discuss a project like this
                    <span aria-hidden="true" className="arrow arrow-r">
                      →
                    </span>
                  </span>
                </Link>
              </div>
            </div>

            {/* Attribution sits beside the title, not buried at the bottom. */}
            {project.delivery ? (
              <div className="col-span-full self-end lg:col-span-4 lg:col-start-9">
                <Delivered delivery={project.delivery} />
              </div>
            ) : null}
          </div>

          {/* --------------------------------------------------------------- numbers */}
          {project.metrics?.length ? (
            <dl className="cs-metrics mt-16 lg:mt-24">
              {project.metrics.map((m) => (
                <div key={m.value}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd className="cs-metrics__value">{m.value}</dd>
                  <dd className="cs-metrics__label">{m.label}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {/* --------------------------------------------------------- problem/result */}
          <div className="grid-edit mt-16 gap-y-10 lg:mt-24">
            {project.problem ? (
              <section className="col-span-full lg:col-span-5" aria-labelledby="cs-problem">
                <h2 id="cs-problem" className="t-label text-mute">
                  The problem
                </h2>
                <p className="mt-4 max-w-[46ch] text-[1.0625rem] leading-relaxed text-bone/90">
                  <Annotated text={project.problem} />
                </p>
              </section>
            ) : null}
            <section className="col-span-full lg:col-span-5 lg:col-start-8" aria-labelledby="cs-result">
              <h2 id="cs-result" className="t-label text-mute">
                The result
              </h2>
              <p className="mt-4 max-w-[46ch] text-[1.0625rem] leading-relaxed text-bone">{project.result}</p>
              {project.matters ? <p className="mt-4 max-w-[46ch] text-mute">{project.matters}</p> : null}
            </section>
          </div>
        </div>

        {/* ------------------------------------------------------------------ figure */}
        {primary || project.diagram ? (
          <div className="wrap mt-16 lg:mt-24">
            <div className="panel cs-figure" data-reveal="frame">
              <SystemFigure figure={pad(index + 1)} primary={primary} diagram={project.diagram} />
            </div>
          </div>
        ) : null}

        <div className="wrap">
          {/* ------------------------------------------------------------ what I built */}
          {written.length || project.built.length ? (
            <section className="mt-16 lg:mt-24" aria-labelledby="cs-built">
              <h2 id="cs-built" className="t-label border-t border-rule pt-3 text-mute">
                What I built
              </h2>
              <div className="grid-edit mt-10 gap-y-8">
                {written.map((part) => (
                  <div key={part.label} className="col-span-full md:col-span-4 lg:col-span-4">
                    <h3 className="t-label text-bone">{part.label}</h3>
                    <p className="mt-3 max-w-[44ch] leading-relaxed text-mute">
                      <Annotated text={part.body!} />
                    </p>
                  </div>
                ))}
                {project.built.length ? (
                  <ul className="col-span-full space-y-4 lg:col-span-10">
                    {project.built.map((b) => (
                      <li key={b} className="flex gap-4 border-t border-rule pt-4">
                        <span aria-hidden="true" className="t-label shrink-0 pt-1 text-faint">
                          —
                        </span>
                        <span className="max-w-[70ch] leading-relaxed text-bone/85">
                          <Annotated text={b} />
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {dev && pending.length ? (
                <p className="dev-gap mt-6" title="Development only — never rendered in production">
                  Awaiting from owner: {pending.map((p) => p.label).join(" · ")} (data/projects.ts)
                </p>
              ) : null}
            </section>
          ) : null}

          {/* ---------------------------------------------------------------- gallery */}
          {groups?.length ? (
            <section className="mt-16 lg:mt-24" aria-labelledby="cs-interface">
              <h2 id="cs-interface" className="t-label border-t border-rule pt-3 text-mute">
                Interface
              </h2>
              <Gallery groups={groups} project={project.title} />
            </section>
          ) : null}

          {/* ------------------------------------------------------------------ stack */}
          {project.stack?.length ? (
            <section className="mt-16 lg:mt-24" aria-labelledby="cs-stack">
              <h2 id="cs-stack" className="t-label border-t border-rule pt-3 text-mute">
                Stack
              </h2>
              <ul className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* ---------------------------------------------------------------- writing */}
          {related.length ? (
            <section className="mt-16 lg:mt-24" aria-labelledby="cs-writing">
              <h2 id="cs-writing" className="t-label border-t border-rule pt-3 text-mute">
                Related writing
              </h2>
              <ul className="mt-6">
                {related.map((a) => (
                  <li key={a.id}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex min-h-11 items-baseline gap-2 text-[1.0625rem] text-bone"
                    >
                      <span className="link-u">{a.title}</span>
                      <span aria-hidden="true" className="arrow arrow-ne text-mute">
                        ↗
                      </span>
                      <span className="sr-only">(opens on Medium in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* ------------------------------------------------------------------- next */}
          <nav className="mt-20 border-t border-rule pt-8 lg:mt-28" aria-label="More case studies">
            <p className="t-label text-mute">More case studies</p>
            <ul className="mt-6 grid gap-6 md:grid-cols-2">
              {others.map((p) => (
                <li key={p.id}>
                  <Link href={`/work/${p.id}`} className="group block">
                    <p className="t-label text-mute">{p.kind}</p>
                    <p className="t-h3 mt-2 text-[clamp(1.6rem,1.2rem+1.4vw,2.5rem)]">
                      <span className="link-draw">{p.title}</span>
                      <span aria-hidden="true" className="arrow arrow-r ml-3 text-mute">
                        →
                      </span>
                    </p>
                    {p.delivery ? <p className="t-label mt-2 text-mute">Delivered at {p.delivery.org}</p> : null}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/#work" className="group block">
                  <p className="t-label text-mute">Index</p>
                  <p className="t-h3 mt-2 text-[clamp(1.6rem,1.2rem+1.4vw,2.5rem)]">
                    <span className="link-draw">All work</span>
                    <span aria-hidden="true" className="arrow arrow-r ml-3 text-mute">
                      →
                    </span>
                  </p>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </article>
      </main>
      <Footer topHref="#main" />
    </>
  );
}
