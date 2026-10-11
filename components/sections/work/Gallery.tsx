"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { GalleryGroup, GalleryItem } from "@/data/gallery";

type Props = { groups: GalleryGroup[]; project: string };

/**
 * Product screenshots as horizontal sliders, one per group (web / mobile), read left to right.
 *
 * The track is a real scroll container, so touch swipe, trackpad, shift+wheel and arrow keys all
 * work natively; the buttons page it by one viewport-width. Scroll snapping keeps slides aligned.
 * Clicking a slide opens the shared lightbox. next/image serves resized WebP and lazy-loads
 * everything off-screen, so a 36-shot track costs almost nothing until it is scrolled.
 */
export default function Gallery({ groups, project }: Props) {
  // Lightbox state is shared across groups: {group index, item index}.
  const [open, setOpen] = useState<{ g: number; i: number } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      closeRef.current?.focus();
    }
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onClose = () => {
      setOpen(null);
      openerRef.current?.focus();
    };
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, []);

  const step = useCallback(
    (delta: number) =>
      setOpen((o) => {
        if (!o) return o;
        const n = groups[o.g].items.length;
        return { g: o.g, i: (o.i + delta + n) % n };
      }),
    [groups],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const current: GalleryItem | null = open ? groups[open.g].items[open.i] : null;

  return (
    <>
      {groups.map((group, gi) => (
        <Track
          key={group.name}
          group={group}
          project={project}
          onOpen={(i, el) => {
            openerRef.current = el;
            setOpen({ g: gi, i });
          }}
        />
      ))}

      <dialog
        ref={dialogRef}
        className="lb"
        aria-label={`${project} screenshots`}
        onClick={(e) => e.target === dialogRef.current && close()}
      >
        {current && open ? (
          <div className="lb__inner">
            <p className="lb__bar t-label">
              <span className="min-w-0 truncate">
                <span className="text-bone">{current.label}</span>
                <span className="text-mute"> — {groups[open.g].title}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <span className="px-2 text-mute" aria-hidden="true">
                  {open.i + 1}/{groups[open.g].items.length}
                </span>
                <button type="button" className="lb__btn" onClick={() => step(-1)}>
                  <span aria-hidden="true">←</span>
                  <span className="sr-only">Previous screenshot</span>
                </button>
                <button type="button" className="lb__btn" onClick={() => step(1)}>
                  <span aria-hidden="true">→</span>
                  <span className="sr-only">Next screenshot</span>
                </button>
                <button ref={closeRef} type="button" className="lb__btn" onClick={close}>
                  <span aria-hidden="true">✕</span>
                  <span className="sr-only">Close</span>
                </button>
              </span>
            </p>
            <div className="lb__stage">
              <Image
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                sizes="(min-width: 1280px) 80vw, 95vw"
                className="lb__img"
                priority
              />
            </div>
            {/* The image's alt already carries this text; don't read it twice. */}
            <p className="lb__alt" aria-hidden="true">
              {current.alt}
            </p>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

function Track({
  group,
  project,
  onOpen,
}: {
  group: GalleryGroup;
  project: string;
  onOpen: (i: number, el: HTMLButtonElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduced ? "auto" : "smooth" });
  };

  const label = `${project} — ${group.title}`;

  return (
    <section className="gal" aria-label={label}>
      <header className="gal__head">
        <p className="t-label min-w-0">
          <span className="text-bone">{group.title}</span>
          {/* The note is context, not a label — it gives way before the controls do. */}
          <span className="hidden text-mute sm:inline"> — {group.note}</span>
        </p>
        <span className="flex shrink-0 items-center gap-1">
          <span className="t-label px-2 text-mute" aria-hidden="true">
            {group.items.length}
          </span>
          <button type="button" className="gal__btn" onClick={() => page(-1)} disabled={edge.start}>
            <span aria-hidden="true">←</span>
            <span className="sr-only">Scroll {label} left</span>
          </button>
          <button type="button" className="gal__btn" onClick={() => page(1)} disabled={edge.end}>
            <span aria-hidden="true">→</span>
            <span className="sr-only">Scroll {label} right</span>
          </button>
        </span>
      </header>

      {/* tabIndex makes the track reachable so arrow keys can scroll it. */}
      <div ref={ref} className="gal__track" tabIndex={0} role="group" aria-label={`${label}, scrollable`}>
        {group.items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            className="gal__slide"
            style={{ aspectRatio: `${item.width} / ${item.height}` }}
            onClick={(e) => onOpen(i, e.currentTarget)}
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(min-width: 1024px) 30vw, 70vw"
              className="gal__img"
              loading="lazy"
            />
            <span className="gal__cap t-label">
              <span className="gal__cap__text">{item.label}</span>
              <span aria-hidden="true" className="gal__zoom">
                ⤢
              </span>
              <span className="sr-only"> — view larger</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
