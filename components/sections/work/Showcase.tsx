import type { ReactNode } from "react";
import { isWritten, type Project } from "@/data/projects";
import { articles } from "@/data/research";
import Annotated from "@/components/ui/Annotated";
import Depth from "@/components/ui/Depth";
import SystemFigure from "./SystemFigure";
import Gallery from "./Gallery";
import Delivered from "./Delivered";
import { gallery } from "@/data/gallery";

type Props = {
  project: Project;
  index: string;
  total: number;
  primary?: { node: ReactNode; caption: string; kind: "Simulation" | "Concept" };
};

const dev = process.env.NODE_ENV === "development";

/**
 * One named case study as a two-part panel: the argument on the left, a model of the system on the
 * right. The argument follows the five-part structure — what it is (plain), headline numbers, the
 * problem, what I built (one click deeper), the result — then related writing and the stack.
 * On tall desktops the panels stack as you scroll, unless a panel's content is taller than the
 * screen (it then scrolls normally; see ScrollAnimations).
 */
export default function Showcase({ project, index, total, primary }: Props) {
  const story = project.story ?? [];
  const written = story.filter(isWritten);
  const pending = story.filter((p) => !isWritten(p));
  const hasDepth = written.length > 0 || project.built.length > 0;
  const related = (project.articles ?? []).map((id) => articles.find((a) => a.id === id)).filter((a) => !!a);
  const shotGroups = gallery[project.id];

  return (
    <article id={`project-${project.id}`} aria-labelledby={`project-${project.id}-title`} className="showcase" data-stack>
      <div className="showcase__inner panel" data-stack-inner>
        <div className="showcase__text">
          <p className="t-label flex flex-wrap items-center gap-x-3 gap-y-1 text-mute">
            <span className="text-bone">
              {index} / {String(total).padStart(2, "0")}
            </span>
            <span aria-hidden="true">—</span>
            <span>{project.kind}</span>
          </p>
          <h3 id={`project-${project.id}-title`} className="t-h3 mt-5 text-[clamp(2rem,1.2rem+2.4vw,3.6rem)] lg:mt-6">
            {project.title}
          </h3>
          {project.delivery ? (
            <div className="mt-4">
              <Delivered delivery={project.delivery} compact />
            </div>
          ) : project.org ? (
            <p className="t-label mt-3 text-mute">{project.org}</p>
          ) : null}

          {/* 1 · What it is */}
          <p className="t-lead mt-5 max-w-[38ch] text-bone">{project.what}</p>

          {/* The live product, as the loudest thing in the panel after the name. */}
          {project.live || project.detail ? (
            <p className="mt-6 flex flex-wrap items-center gap-3">
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
              {project.detail ? (
                <a href={`/work/${project.id}`} className="cs-link t-label group">
                  Full case study
                  <span aria-hidden="true" className="arrow arrow-r">
                    →
                  </span>
                </a>
              ) : null}
            </p>
          ) : null}

          {/* Headline numbers (only figures the owner has stated) */}
          {project.metrics?.length ? (
            <dl className="metrics mt-6">
              {project.metrics.map((m) => (
                <div key={m.value}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd className="metrics__value">{m.value}</dd>
                  <dd className="metrics__label">{m.label}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <dl className="showcase__facts mt-6">
            {/* 2 · The problem */}
            {project.problem ? (
              <div>
                <dt className="t-label text-mute">The problem</dt>
                <dd>
                  <Annotated text={project.problem} />
                </dd>
              </div>
            ) : null}
            {/* 4 · The result */}
            <div>
              <dt className="t-label text-mute">The result</dt>
              <dd className="facts__result">
                {project.result}
                {project.matters ? <span className="mt-2 block text-mute">{project.matters}</span> : null}
              </dd>
            </div>
          </dl>

          {shotGroups?.length ? (
            <div className="mt-7">
              <p className="t-label text-mute">Interface</p>
              <Gallery groups={shotGroups} project={project.title} />
            </div>
          ) : null}

          {/* 3 · What I built — the technical layer */}
          {hasDepth ? (
            <Depth label="What I built" className="mt-4">
              {written.map((p) => (
                <div key={p.label} className="mb-4">
                  <p className="t-label text-mute">{p.label}</p>
                  <p className="mt-1.5 max-w-[56ch] text-[0.9375rem] leading-relaxed text-bone/85">
                    <Annotated text={p.body!} />
                  </p>
                </div>
              ))}
              {project.built.length ? (
                <ul className="max-w-[56ch] space-y-2.5 text-[0.9375rem] leading-relaxed text-bone/85">
                  {project.built.map((b) => (
                    <li key={b} className="flex gap-3">
                      <span aria-hidden="true" className="text-faint">
                        –
                      </span>
                      <span>
                        <Annotated text={b} />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Depth>
          ) : null}

          {dev && pending.length ? (
            <p className="dev-gap mt-4" title="Development only — never rendered in production">
              Awaiting from owner: {pending.map((p) => p.label).join(" · ")} (data/projects.ts)
            </p>
          ) : null}

          {/* Research that backs this study up */}
          {related.length ? (
            <div className="mt-5">
              <p className="t-label text-mute">Related writing</p>
              <ul className="mt-1.5">
                {related.map((a) => (
                  <li key={a.id}>
                    <a href={`#article-${a.id}`} className="group inline-flex min-h-9 items-baseline gap-2 text-[0.9375rem] text-bone/90">
                      <span className="link-u">{a.title}</span>
                      <span aria-hidden="true" className="arrow arrow-d text-mute">
                        ↓
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* 5 · Stack */}
          {project.stack?.length ? (
            <ul className="mt-5 flex flex-wrap gap-2 lg:mt-auto lg:pt-6" aria-label="Stack">
              {project.stack.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <SystemFigure figure={index} primary={primary} diagram={project.diagram} />
      </div>
    </article>
  );
}
