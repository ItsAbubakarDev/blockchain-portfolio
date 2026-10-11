"use client";

import { useRef } from "react";
import { BONE, FAINT, MUTE, RULE, SIGNAL, STEEL, monoFont, useLiveCanvas, type CanvasScene } from "@/lib/animations/useLiveCanvas";

const CHAINS = ["ETHEREUM", "BSC", "BASE", "POLYGON"];
const CHAINS_SHORT = ["ETH", "BSC", "BASE", "POL"];
const STAGES = ["BUILD · GAS · NONCE", "SIGN", "BROADCAST", "RECEIPT"];
const STAGES_SHORT = ["BUILD", "SIGN", "SEND", "RECEIPT"];
// Seconds a transaction spends at each stage before it may move on.
const DWELL = [0.7, 0.45, 0.9, 1.1];

type Tx = { lane: number; nonce: number; stage: number; x: number; wait: number; done: number };

/** Per-address nonce queues on four EVM chains, signed in an isolated signer. Transactions never overtake. */
function create(): CanvasScene {
  const txs: Tx[] = [];
  const nonces = [41, 7, 112, 23];
  const spawnAt = [0.1, 0.8, 0.4, 1.3];

  return {
    draw(ctx, w, h, t, dt) {
      const compact = w < 520;
      const pad = Math.max(14, w * 0.035);
      const left = pad + (compact ? 44 : 78);
      const stages = compact ? STAGES_SHORT : STAGES;
      const chains = compact ? CHAINS_SHORT : CHAINS;
      const colX = STAGES.map((_, i) => left + ((w - left - pad) * (i + 0.5)) / STAGES.length);
      const laneY = (i: number) => h * (0.22 + i * 0.15);
      const startX = left - 10;

      // --- simulation
      for (let i = 0; i < CHAINS.length; i++) {
        if (t >= spawnAt[i]) {
          spawnAt[i] = t + 1.4 + ((i * 5 + Math.floor(t * 3)) % 7) * 0.25;
          const queued = txs.filter((x) => x.lane === i && x.stage < 0).length;
          if (queued < 2) txs.push({ lane: i, nonce: nonces[i]++, stage: -1, x: startX, wait: 0, done: 0 });
        }
      }
      for (const tx of txs) {
        if (tx.done) {
          tx.done += dt;
          continue;
        }
        const targetStage = tx.stage + 1;
        const targetX = targetStage < STAGES.length ? colX[targetStage] : w + 40;
        if (tx.wait > 0) {
          tx.wait -= dt;
          continue;
        }
        // The next slot in this lane must be free: nonces leave in order.
        const occupied = txs.some((o) => o !== tx && !o.done && o.lane === tx.lane && o.stage === targetStage);
        if (occupied) continue;
        tx.x += Math.min(Math.abs(targetX - tx.x), dt * 260) * Math.sign(targetX - tx.x);
        if (Math.abs(targetX - tx.x) < 0.5) {
          tx.stage = targetStage;
          if (tx.stage === STAGES.length - 1) tx.done = 0.0001;
          else tx.wait = DWELL[tx.stage];
        }
      }
      for (let i = txs.length - 1; i >= 0; i--) if (txs[i].done > 1.6) txs.splice(i, 1);

      // --- stage columns
      ctx.font = monoFont(9.5);
      ctx.textBaseline = "middle";
      stages.forEach((s, i) => {
        ctx.fillStyle = i === 1 ? BONE : FAINT;
        ctx.textAlign = "center";
        ctx.fillText(s, colX[i], h * 0.08);
        ctx.strokeStyle = RULE;
        ctx.beginPath();
        ctx.moveTo(colX[i] + 0.5, h * 0.13);
        ctx.lineTo(colX[i] + 0.5, h * 0.72);
        ctx.stroke();
      });
      ctx.textAlign = "left";

      // The signer is a boundary: keys come in from below and never travel with requests.
      const sw = compact ? 54 : 80;
      const sx = colX[1] - sw / 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(236,231,220,0.45)";
      ctx.strokeRect(sx + 0.5, h * 0.13 + 0.5, sw, h * 0.6);
      ctx.setLineDash([]);
      const ky = h * 0.86;
      ctx.strokeStyle = "rgba(236,231,220,0.3)";
      ctx.strokeRect(sx + 0.5, ky - 13.5, sw, 27);
      ctx.fillStyle = BONE;
      ctx.textAlign = "center";
      ctx.fillText("HD KEYS", colX[1], ky);
      ctx.textAlign = "left";
      ctx.strokeStyle = STEEL;
      ctx.beginPath();
      ctx.moveTo(colX[1] + 0.5, ky - 14);
      ctx.lineTo(colX[1] + 0.5, h * 0.73 + 1);
      ctx.stroke();
      ctx.fillStyle = MUTE;
      ctx.fillText("ISOLATED SIGNER", sx + sw + (compact ? 10 : 8), ky);

      // --- lanes
      chains.forEach((c, i) => {
        const y = laneY(i);
        ctx.fillStyle = MUTE;
        ctx.fillText(c, pad, y);
        ctx.strokeStyle = RULE;
        ctx.beginPath();
        ctx.moveTo(left - 14, y + 0.5);
        ctx.lineTo(w - pad, y + 0.5);
        ctx.stroke();
      });

      // --- transactions
      ctx.font = monoFont(9.5, 500);
      for (const tx of txs) {
        const y = laneY(tx.lane);
        const signed = tx.stage >= 1;
        const alpha = tx.done ? Math.max(0, 1 - tx.done / 1.6) : Math.min(1, (tx.x - startX + 30) / 30);
        ctx.globalAlpha = alpha;
        const bw = compact ? 38 : 42;
        ctx.fillStyle = tx.done ? "rgba(143,163,175,0.18)" : "#151413";
        ctx.fillRect(tx.x - bw / 2, y - 9, bw, 18);
        ctx.strokeStyle = tx.done ? STEEL : signed ? BONE : "rgba(236,231,220,0.45)";
        ctx.strokeRect(tx.x - bw / 2 + 0.5, y - 8.5, bw - 1, 17);
        if (signed && !tx.done) {
          ctx.fillStyle = SIGNAL;
          ctx.fillRect(tx.x + bw / 2 - 5, y - 9, 5, 5);
        }
        ctx.fillStyle = tx.done ? STEEL : BONE;
        ctx.textAlign = "center";
        ctx.fillText(tx.done ? "✓" : `n${tx.nonce}`, tx.x, y + 0.5);
        ctx.textAlign = "left";
      }
      ctx.globalAlpha = 1;
    },
  };
}

export default function WalletVisual() {
  const ref = useRef<HTMLCanvasElement>(null);
  useLiveCanvas(ref, create);
  return <canvas ref={ref} className="block h-full w-full" aria-hidden="true" />;
}
