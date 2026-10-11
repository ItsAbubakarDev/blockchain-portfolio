"use client";

import { useEffect, useRef, useState } from "react";
import type { Role } from "@/data/experience";
import { formatMonth, formatSpan, monthSpan } from "@/lib/utils/dates";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import Annotated from "@/components/ui/Annotated";
import Depth from "@/components/ui/Depth";
import YearRoll from "./YearRoll";

type Props = { roles: Role[]; now: string; /** Case-study id → title, for the cross-links. */ studyTitles: Record<string, string> };

/**
 * Roles in reverse order with a progress line that fills as you read. On desktop a large year
 * stays pinned beside them and rolls to the active role's start year.
 */
export default function Timeline({ roles, now, studyTitles }: Props) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const fill = fillRef.current;
    const dot = dotRef.current;
    if (!list || !fill || !dot) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: list,
        start: "top 62%",
        end: "bottom 62%",
        onUpdate: (self) => {
          const p = reduced ? 1 : self.progress;
          fill.style.transform = `scaleY(${p})`;
          dot.style.top = `${p * 100}%`;
        },
      });
      list.querySelectorAll<HTMLElement>("[data-role]").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 62%",
          end: "bottom 62%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  const current = roles[active];
  const year = Number(current.start.slice(0, 4));

  return (
    <div className="grid-edit gap-y-10">
      <div className="hidden lg:col-span-5 lg:block">
        <div className="sticky top-[calc(var(--nav-h)+8vh)]">
          <p className="t-label text-mute">{current.end === null ? "Now" : "Then"}</p>
          <p className="year-big mt-3">
            <YearRoll year={year} />
          </p>
          <p className="t-label mt-5 text-mute">
            <span className="text-bone">{current.company}</span> · {formatMonth(current.start)} – {current.end ? formatMonth(current.end) : "Present"}
          </p>
        </div>
      </div>

      <ol ref={listRef} className="timeline relative col-span-full lg:col-span-7 lg:col-start-6">
        <span className="timeline__rail" aria-hidden="true">
          <span ref={fillRef} className="timeline__fill" />
          <span ref={dotRef} className="timeline__dot" />
        </span>
        {roles.map((role, i) => {
          const end = role.end ?? now;
          const months = monthSpan(role.start, end);
          return (
            <li key={role.id} data-role className={`timeline__item ${i === active ? "is-active" : ""}`}>
              <p className="t-label flex flex-wrap items-center gap-x-3 gap-y-1 text-mute">
                {role.end === null ? <span className="sq" aria-hidden="true" /> : null}
                <time dateTime={role.start}>{formatMonth(role.start)}</time>
                <span aria-hidden="true">–</span>
                {role.end ? <time dateTime={role.end}>{formatMonth(role.end)}</time> : <span>Present</span>}
                <span aria-hidden="true">·</span>
                <span>{formatSpan(months)}</span>
                {role.concurrent ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-bone">Concurrent contract</span>
                  </>
                ) : null}
                <span className="year-inline lg:hidden" aria-hidden="true">
                  {role.start.slice(0, 4)}
                </span>
              </p>
              <h3 className="t-h3 mt-4 text-[clamp(2.2rem,1.4rem+3vw,4.25rem)]">{role.company}</h3>
              <p className="mt-2 text-[clamp(1.1rem,1rem+0.5vw,1.4rem)] text-bone">{role.title}</p>
              <p className="t-label mt-2 text-mute">{role.where}</p>
              <p className="mt-5 max-w-[52ch] text-bone/90">{role.summary}</p>
              {role.highlights?.length ? (
                <Depth className="mt-2">
                  <ul className="max-w-[60ch] space-y-2.5 text-[0.9375rem] text-mute">
                    {role.highlights.map((h) => (
                      <li key={h} className="flex gap-3">
                        <span aria-hidden="true" className="text-faint">
                          –
                        </span>
                        <span>
                          <Annotated text={h} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </Depth>
              ) : null}
              {role.caseStudies?.length ? (
                <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="t-label text-mute">Case studies</span>
                  {role.caseStudies.map((id) => {
                    const title = studyTitles[id];
                    return title ? (
                      <a key={id} href={`#project-${id}`} className="group inline-flex min-h-9 items-baseline gap-1.5 text-bone">
                        <span className="link-u">{title}</span>
                        <span aria-hidden="true" className="arrow arrow-r text-mute">
                          ↑
                        </span>
                      </a>
                    ) : null;
                  })}
                </p>
              ) : null}
              <p className="t-label mt-5 text-bone">{role.focus.join(" · ")}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Stack">
                {role.stack.map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
