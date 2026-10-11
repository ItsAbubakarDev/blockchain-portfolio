"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Category, Technology } from "@/data/technologies";

type Props = {
  categories: Category[];
  technologies: Technology[];
  links: [string, string][];
};

type Anchor = { l: number; r: number; y: number; col: number };

/**
 * Technologies as ports, relationships as patch cables.
 * Select (click/tap/Enter) to trace connections; hover previews on desktop.
 */
export default function PatchBay({ categories, technologies, links }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [anchors, setAnchors] = useState<Record<string, Anchor>>({});
  const [box, setBox] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());

  const byId = useMemo(() => new Map(technologies.map((t) => [t.id, t])), [technologies]);
  const colOf = useMemo(() => new Map(categories.map((c, i) => [c.id, i])), [categories]);
  const neighbours = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const t of technologies) map.set(t.id, new Set());
    for (const [a, b] of links) {
      map.get(a)?.add(b);
      map.get(b)?.add(a);
    }
    return map;
  }, [technologies, links]);

  const focus = preview ?? selected;
  const related = focus ? neighbours.get(focus)! : null;

  // Measure port positions for the cables (desktop only; layout reads on resize, not on render).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      if (window.innerWidth < 1024) {
        setBox({ w: 0, h: 0 });
        return;
      }
      const base = container.getBoundingClientRect();
      const next: Record<string, Anchor> = {};
      buttonRefs.current.forEach((el, id) => {
        const r = el.getBoundingClientRect();
        next[id] = {
          l: r.left - base.left,
          r: r.right - base.left,
          y: r.top - base.top + r.height / 2,
          col: colOf.get(byId.get(id)!.category) ?? 0,
        };
      });
      setAnchors(next);
      setBox({ w: base.width, h: base.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [byId, colOf]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cables = useMemo(() => {
    if (!box.w) return [];
    return links.flatMap(([a, b]) => {
      let A = anchors[a];
      let B = anchors[b];
      if (!A || !B) return [];
      let d: string;
      if (A.col === B.col) {
        const x = Math.max(A.r, B.r);
        const bend = 18 + Math.abs(A.y - B.y) * 0.08;
        d = `M${A.r + 4} ${A.y} C${x + bend} ${A.y}, ${x + bend} ${B.y}, ${B.r + 4} ${B.y}`;
      } else {
        if (A.col > B.col) [A, B] = [B, A];
        const x1 = A.r + 4;
        const x2 = B.l - 4;
        const dx = Math.max(32, (x2 - x1) * 0.45);
        d = `M${x1} ${A.y} C${x1 + dx} ${A.y}, ${x2 - dx} ${B.y}, ${x2} ${B.y}`;
      }
      return [{ key: `${a}-${b}`, a, b, d }];
    });
  }, [anchors, box.w, links]);

  const onSelect = useCallback((id: string) => setSelected((cur) => (cur === id ? null : id)), []);
  const onPreview = useCallback((id: string | null) => setPreview(id), []);
  const register = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) buttonRefs.current.set(id, el);
    else buttonRefs.current.delete(id);
  }, []);

  const focusTech = focus ? byId.get(focus)! : null;
  const grouped = focusTech
    ? categories
        .map((c) => ({ c, items: technologies.filter((t) => t.category === c.id && related!.has(t.id)) }))
        .filter((g) => g.items.length)
    : [];
  const selectedTech = selected ? byId.get(selected)! : null;

  return (
    <div>
      <div ref={containerRef} className="relative">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block"
          width={box.w}
          height={box.h}
        >
          {cables.map((c) => {
            const on = !!focus && (c.a === focus || c.b === focus);
            return (
              <path
                key={c.key}
                d={c.d}
                fill="none"
                stroke={on ? "var(--color-signal)" : "var(--color-bone)"}
                strokeWidth={on ? 1.25 : 1}
                strokeOpacity={focus ? (on ? 0.95 : 0.035) : 0.085}
                className="transition-[stroke-opacity,stroke] duration-300"
              />
            );
          })}
        </svg>

        <div className="relative grid gap-x-[var(--gutter)] gap-y-12 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const items = technologies.filter((t) => t.category === cat.id);
            return (
              <div key={cat.id}>
                <h3 className="t-label flex items-baseline justify-between gap-3 border-b border-rule pb-3">
                  <span>
                    <span className="text-mute">{cat.layer}</span> · {cat.name}
                  </span>
                  <span className="text-mute" aria-hidden="true">{String(items.length).padStart(2, "0")}</span>
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:items-start lg:gap-1">
                  {items.map((t) => (
                    <Port
                      key={t.id}
                      tech={t}
                      state={
                        t.id === focus ? "focus" : related?.has(t.id) ? "related" : focus ? "dim" : "idle"
                      }
                      pressed={selected === t.id}
                      onSelect={onSelect}
                      onPreview={onPreview}
                      register={register}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Readout */}
      <div className="mt-14 grid-edit gap-y-3 border-t border-rule pt-4" aria-hidden="true">
        <p className="t-label col-span-full text-mute lg:col-span-3">Route</p>
        <div className="col-span-full min-h-[5.5rem] lg:col-span-9">
          {focusTech ? (
            <div key={focusTech.id} className="animate-[fade-in_260ms_var(--ease-out)_both]">
              <p className="t-lead">
                <span className="text-bone">{focusTech.name}</span>
                <span className="text-mute"> — {focusTech.note}</span>
              </p>
              <p className="t-label mt-3 flex flex-wrap gap-x-5 gap-y-1 text-mute">
                {grouped.map((g) => (
                  <span key={g.c.id}>
                    {g.c.name} <span className="text-signal">→</span>{" "}
                    <span className="text-bone">{g.items.map((t) => t.name).join(" · ")}</span>
                  </span>
                ))}
              </p>
            </div>
          ) : (
            <p className="t-lead text-mute">Select a technology to trace what it connects to.</p>
          )}
        </div>
      </div>
      <p role="status" className="sr-only">
        {selectedTech
          ? `${selectedTech.name}: ${selectedTech.note} Connects to ${[...neighbours.get(selectedTech.id)!]
              .map((id) => byId.get(id)!.name)
              .join(", ")}.`
          : ""}
      </p>
    </div>
  );
}

type PortProps = {
  tech: Technology;
  state: "idle" | "focus" | "related" | "dim";
  pressed: boolean;
  onSelect: (id: string) => void;
  onPreview: (id: string | null) => void;
  register: (id: string, el: HTMLButtonElement | null) => void;
};

const Port = memo(function Port({ tech, state, pressed, onSelect, onPreview, register }: PortProps) {
  const text =
    state === "focus" ? "text-bone" : state === "related" ? "text-bone" : state === "dim" ? "text-mute" : "text-bone/80";
  const port =
    state === "focus" ? "bg-signal border-signal" : state === "related" ? "border-signal" : "border-bone/30";
  return (
    <li>
      <button
        ref={(el) => register(tech.id, el)}
        type="button"
        aria-pressed={pressed}
        onClick={() => onSelect(tech.id)}
        onPointerEnter={(e) => e.pointerType === "mouse" && onPreview(tech.id)}
        onPointerLeave={(e) => e.pointerType === "mouse" && onPreview(null)}
        className={`relative z-[1] flex min-h-9 items-center gap-2.5 border border-rule bg-ink px-2.5 text-[0.9375rem] transition-colors duration-200 lg:min-h-8 lg:border-transparent lg:px-1.5 ${text} ${
          pressed ? "border-bone/40 lg:border-bone/25" : ""
        }`}
      >
        <span aria-hidden="true" className={`size-[7px] shrink-0 border transition-colors duration-200 ${port}`} />
        {tech.name}
      </button>
    </li>
  );
});
