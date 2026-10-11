"use client";

import { useRef } from "react";
import { BONE, FAINT, MUTE, RULE, SIGNAL, STEEL, monoFont, useLiveCanvas, type CanvasScene } from "@/lib/animations/useLiveCanvas";

type Node = { x: number; y: number; seed: boolean; reached: number };

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Peers of a Bitcoin Core–derived network. A block propagates hop by hop; the build pipeline sits below. */
function create(): CanvasScene {
  let nodes: Node[] = [];
  let edges: [number, number][] = [];
  let adj: number[][] = [];
  let hop: number[] = [];
  let origin = -1;
  let waveT = 0;
  let nextBlock = 0.8;
  let height = 0;
  let buildT = 0;

  const layout = (w: number, h: number) => {
    const rand = rng(91);
    const pts: Node[] = [];
    const left = w * 0.08;
    const right = w * 0.92;
    const top = h * 0.16;
    const bottom = h * 0.62;
    let guard = 0;
    while (pts.length < 17 && guard++ < 4000) {
      const x = left + rand() * (right - left);
      const y = top + rand() * (bottom - top);
      if (pts.every((p) => Math.hypot(p.x - x, p.y - y) > Math.min(w, h) * 0.13)) pts.push({ x, y, seed: false, reached: -1 });
    }
    // The three nodes nearest the bottom edge act as seeds (closest to the pipeline that boots them).
    [...pts]
      .sort((a, b) => b.y - a.y)
      .slice(0, 3)
      .forEach((p) => (p.seed = true));
    const e = new Set<string>();
    const list: [number, number][] = [];
    pts.forEach((p, i) => {
      const near = pts
        .map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      for (const { j } of near) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!e.has(key)) {
          e.add(key);
          list.push([Math.min(i, j), Math.max(i, j)]);
        }
      }
    });
    nodes = pts;
    edges = list;
    adj = pts.map(() => []);
    for (const [a, b] of list) {
      adj[a].push(b);
      adj[b].push(a);
    }
  };

  const announce = () => {
    const full = nodes.map((n, i) => (n.seed ? -1 : i)).filter((i) => i >= 0);
    origin = full[(height * 7 + 3) % full.length];
    // Hop distance from the origin (BFS).
    hop = nodes.map(() => -1);
    hop[origin] = 0;
    const q = [origin];
    while (q.length) {
      const a = q.shift()!;
      for (const b of adj[a]) if (hop[b] < 0) {
        hop[b] = hop[a] + 1;
        q.push(b);
      }
    }
    waveT = 0;
    height++;
  };

  return {
    resize(w, h) {
      layout(w, h);
    },
    draw(ctx, w, h, t, dt) {
      if (!nodes.length) layout(w, h);
      if (t >= nextBlock) {
        announce();
        nextBlock = t + 3.4;
      }
      waveT += dt;
      buildT = (buildT + dt / 5) % 1;
      const HOP = 0.22;

      // Edges, lit as the block crosses them.
      for (const [a, b] of edges) {
        const A = nodes[a];
        const B = nodes[b];
        ctx.strokeStyle = RULE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
        if (origin >= 0 && hop[a] >= 0 && hop[b] >= 0 && Math.abs(hop[a] - hop[b]) === 1) {
          const [from, to] = hop[a] < hop[b] ? [A, B] : [B, A];
          const k = (waveT - Math.min(hop[a], hop[b]) * HOP) / HOP;
          if (k > 0 && k < 1.6) {
            const p = Math.min(1, k);
            ctx.strokeStyle = SIGNAL;
            ctx.globalAlpha = k < 1 ? 0.85 : Math.max(0, 1 - (k - 1) / 0.6) * 0.85;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(from.x + (to.x - from.x) * p, from.y + (to.y - from.y) * p);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      // Nodes.
      ctx.font = monoFont(9.5);
      ctx.textBaseline = "middle";
      nodes.forEach((n, i) => {
        const arrive = hop[i] >= 0 ? hop[i] * HOP : 99;
        const since = waveT - arrive;
        const flash = since >= 0 && since < 0.45 ? 1 - since / 0.45 : 0;
        const s = n.seed ? 9 : 6;
        ctx.fillStyle = flash > 0 ? SIGNAL : n.seed ? BONE : "#151413";
        ctx.strokeStyle = flash > 0 ? SIGNAL : n.seed ? BONE : "rgba(236,231,220,0.55)";
        if (n.seed) ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
        else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, s / 2 + flash * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        if (n.seed) {
          ctx.fillStyle = MUTE;
          ctx.fillText("SEED", n.x + 9, n.y);
        }
        if (i === origin && since < 1.2) {
          ctx.fillStyle = BONE;
          ctx.fillText(`BLOCK ${String(height).padStart(4, "0")}`, n.x + 9, n.y - 12);
        }
      });

      // Build pipeline.
      const y = h * 0.84;
      const labels = w < 520 ? ["CORE FORK", "DOCKER IMAGE", "NODES"] : ["CORE FORK · CHAIN PARAMS", "DOCKER IMAGE · REPRODUCIBLE", "SEED + FULL NODES"];
      const bw = (w * 0.84) / 3 - 14;
      const xs = labels.map((_, i) => w * 0.08 + i * (bw + 21));
      ctx.font = monoFont(9.5);
      labels.forEach((label, i) => {
        ctx.strokeStyle = "rgba(236,231,220,0.3)";
        ctx.strokeRect(xs[i] + 0.5, y - 16.5, bw, 33);
        ctx.fillStyle = BONE;
        ctx.fillText(label, xs[i] + 10, y, bw - 16);
        if (i < 2) {
          ctx.fillStyle = FAINT;
          ctx.fillText("→", xs[i] + bw + 6, y);
        }
      });
      // A build passes through the pipeline every few seconds.
      const bx = w * 0.08 + buildT * (w * 0.84);
      ctx.fillStyle = STEEL;
      ctx.fillRect(bx - 3, y + 20, 6, 2);

      ctx.fillStyle = FAINT;
      ctx.fillText("P2P NETWORK", w * 0.08, h * 0.07);
      ctx.fillText("BUILD", w * 0.08, y - 30);
      ctx.textAlign = "right";
      ctx.fillStyle = MUTE;
      ctx.fillText(`HEIGHT ${String(height).padStart(6, "0")}`, w * 0.92, h * 0.07);
      ctx.textAlign = "left";
    },
  };
}

export default function NodesVisual() {
  const ref = useRef<HTMLCanvasElement>(null);
  useLiveCanvas(ref, create);
  return <canvas ref={ref} className="block h-full w-full" aria-hidden="true" />;
}
