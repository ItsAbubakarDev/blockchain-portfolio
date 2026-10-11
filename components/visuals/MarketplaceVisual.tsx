"use client";

import { useRef } from "react";
import { BONE, FAINT, MUTE, RULE, SIGNAL, STEEL, monoFont, useLiveCanvas, type CanvasScene } from "@/lib/animations/useLiveCanvas";

// Illustrative lifecycle of one listing; each step is a contract event the indexer replays.
const STEPS = [
  { event: "ListingCreated", status: "LISTED" },
  { event: "OfferMade", status: "OFFER" },
  { event: "OfferAccepted", status: "ACCEPTED" },
  { event: "Transfer", status: "SOLD" },
];

type Row = { block: number; event: string; id: number; age: number };

/** Ownership state lives in contracts; an indexer replays their events into an off-chain document. */
function create(): CanvasScene {
  const rows: Row[] = [];
  let step = -1;
  let listing = 7;
  let block = 18420;
  let next = 0.4;
  let pulse = -1;
  let applied = -1;
  let flash = 0;
  const owner = (id: number, sold: boolean) => (sold ? `0x${(id * 7919).toString(16).slice(0, 4)}…b21e` : `0x${(id * 104729).toString(16).slice(0, 4)}…4f0a`);

  const plan = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, id: number) => {
    // An abstract floor plan, different for each listing.
    ctx.strokeStyle = "rgba(236,231,220,0.55)";
    ctx.lineWidth = 1.25;
    ctx.strokeRect(x + 0.5, y + 0.5, w, h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(236,231,220,0.35)";
    const a = 0.35 + ((id * 37) % 30) / 100;
    const b = 0.45 + ((id * 53) % 25) / 100;
    ctx.beginPath();
    ctx.moveTo(x + w * a, y);
    ctx.lineTo(x + w * a, y + h * 0.62);
    ctx.moveTo(x, y + h * b);
    ctx.lineTo(x + w * a - 14, y + h * b);
    ctx.moveTo(x + w * a, y + h * 0.4);
    ctx.lineTo(x + w, y + h * 0.4);
    ctx.moveTo(x + w * 0.7, y + h * 0.4);
    ctx.lineTo(x + w * 0.7, y + h);
    ctx.stroke();
    // Door swing.
    ctx.beginPath();
    ctx.arc(x + w * a, y + h * 0.62, 14, Math.PI / 2, Math.PI);
    ctx.stroke();
  };

  return {
    draw(ctx, w, h, t, dt) {
      // Portrait (phones): event stream on top, the document below it.
      const compact = w < 520;
      const pad = Math.max(14, w * 0.035);
      const colW = compact ? w - pad * 2 : w * 0.4;
      const cardX = compact ? pad : w * 0.55;
      const cardW = w - cardX - pad;
      const maxRows = compact ? 4 : 6;
      const rowGap = compact ? 30 : 34;

      // --- simulation
      if (t >= next) {
        step = (step + 1) % STEPS.length;
        if (step === 0 && rows.length) listing++;
        block += 2 + Math.floor((t * 13) % 5);
        rows.unshift({ block, event: STEPS[step].event, id: listing, age: 0 });
        if (rows.length > 6) rows.pop();
        pulse = 0;
        next = t + (step === STEPS.length - 1 ? 3 : 1.8);
      }
      if (pulse >= 0) {
        pulse += dt / 0.7;
        if (pulse >= 1) {
          pulse = -1;
          applied = step;
          flash = 1;
        }
      }
      flash = Math.max(0, flash - dt * 1.4);
      for (const r of rows) r.age += dt;

      // --- events column
      ctx.textBaseline = "middle";
      ctx.font = monoFont(9.5);
      ctx.fillStyle = FAINT;
      ctx.fillText("ON-CHAIN · CONTRACT EVENTS", pad, h * (compact ? 0.04 : 0.08));
      rows.forEach((r, i) => {
        if (i >= maxRows) return;
        const y = h * (compact ? 0.12 : 0.17) + i * rowGap;
        const a = Math.min(1, r.age * 3) * (1 - i * 0.14);
        ctx.globalAlpha = Math.max(0, a);
        ctx.strokeStyle = i === 0 ? "rgba(236,231,220,0.4)" : RULE;
        ctx.strokeRect(pad + 0.5, y - 12.5, colW - 1, 25);
        ctx.fillStyle = MUTE;
        ctx.font = monoFont(9.5);
        ctx.fillText(`#${r.block}`, pad + 8, y);
        ctx.fillStyle = i === 0 ? BONE : MUTE;
        ctx.font = monoFont(10.5, 500);
        ctx.fillText(r.event, pad + 62, y, colW - 110);
        ctx.fillStyle = MUTE;
        ctx.font = monoFont(9.5);
        ctx.textAlign = "right";
        ctx.fillText(`id ${String(r.id).padStart(3, "0")}`, pad + colW - 8, y);
        ctx.textAlign = "left";
      });
      ctx.globalAlpha = 1;

      // --- indexer
      const cy = compact ? h * 0.12 + maxRows * rowGap + 20 : h * 0.11;
      const ch = compact ? h - cy - pad : h * 0.8;
      ctx.strokeStyle = RULE;
      ctx.fillStyle = FAINT;
      ctx.font = monoFont(9.5);
      if (compact) {
        const ix = w / 2;
        const iy0 = h * 0.12 + (maxRows - 0.5) * rowGap + 4;
        const iy1 = cy - 4;
        ctx.beginPath();
        ctx.moveTo(ix + 0.5, iy0);
        ctx.lineTo(ix + 0.5, iy1);
        ctx.stroke();
        ctx.fillText("INDEXER", ix + 10, (iy0 + iy1) / 2);
        if (pulse >= 0) {
          ctx.fillStyle = STEEL;
          ctx.fillRect(ix - 2.5, iy0 + (iy1 - iy0) * pulse - 3, 6, 6);
        }
      } else {
        const iy = h * 0.17;
        const ix0 = pad + colW + 8;
        const ix1 = cardX - 8;
        ctx.beginPath();
        ctx.moveTo(ix0, iy + 0.5);
        ctx.lineTo(ix1, iy + 0.5);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.fillText("INDEXER", (ix0 + ix1) / 2, iy - 12);
        ctx.textAlign = "left";
        if (pulse >= 0) {
          ctx.fillStyle = STEEL;
          ctx.fillRect(ix0 + (ix1 - ix0) * pulse - 3, iy - 3, 6, 6);
        }
      }

      // --- off-chain document
      ctx.fillStyle = "#151413";
      ctx.fillRect(cardX, cy, cardW, ch);
      ctx.strokeStyle = flash > 0.05 ? `rgba(255,90,31,${0.4 + 0.6 * flash})` : "rgba(236,231,220,0.25)";
      ctx.strokeRect(cardX + 0.5, cy + 0.5, cardW - 1, ch - 1);
      ctx.fillStyle = FAINT;
      ctx.fillText("OFF-CHAIN · FIRESTORE", cardX + 12, cy + 16);
      ctx.fillStyle = MUTE;
      ctx.textAlign = "right";
      ctx.fillText(`listings/${String(listing).padStart(3, "0")}`, cardX + cardW - 12, cy + 16);
      ctx.textAlign = "left";

      const ph = ch * (compact ? 0.3 : 0.42);
      plan(ctx, cardX + 14, cy + 34, cardW - 28, ph, listing);

      const st = applied >= 0 ? STEPS[applied] : STEPS[0];
      const fields: [string, string][] = [
        ["status", st.status],
        ["owner", owner(listing, st.status === "SOLD")],
        ["lastEvent", applied >= 0 ? STEPS[applied].event : "—"],
        ["block", rows[0] && applied >= 0 ? `#${rows[0].block}` : "—"],
      ];
      fields.forEach(([k, v], i) => {
        const y = cy + 34 + ph + (compact ? 20 : 26) + i * (compact ? 21 : 24);
        ctx.fillStyle = MUTE;
        ctx.font = monoFont(9.5);
        ctx.fillText(k, cardX + 14, y);
        ctx.fillStyle = i === 0 && flash > 0.05 ? SIGNAL : BONE;
        ctx.font = monoFont(11, 500);
        ctx.fillText(v, cardX + 100, y, cardW - 114);
        ctx.strokeStyle = RULE;
        ctx.beginPath();
        ctx.moveTo(cardX + 14, y + 12.5);
        ctx.lineTo(cardX + cardW - 14, y + 12.5);
        ctx.stroke();
      });
    },
  };
}

export default function MarketplaceVisual() {
  const ref = useRef<HTMLCanvasElement>(null);
  useLiveCanvas(ref, create);
  return <canvas ref={ref} className="block h-full w-full" aria-hidden="true" />;
}
