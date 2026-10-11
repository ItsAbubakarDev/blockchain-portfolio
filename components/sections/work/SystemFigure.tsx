"use client";

import { useState, type ReactNode } from "react";
import type { Diagram } from "@/data/projects";
import { useReducedMotion } from "@/lib/utils/hooks";
import ArchitectureDiagram from "./ArchitectureDiagram";

type Props = {
  figure: string;
  /** A live simulation or a concept drawing, with what it shows. */
  primary?: { node: ReactNode; caption: string; kind: "Simulation" | "Concept" };
  diagram?: Diagram;
};

/**
 * The right half of a case study: a live simulation or concept drawing, and/or the system's
 * architecture (an accessible SVG with the flow described in text). With both, a toggle switches
 * between them; the hidden view is display:none, so its animation loop pauses.
 */
export default function SystemFigure({ figure, primary, diagram }: Props) {
  const [view, setView] = useState<"primary" | "arch">(primary ? "primary" : "arch");
  const reduced = useReducedMotion();
  const focus = diagram ? (diagram.focus ?? diagram.nodes.map((n) => n.id)) : [];
  const both = !!primary && !!diagram;
  const caption = view === "primary" ? primary?.caption : diagram?.caption;

  return (
    <figure className="showcase__visual">
      <figcaption className="t-label flex items-center justify-between gap-4 border-b border-rule px-5 py-3 text-mute">
        <span className="min-w-0">
          <span className="text-bone">Fig. {figure}</span> — {caption}
        </span>
        {both ? (
          <span className="flex shrink-0 items-center gap-1" role="group" aria-label={`Figure ${figure} view`}>
            {(
              [
                ["primary", primary!.kind],
                ["arch", "Architecture"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                onClick={() => setView(id)}
                className={`flex min-h-8 items-center gap-2 px-2 transition-colors duration-200 ${view === id ? "text-bone" : "text-mute hover-fine:hover:text-bone"}`}
              >
                {id === "primary" && primary!.kind === "Simulation" ? (
                  <span className={`live-dot ${view === id ? "" : "opacity-30"}`} aria-hidden="true" />
                ) : null}
                {label}
              </button>
            ))}
          </span>
        ) : (
          <span className="shrink-0">{primary ? primary.kind : "Architecture"}</span>
        )}
      </figcaption>

      <div className="showcase__canvas relative min-h-0 flex-1">
        {primary ? <div className={view === "primary" ? "absolute inset-0" : "hidden"}>{primary.node}</div> : null}
        {diagram ? (
          <div className={view === "arch" ? "absolute inset-0 flex items-center justify-center p-4 md:p-8" : "hidden"}>
            <ArchitectureDiagram
              diagram={diagram}
              focus={focus}
              figure={figure}
              reduced={reduced}
              vertical={false}
              className="hidden h-full max-h-full w-full overflow-visible md:block"
            />
            <ArchitectureDiagram
              diagram={diagram}
              focus={focus}
              figure={figure}
              reduced={reduced}
              vertical
              className="block h-full max-h-full w-full overflow-visible md:hidden"
            />
          </div>
        ) : null}
      </div>
    </figure>
  );
}
