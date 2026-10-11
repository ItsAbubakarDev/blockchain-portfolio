"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animations/gsap";
import { getLenis } from "@/lib/animations/scroll";
import { emit } from "@/lib/three/store";
import { completeTask, loadingSnapshot } from "@/lib/loading";

const BLOCKS = 12;
const MIN_FIRST = 1300; // ms — long enough to read as intentional, short enough to never annoy
const MIN_REPEAT = 450;
// Measured from navigation start, the page never waits longer than this for 3D: on slow
// connections the hero text arrives first and the figure lights up when its assets land
// (see SceneStatus in the hero rail).
const MAX_WAIT = 3800;
const SEEN_KEY = "ma:seen";

/**
 * The intro: a chain of blocks syncs as the real assets load (fonts, 3D engine, avatar bytes,
 * shader compile). At 100% the counter and chain clear, the overlay wipes up and the hero takes over.
 * Server-rendered so it covers the page from the first paint; hidden entirely without JS.
 */
export default function Loader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const heightRef = useRef<HTMLSpanElement>(null);
  const chainRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const count = countRef.current;
    const chain = chainRef.current;
    if (!root || !count || !chain) return;

    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    const minDuration = reduced ? 0 : seen ? MIN_REPEAT : MIN_FIRST;

    root.dataset.state = "loading";
    html.classList.add("is-loading");
    getLenis()?.stop();
    document.fonts?.ready.then(() => completeTask("fonts"));

    const blocks = Array.from(chain.children) as HTMLElement[];
    const start = performance.now();
    let shown = 0;
    let raf = 0;
    let prev = start;
    let lastBlock = -1;
    let lastLabel = "";
    let finished = false;

    const tick = (now: number) => {
      const elapsed = now - start;
      const dt = Math.min((now - prev) / 1000, 0.1);
      prev = now;
      const snap = loadingSnapshot();
      // rAF timestamps share performance.timeOrigin (navigation start), so slow hydration counts too.
      const forced = now > MAX_WAIT;
      // Never run ahead of real progress, and never faster than the minimum duration allows.
      const target = Math.min(forced ? 1 : snap.progress, minDuration ? elapsed / minDuration : 1);
      shown += (target - shown) * (1 - Math.exp(-7 * dt));
      if (target >= 1 && shown > 0.995) shown = 1;

      const pct = Math.floor(shown * 100);
      count.textContent = String(pct).padStart(3, "0");
      const b = Math.min(BLOCKS, Math.floor(shown * BLOCKS + 0.0001));
      if (b !== lastBlock) {
        blocks.forEach((el, i) => {
          el.dataset.state = i < b ? "done" : i === b ? "current" : "idle";
        });
        if (heightRef.current) heightRef.current.textContent = String(Math.min(b + 1, BLOCKS)).padStart(2, "0");
        lastBlock = b;
      }
      const label = shown >= 1 ? "Ready" : snap.label || "Starting";
      if (label !== lastLabel && labelRef.current) {
        labelRef.current.textContent = label;
        lastLabel = label;
      }

      if (shown >= 1 && !finished) {
        finished = true;
        exit();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const handOver = () => {
      root.dataset.state = "done";
      html.classList.remove("is-loading");
      html.classList.add("is-ready");
      getLenis()?.start();
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      emit("intro");
    };

    const exit = () => {
      if (reduced) {
        gsap.to(root, { opacity: 0, duration: 0.2, onComplete: handOver });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });
      tl.to(root.querySelectorAll("[data-exit='rise']"), { yPercent: -110, duration: 0.7, stagger: 0.05, ease: "expo.in" }, 0.05)
        .to(blocks, { scaleY: 0, duration: 0.45, stagger: 0.025, ease: "power3.in" }, 0)
        .to(root.querySelectorAll("[data-exit='fade']"), { opacity: 0, duration: 0.35, ease: "power2.out" }, 0)
        // The curtain lifts; the hero intro starts while it is still moving.
        .to(root, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1 }, 0.5)
        .add(handOver, 0.5);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={rootRef} className="loader" role="presentation" aria-hidden="true">
      <div className="loader__edge" />
      <div className="wrap flex h-full flex-col justify-between pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="t-label flex justify-between text-mute" data-exit="fade">
          <span className="flex items-center gap-2.5 text-bone">
            <span className="sq" />
            M. Abubakar
          </span>
          <span>Portfolio — 2026</span>
        </div>

        <div className="mx-auto w-full max-w-[34rem]" data-exit="fade">
          <ol ref={chainRef} className="loader__chain">
            {Array.from({ length: BLOCKS }, (_, i) => (
              <li key={i} data-state={i === 0 ? "current" : "idle"} />
            ))}
          </ol>
          <p className="t-label mt-4 flex justify-between text-mute">
            <span>
              Syncing · <span ref={labelRef} className="text-bone">Starting</span>
            </span>
            <span>
              Block <span ref={heightRef} className="text-bone">01</span> / {BLOCKS}
            </span>
          </p>
        </div>

        <div className="flex items-end justify-between gap-6">
          <p className="loader__count">
            <span className="block overflow-hidden">
              <span data-exit="rise" className="block">
                <span ref={countRef}>000</span>
                <span className="loader__pct">%</span>
              </span>
            </span>
          </p>
          <p className="t-label max-w-[18rem] pb-[0.6em] text-right text-mute" data-exit="fade">
            Exchanges · L1 forks
            <br />
            Smart contracts · Backend
          </p>
        </div>
      </div>
    </div>
  );
}
