import type { ReactNode } from "react";

type Props = {
  index: string;
  label: string;
  meta?: ReactNode;
};

/** 0N  LABEL ───────────────────────── meta */
export default function SectionHead({ index, label, meta }: Props) {
  return (
    <div className="section-head" data-reveal="rule">
      <p className="t-label flex gap-3">
        <span aria-hidden="true" className="text-mute">
          {index}
        </span>
        <span>{label}</span>
      </p>
      {meta ? <p className="t-label text-right text-mute">{meta}</p> : null}
    </div>
  );
}

/** A section statement (h2) split into masked lines that rise into place. */
export function Statement({
  id,
  lines,
  className = "",
  size = "lg",
}: {
  id: string;
  lines: string[];
  className?: string;
  size?: "lg" | "sm";
}) {
  return (
    <h2 id={id} className={`t-h2 ${size === "sm" ? "t-h2-sm" : ""} ${className}`} data-reveal="lines">
      {lines.map((line, i) => (
        <span key={line} className="line" style={{ "--i": i } as React.CSSProperties}>
          <span>
            {line}
            {i === lines.length - 1 ? <span className="stop" aria-hidden="true" /> : " "}
          </span>
        </span>
      ))}
    </h2>
  );
}
