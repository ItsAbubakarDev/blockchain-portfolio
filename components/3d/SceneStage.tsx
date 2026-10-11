"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ComponentType } from "react";
import { gsap, ScrollTrigger } from "@/lib/animations/gsap";
import { fetchAvatar } from "@/lib/three/assets";
import { detectTier } from "@/lib/three/quality";
import { emit, on, stage, type Tier } from "@/lib/three/store";
import { completeTask, dropTask, reportTask } from "@/lib/loading";
import { smoothstep } from "@/lib/utils/math";

let cachedTier: Tier | "off" | undefined;
const getTier = () => (cachedTier ??= detectTier());
const noopSubscribe = () => () => {};

/**
 * The fixed WebGL layer behind the hero, About and Contact.
 * Decides the quality tier, starts the model download immediately (for real loader progress),
 * lazy-loads the 3D chunk, and turns scroll + pointer into plain numbers for the scene.
 */
export default function SceneStage() {
  const tier = useSyncExternalStore(noopSubscribe, getTier, () => null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [Scene, setScene] = useState<ComponentType<{ tier: Tier }> | null>(null);

  // Assets: model bytes and the code chunk load in parallel.
  useEffect(() => {
    if (tier === null) return;
    if (tier === "off") {
      dropTask("chunk");
      dropTask("model");
      dropTask("compile");
      return;
    }
    fetchAvatar((f) => reportTask("model", f))
      .then(() => completeTask("model"))
      .catch(() => {
        completeTask("model");
        completeTask("compile");
      });
    let alive = true;
    import("./HeroScene")
      .then((m) => {
        completeTask("chunk");
        if (alive) setScene(() => m.default);
      })
      .catch(() => {
        dropTask("chunk");
        dropTask("compile");
      });
    return () => {
      alive = false;
    };
  }, [tier]);

  // Intro hand-off: the scene lights up when both the loader has exited and the model is ready.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    stage.reducedMotion = reduced.matches;
    let introDone = false;
    let ready = false;
    const play = () => {
      if (!introDone || !ready) return;
      layer.dataset.live = "true";
      document.documentElement.dataset.scene = "live";
      if (stage.reducedMotion) {
        stage.intro = 1;
        emit("frame");
        return;
      }
      gsap.to(stage, { intro: 1, duration: 2.6, ease: "power2.out" });
    };
    const offIntro = on("intro", () => {
      introDone = true;
      play();
    });
    const offReady = on("scene:ready", () => {
      ready = true;
      play();
    });
    const onReduced = () => {
      stage.reducedMotion = reduced.matches;
      emit("visibility");
    };
    reduced.addEventListener("change", onReduced);
    return () => {
      offIntro();
      offReady();
      reduced.removeEventListener("change", onReduced);
    };
  }, []);

  // Scroll → section progress → camera poses and layer opacity.
  useEffect(() => {
    const layer = layerRef.current;
    const hero = document.getElementById("top");
    const about = document.getElementById("about");
    const contact = document.getElementById("contact");
    const exitEl = document.querySelector<HTMLElement>("[data-scene-exit]");
    if (!layer || !hero) return;

    const applyOpacity = () => {
      const { hero: h, exit: x, contact: c } = stage.scroll;
      let o: number;
      if (stage.portrait) {
        // Phones: the figure belongs to the hero only.
        o = 1 - smoothstep(0.25, 0.7, h);
      } else {
        const outAbout = exitEl ? 1 - x : 1 - smoothstep(0.5, 0.95, h);
        const inContact = contact ? smoothstep(0.15, 0.85, c) : 0;
        o = Math.max(outAbout, inContact);
      }
      const was = stage.opacity > 0;
      stage.opacity = o;
      layer.style.opacity = o.toFixed(3);
      layer.style.visibility = o > 0 ? "visible" : "hidden";
      if (was !== o > 0) emit("visibility");
      if (stage.reducedMotion) emit("frame");
    };

    const triggers = [
      ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          stage.scroll.hero = self.progress;
          applyOpacity();
        },
      }),
    ];
    if (about) {
      triggers.push(
        ScrollTrigger.create({
          trigger: about,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            stage.scroll.about = self.progress;
            applyOpacity();
          },
        }),
      );
    }
    if (exitEl) {
      triggers.push(
        ScrollTrigger.create({
          trigger: exitEl,
          start: "top 92%",
          end: "top 45%",
          onUpdate: (self) => {
            stage.scroll.exit = self.progress;
            applyOpacity();
          },
        }),
      );
    }
    if (contact) {
      triggers.push(
        ScrollTrigger.create({
          trigger: contact,
          start: "top 85%",
          end: "top 15%",
          onUpdate: (self) => {
            stage.scroll.contact = self.progress;
            applyOpacity();
          },
        }),
      );
    }

    const onResize = () => {
      stage.portrait = window.innerWidth < 768 || window.innerWidth / window.innerHeight < 0.8;
      applyOpacity();
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      triggers.forEach((t) => t.kill());
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Pointer → normalised coordinates. A tap on touch screens counts as a brief look.
  useEffect(() => {
    const write = (e: PointerEvent) => {
      stage.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      stage.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      stage.pointer.active = true;
      stage.pointer.lastMove = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.pointerType === "pen") write(e);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") write(e);
    };
    const onLeave = () => {
      stage.pointer.active = false;
      stage.pointer.x = 0;
      stage.pointer.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={layerRef} className="scene-layer" aria-hidden="true">
      <div className="scene-canvas">{Scene && tier && tier !== "off" ? <Scene tier={tier} /> : null}</div>
      {tier === "off" ? (
        // No WebGL, Save-Data or reduced data: a still of the same scene (40 KB) stands in.
        // eslint-disable-next-line @next/next/no-img-element
        <img className="scene-poster" src="/images/avatar-poster.webp" alt="" width={1100} height={966} decoding="async" />
      ) : null}
      <div className="scene-vignette" />
    </div>
  );
}
