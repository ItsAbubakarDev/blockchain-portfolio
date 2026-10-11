"use client";

import { useRef } from "react";
import { BONE, FAINT, MUTE, RULE, SIGNAL, STEEL, monoFont, useLiveCanvas, type CanvasScene } from "@/lib/animations/useLiveCanvas";

// Three chain families, one payment state. Cells per lane are illustrative, not confirmation rules.
const LANES = [
  { code: "BTC", sub: "UTXO · Core RPC", rate: 0.42 },
  { code: "EVM", sub: "ETH · BSC · Base · Polygon", rate: 0.22 },
  { code: "TRON", sub: "TRC-20 · TronWeb", rate: 0.18 },
];
const CELLS = 6;

type Payment = { lane: number; phase: "travel" | "confirm" | "merge"; p: number; cells: number; cellT: number };

function create(): CanvasScene {
  const payments: Payment[] = [];
  const spawnAt = [0.2, 1.1, 0.6];
  const log: { text: string; age: number; lane: number }[] = [];
  let settled = 0;
  let stateFlash = 0;
  let hookPulse = -1;

  return {
    draw(ctx, w, h, t, dt) {
      // Portrait (phones): lanes on top, the payment state and webhook log stacked below.
      const compact = w < 520;
      const pad = Math.max(14, w * 0.035);
      const x0 = pad + (compact ? 46 : 92);
      const xWatch = w * (compact ? 0.48 : 0.5);
      const xCells = xWatch + (compact ? 16 : 22);
      const cell = compact ? Math.min(14, (w - xCells - pad) / CELLS - 3) : Math.min(17, (w * 0.16) / CELLS);
      const xCellsEnd = xCells + CELLS * (cell + 3);
      const xState = compact ? w / 2 - 24 : w * 0.75;
      const yState = compact ? h * 0.6 : h * 0.4;
      const laneY = compact ? (i: number) => h * (0.13 + i * 0.15) : (i: number) => h * (0.2 + i * 0.27);
      // Where the merge curves land: the state box's left side, or its top edge on phones.
      const mx = compact ? xState + 24 : xState - 30;
      const my = compact ? yState - 36 : yState;
      const c1 = (y: number) => (compact ? [xCellsEnd + 10, y + 30] : [xCellsEnd + 40, y]);
      const c2 = compact ? [mx, my - 50] : [xState - 60, yState];

      // --- simulation
      for (let i = 0; i < LANES.length; i++) {
        if (t >= spawnAt[i]) {
          spawnAt[i] = t + 1.8 + ((i * 7 + Math.floor(t)) % 5) * 0.45;
          if (payments.filter((p) => p.lane === i && p.phase !== "merge").length < 3)
            payments.push({ lane: i, phase: "travel", p: 0, cells: 0, cellT: 0 });
        }
      }
      for (const pay of payments) {
        if (pay.phase === "travel") {
          pay.p += dt / 1.6;
          // Queue behind a payment still confirming at the watcher.
          const blocked = payments.some((o) => o !== pay && o.lane === pay.lane && o.phase === "confirm");
          if (pay.p >= 1) {
            if (blocked) pay.p = 0.94;
            else {
              pay.phase = "confirm";
              pay.p = 0;
            }
          }
        } else if (pay.phase === "confirm") {
          pay.cellT += dt;
          if (pay.cellT >= LANES[pay.lane].rate) {
            pay.cellT = 0;
            pay.cells++;
          }
          if (pay.cells >= CELLS) {
            pay.phase = "merge";
            pay.p = 0;
          }
        } else {
          pay.p += dt / 0.7;
        }
      }
      for (let i = payments.length - 1; i >= 0; i--) {
        const pay = payments[i];
        if (pay.phase === "merge" && pay.p >= 1) {
          payments.splice(i, 1);
          settled++;
          stateFlash = 1;
          hookPulse = 0;
          log.unshift({ text: `payment.settled   ${LANES[pay.lane].code.padEnd(4)}  200`, age: 0, lane: pay.lane });
          if (log.length > 4) log.pop();
        }
      }
      stateFlash = Math.max(0, stateFlash - dt * 1.6);
      if (hookPulse >= 0) hookPulse = hookPulse + dt / 0.6 > 1 ? -1 : hookPulse + dt / 0.6;
      for (const l of log) l.age += dt;

      // --- lanes
      ctx.font = monoFont(12, 500);
      ctx.textBaseline = "middle";
      for (let i = 0; i < LANES.length; i++) {
        const y = laneY(i);
        ctx.fillStyle = BONE;
        ctx.fillText(LANES[i].code, pad, y - 7);
        if (!compact) {
          ctx.fillStyle = MUTE;
          ctx.font = monoFont(9.5);
          ctx.fillText(LANES[i].sub.toUpperCase(), pad, y + 8, 88);
        }
        ctx.font = monoFont(12, 500);
        ctx.strokeStyle = RULE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0, y + 0.5);
        ctx.lineTo(xWatch, y + 0.5);
        ctx.stroke();
        // Watcher
        ctx.strokeStyle = MUTE;
        ctx.strokeRect(xWatch - 5.5, y - 5.5, 11, 11);
        // Confirmation cells
        const active = payments.find((p) => p.lane === i && p.phase === "confirm");
        for (let c = 0; c < CELLS; c++) {
          const cx = xCells + c * (cell + 3);
          ctx.strokeStyle = "rgba(236,231,220,0.22)";
          ctx.strokeRect(cx + 0.5, y - cell / 2 + 0.5, cell - 1, cell - 1);
          if (active && c < active.cells) {
            ctx.fillStyle = "rgba(236,231,220,0.85)";
            ctx.fillRect(cx + 2, y - cell / 2 + 2, cell - 4, cell - 4);
          }
        }
        // Merge curve into the state
        ctx.strokeStyle = RULE;
        const a = c1(y);
        ctx.beginPath();
        ctx.moveTo(xCellsEnd + 4, y);
        ctx.bezierCurveTo(a[0], a[1], c2[0], c2[1], mx, my);
        ctx.stroke();
      }

      // --- payments in flight
      for (const pay of payments) {
        const y = laneY(pay.lane);
        let x = x0;
        let yy = y;
        if (pay.phase === "travel") x = x0 + (xWatch - 14 - x0) * easeInOut(pay.p);
        else if (pay.phase === "confirm") x = xWatch - 14;
        else {
          const k = easeInOut(pay.p);
          const a = c1(y);
          x = bez(xCellsEnd + 4, a[0], c2[0], mx, k);
          yy = bez(y, a[1], c2[1], my, k);
        }
        ctx.fillStyle = pay.phase === "merge" ? SIGNAL : BONE;
        ctx.fillRect(x - 5, yy - 5, 10, 10);
      }

      // --- payment state
      ctx.fillStyle = `rgba(255,90,31,${0.12 * stateFlash})`;
      ctx.fillRect(xState - 30, yState - 36, 108, 72);
      ctx.strokeStyle = stateFlash > 0.05 ? SIGNAL : "rgba(236,231,220,0.4)";
      ctx.strokeRect(xState - 29.5, yState - 35.5, 107, 71);
      ctx.fillStyle = MUTE;
      ctx.font = monoFont(9.5);
      ctx.fillText("PAYMENT STATE", xState - 20, yState - 20);
      ctx.fillStyle = BONE;
      ctx.font = monoFont(20, 500);
      ctx.fillText(String(settled).padStart(3, "0"), xState - 20, yState + 4);
      ctx.fillStyle = MUTE;
      ctx.font = monoFont(9.5);
      ctx.fillText("SETTLED", xState - 20, yState + 22);

      // --- webhook to merchant (a reply path: steel, dashed)
      const yHook = yState + (compact ? 52 : 70);
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = STEEL;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(xState + 24, yState + 36);
      ctx.lineTo(xState + 24, yHook);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      if (hookPulse >= 0) {
        ctx.fillStyle = STEEL;
        ctx.fillRect(xState + 21, yState + 36 + (yHook - yState - 36) * hookPulse - 3, 6, 6);
      }
      ctx.fillStyle = MUTE;
      ctx.fillText("WEBHOOK · SIGNED · RETRIED", xState - 29, yHook + 14);

      // --- log
      ctx.font = monoFont(10);
      const logX = compact ? pad : xState - 29;
      const rowsShown = compact ? 3 : 4;
      for (let i = 0; i < Math.min(log.length, rowsShown); i++) {
        const l = log[i];
        const a = Math.min(1, l.age * 4) * (1 - i * 0.22);
        ctx.globalAlpha = Math.max(0, a);
        ctx.fillStyle = i === 0 ? BONE : MUTE;
        ctx.fillText(l.text, logX, yHook + 36 + i * 16, w - logX - pad);
      }
      ctx.globalAlpha = 1;

      // --- column labels
      ctx.fillStyle = FAINT;
      ctx.font = monoFont(9.5);
      ctx.fillText(compact ? "WATCHERS" : "CHAIN WATCHERS", x0, h * (compact ? 0.05 : 0.07));
      ctx.fillText(compact ? "CONFIRMS" : "CONFIRMATIONS", xCells, h * (compact ? 0.05 : 0.07));
    },
  };
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const bez = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

export default function PaymentsVisual() {
  const ref = useRef<HTMLCanvasElement>(null);
  useLiveCanvas(ref, create);
  return <canvas ref={ref} className="block h-full w-full" aria-hidden="true" />;
}
