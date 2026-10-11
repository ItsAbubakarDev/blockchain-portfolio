import type { ReactNode } from "react";
import type { Project } from "@/data/projects";
import Annotated from "@/components/ui/Annotated";
import Depth from "@/components/ui/Depth";
import SystemFigure from "./SystemFigure";

type Props = { project: Project; total: number; figure: string; caption: string; visual: ReactNode };

const step = (project: Project, key: "problem" | "architecture" | "implementation" | "result") =>
  project.steps?.find((s) => s.key === key)?.body;

/**
 * One project as a large two-part panel: the argument on the left, a live model of the
 * system on the right. The argument opens with one plain sentence; the technical summary,
 * problem, architecture and implementation sit one click deeper ("Under the hood"). On tall desktop viewports the panels stack as you scroll (sticky),
 * each new one sliding over the last; elsewhere they simply follow each other.
 */
export default function Showcase({ project, total, figure, caption, visual }: Props) {
  const problem = step(project, "problem");
  const how = step(project, "architecture");
  const build = step(project, "implementation");
  const result = step(project, "result");

  return (
    <article id={`project-${project.id}`} aria-labelledby={`project-${project.id}-title`} className="showcase" data-stack>
      <div className="showcase__inner panel" data-stack-inner>
        <div className="showcase__text">
          <p className="t-label flex flex-wrap items-center gap-x-3 gap-y-1 text-mute">
            <span className="text-bone">
              {project.index} / {String(total).padStart(2, "0")}
            </span>
            <span aria-hidden="true">—</span>
            <span>{project.domain}</span>
          </p>
          <h3 id={`project-${project.id}-title`} className="t-h3 mt-5 text-[clamp(2rem,1.2rem+2.4vw,3.6rem)] lg:mt-7">
            {project.title}
          </h3>
          <p className="t-lead mt-5 max-w-[34ch] text-bone lg:mt-6">{project.plain}</p>

          <Depth label="Under the hood" className="showcase__depth mt-6 lg:mt-auto">
            <p className="max-w-[52ch] text-[0.9375rem] leading-relaxed text-bone/85">
              <Annotated text={project.summary} />
            </p>
            <dl className="showcase__facts mt-5">
              {problem ? (
                <div>
                  <dt className="t-label text-mute">Problem</dt>
                  <dd>
                    <Annotated text={problem} />
                  </dd>
                </div>
              ) : null}
              {how ? (
                <div>
                  <dt className="t-label text-mute">How it works</dt>
                  <dd>
                    <Annotated text={how} />
                  </dd>
                </div>
              ) : null}
              {build ? (
                <div>
                  <dt className="t-label text-mute">Implementation</dt>
                  <dd>
                    <Annotated text={build} />
                  </dd>
                </div>
              ) : null}
            </dl>
          </Depth>

          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stack">
            {project.stack.map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
        </div>

        <SystemFigure
          figure={figure}
          caption={caption}
          diagram={project.diagram}
          focus={project.steps?.find((st) => st.key === "architecture")?.focus ?? []}
          result={result}
        >
          {visual}
        </SystemFigure>
      </div>
    </article>
  );
}
