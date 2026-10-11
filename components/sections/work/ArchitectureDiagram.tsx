"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import type { Project } from "@/data/projects";

type Diagram = NonNullable<Project["diagram"]>;

const NODE = { w: 132, h: 54 };
const CELL_H = { w: 156, h: 150 }; // horizontal orientation
const CELL_V = { w: 180, h: 100 }; // vertical (transposed) orientation
const PAD = 14;

type Placed = { id: string; label: string; sub?: string; x: number; y: number };
type Routed = { key: string; d: string; length: number; kind: "request" | "reply"; from: string; to: string };

function layout(diagram: Diagram, vertical: boolean) {
  const cell = vertical ? CELL_V : CELL_H;
  const cols = vertical ? diagram.rows : diagram.cols;
  const rows = vertical ? diagram.cols : diagram.rows;
  const nodes = new Map<string, Placed>();
  for (const n of diagram.nodes) {
    const c = vertical ? n.row : n.col;
    const r = vertical ? n.col : n.row;
    nodes.set(n.id, { ...n, x: PAD + c * cell.w + cell.w / 2, y: PAD + r * cell.h + cell.h / 2 });
  }

  const edges: Routed[] = diagram.edges.map((e) => {
    const a = nodes.get(e.from)!;
    const b = nodes.get(e.to)!;
    const hw = NODE.w / 2;
    const hh = NODE.h / 2;
    let pts: [number, number][];
    if (Math.abs(a.y - b.y) < 1) {
      const s = Math.sign(b.x - a.x);
      pts = [[a.x + s * hw, a.y], [b.x - s * hw, b.y]];
    } else if (Math.abs(a.x - b.x) < 1) {
      const s = Math.sign(b.y - a.y);
      pts = [[a.x, a.y + s * hh], [b.x, b.y - s * hh]];
    } else if (!vertical) {
      // Leave vertically, travel horizontally between rows, enter vertically.
      const sy = Math.sign(b.y - a.y);
      const mid = (a.y + b.y) / 2;
      pts = [[a.x, a.y + sy * hh], [a.x, mid], [b.x, mid], [b.x, b.y - sy * hh]];
    } else {
      const sx = Math.sign(b.x - a.x);
      const mid = (a.x + b.x) / 2;
      pts = [[a.x + sx * hw, a.y], [mid, a.y], [mid, b.y], [b.x - sx * hw, b.y]];
    }
    let length = 0;
    for (let i = 1; i < pts.length; i++) length += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
    return { key: `${e.from}-${e.to}`, d, length, kind: e.kind ?? "request", from: e.from, to: e.to };
  });

  return { nodes: [...nodes.values()], edges, width: cols * cell.w + PAD * 2, height: rows * cell.h + PAD * 2 };
}

type Props = {
  diagram: Diagram;
  focus: string[];
  figure: string;
  reduced: boolean;
  vertical: boolean;
  className?: string;
};

/** A block diagram drawn from grid data. Highlights the active step and animates packets on its paths. */
export default function ArchitectureDiagram({ diagram, focus, figure, reduced, vertical, className = "block h-auto w-full overflow-visible" }: Props) {
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const { nodes, edges, width, height } = useMemo(() => layout(diagram, vertical), [diagram, vertical]);
  const active = useMemo(() => new Set(focus), [focus]);
  const names = useMemo(() => new Map(diagram.nodes.map((n) => [n.id, n.label])), [diagram]);

  // SMIL packets run only while the diagram is on screen.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || reduced) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) svg.unpauseAnimations();
      else svg.pauseAnimations();
    });
    io.observe(svg);
    return () => io.disconnect();
  }, [reduced]);

  const flow = diagram.edges
    .map((e) => `${names.get(e.from)} ${e.kind === "reply" ? "returns to" : "→"} ${names.get(e.to)}`)
    .join("; ");

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-labelledby={`${uid}-t ${uid}-d`}
    >
      <title id={`${uid}-t`}>{`Fig. ${figure} — ${diagram.caption}`}</title>
      <desc id={`${uid}-d`}>{flow}</desc>
      <defs>
        <marker id={`${uid}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M1 1 L7 4 L1 7" fill="none" stroke="context-stroke" strokeWidth="1" />
        </marker>
      </defs>

      <g fill="none" strokeWidth="1">
        {edges.map((e) => {
          const on = active.has(e.from) && active.has(e.to);
          const color = e.kind === "reply" ? "var(--color-steel)" : on ? "var(--color-bone)" : "var(--color-faint)";
          return (
            <path
              key={e.key}
              d={e.d}
              stroke={color}
              strokeOpacity={on ? 0.9 : 0.55}
              strokeDasharray={e.kind === "reply" ? "3 4" : undefined}
              markerEnd={`url(#${uid}-arrow)`}
              className="transition-[stroke-opacity,stroke] duration-500"
            />
          );
        })}
      </g>

      {!reduced &&
        edges.map((e, i) => {
          if (!(active.has(e.from) && active.has(e.to))) return null;
          const dur = Math.max(1.1, e.length / 95);
          return (
            <rect
              key={`p-${e.key}-${focus.join()}`}
              x={-2.5}
              y={-2.5}
              width={5}
              height={5}
              fill={e.kind === "reply" ? "var(--color-steel)" : "var(--color-signal)"}
            >
              <animateMotion dur={`${dur}s`} begin={`${-(i * 0.37) % dur}s`} repeatCount="indefinite" path={e.d} />
            </rect>
          );
        })}

      {nodes.map((n) => {
        const on = active.has(n.id);
        return (
          <g key={n.id} transform={`translate(${n.x - NODE.w / 2} ${n.y - NODE.h / 2})`}>
            <rect
              width={NODE.w}
              height={NODE.h}
              fill="var(--color-ink)"
              stroke={on ? "var(--color-bone)" : "var(--color-faint)"}
              strokeOpacity={on ? 0.85 : 0.7}
              className="transition-[stroke,stroke-opacity] duration-500"
            />
            <rect
              width={5}
              height={5}
              x={-0.5}
              y={-0.5}
              fill="var(--color-signal)"
              opacity={on ? 1 : 0}
              className="transition-opacity duration-500"
            />
            <text
              x={11}
              y={23}
              fontFamily="var(--font-mono)"
              fontSize="11.5"
              letterSpacing="0.06em"
              fill={on ? "var(--color-bone)" : "var(--color-mute)"}
              className="transition-[fill] duration-500"
            >
              {n.label.toUpperCase()}
            </text>
            {n.sub && (
              <text x={11} y={40} fontFamily="var(--font-sans)" fontSize="11" fill="var(--color-mute)">
                {n.sub}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
