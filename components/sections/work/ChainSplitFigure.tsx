import { useId } from "react";

const W = 32;
const H = 22;
const Y_SHARED = 119;
const Y_A = 59;
const Y_B = 179;

const shared = [16, 64, 112];
const kept = [176, 224, 272, 320];
const dropped = [176, 224];

/**
 * Concept drawing for the chain-split case study: one shared history forks into two competing
 * ones; resolution returns every node to a single chain and the other branch is dropped.
 * Illustrative, not a trace of the incident — the caption says so.
 */
export default function ChainSplitFigure() {
  const uid = useId().replace(/:/g, "");
  const mid = (y: number) => y + H / 2;

  return (
    <div className="flex h-full items-center justify-center p-5 md:p-10">
      <svg viewBox="0 0 400 240" className="h-auto max-h-full w-full max-w-[44rem]" role="img" aria-labelledby={`${uid}-t ${uid}-d`}>
        <title id={`${uid}-t`}>What a chain split looks like</title>
        <desc id={`${uid}-d`}>
          Three blocks of shared history, then the chain forks into two competing histories, A and B. After the split is
          resolved, every node follows history A, which keeps growing, and history B is dropped.
        </desc>

        <g fill="none" strokeWidth="1">
          {/* shared history connectors */}
          {shared.slice(1).map((x) => (
            <line key={x} x1={x - 16} y1={mid(Y_SHARED)} x2={x} y2={mid(Y_SHARED)} stroke="var(--color-bone)" strokeOpacity="0.7" />
          ))}
          {/* the fork */}
          <path d={`M${shared[2] + W} ${mid(Y_SHARED)} C 160 ${mid(Y_SHARED)}, 150 ${mid(Y_A)}, ${kept[0]} ${mid(Y_A)}`} stroke="var(--color-bone)" strokeOpacity="0.7" />
          <path
            d={`M${shared[2] + W} ${mid(Y_SHARED)} C 160 ${mid(Y_SHARED)}, 150 ${mid(Y_B)}, ${dropped[0]} ${mid(Y_B)}`}
            stroke="var(--color-faint)"
            strokeDasharray="3 4"
          />
          {kept.slice(1).map((x) => (
            <line key={x} x1={x - 16} y1={mid(Y_A)} x2={x} y2={mid(Y_A)} stroke="var(--color-bone)" strokeOpacity="0.7" />
          ))}
          <line x1={dropped[1] - 16} y1={mid(Y_B)} x2={dropped[1]} y2={mid(Y_B)} stroke="var(--color-faint)" strokeDasharray="3 4" />
        </g>

        {shared.map((x) => (
          <rect key={`s${x}`} x={x} y={Y_SHARED} width={W} height={H} fill="var(--color-ink-2)" stroke="var(--color-bone)" strokeOpacity="0.8" />
        ))}
        {kept.map((x, i) => (
          <rect
            key={`a${x}`}
            x={x}
            y={Y_A}
            width={W}
            height={H}
            fill={i === kept.length - 1 ? "var(--color-signal)" : "var(--color-ink-2)"}
            stroke={i === kept.length - 1 ? "var(--color-signal)" : "var(--color-bone)"}
            strokeOpacity="0.8"
          />
        ))}
        {dropped.map((x) => (
          <rect key={`b${x}`} x={x} y={Y_B} width={W} height={H} fill="none" stroke="var(--color-faint)" strokeDasharray="3 3" />
        ))}

        <g fontFamily="var(--font-mono)" fontSize="13" letterSpacing="0.04em">
          <text x={shared[0]} y={Y_SHARED + H + 18} fill="var(--color-mute)">
            SHARED HISTORY
          </text>
          <text x={kept[0]} y={Y_A - 12} fill="var(--color-mute)">
            HISTORY A
          </text>
          <text x={kept[3] + W} y={Y_A + H + 18} fill="var(--color-bone)" textAnchor="end">
            ONE CHAIN AGAIN
          </text>
          <text x={dropped[0]} y={Y_B + H + 18} fill="var(--color-mute)">
            HISTORY B · DROPPED
          </text>
        </g>
      </svg>
    </div>
  );
}
