"use client";

import { useEffect, useRef, useState } from "react";
import { navItems, site } from "@/data/site";
import { getLenis, scrollToId } from "@/lib/animations/scroll";
import type { ContactLinks } from "@/lib/contact-links";
import { whatsappUrl } from "@/lib/contact-urls";
import LocalTime from "./LocalTime";

const WATCHED = ["top", ...navItems.map((n) => n.id)];

export default function Navigation({ contact }: { contact: ContactLinks }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // The header stays put (it carries the contact action); it gains a solid background after 40px.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 40);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Active section: whichever section crosses the middle band of the viewport.
  useEffect(() => {
    const sections = WATCHED.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          setActive(navItems.some((n) => n.id === id) ? id : null);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Mobile menu: inert background, Esc to close, focus management, scroll lock.
  useEffect(() => {
    if (!menuOpen) return;
    const main = document.querySelector("main");
    const header = headerRef.current;
    const toggle = toggleRef.current;
    main?.setAttribute("inert", "");
    header?.setAttribute("inert", "");
    document.documentElement.style.overflow = "hidden";
    getLenis()?.stop();
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      main?.removeAttribute("inert");
      header?.removeAttribute("inert");
      document.documentElement.style.overflow = "";
      getLenis()?.start();
      toggle?.focus();
    };
  }, [menuOpen]);

  const onMenuLink = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setMenuOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToId(id)));
  };

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]"
      >
        <div
          aria-hidden="true"
          className={`absolute inset-0 border-b border-rule bg-ink/70 backdrop-blur-[10px] transition-opacity duration-300 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="wrap relative flex h-[var(--nav-h)] items-center justify-between gap-6">
          <a href="#top" className="nav-mark flex min-h-11 items-center gap-2.5 text-bone" data-intro style={{ "--d": "700ms" } as React.CSSProperties}>
            <span className="sq" aria-hidden="true" />
            <span>
              Abubakar<span className="sr-only"> — back to top</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden md:block" data-intro style={{ "--d": "800ms" } as React.CSSProperties}>
            <ul className="flex items-center gap-6 lg:gap-9">
              {/* Contact is the header action on the right, not a list item. */}
              {navItems.filter((item) => item.id !== "contact").map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={isActive ? "true" : undefined}
                      className="t-label group flex min-h-11 items-center gap-2"
                    >
                      <span
                        aria-hidden="true"
                        className={`sq transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0"}`}
                      />
                      <span aria-hidden="true" className="text-faint">
                        {item.index}
                      </span>
                      <span
                        className={`link-draw transition-colors duration-200 ${
                          isActive ? "text-bone" : "text-mute hover-fine:group-hover:text-bone"
                        }`}
                      >
                        {item.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <p className="t-label hidden items-center gap-2 text-mute xl:flex" data-intro style={{ "--d": "900ms" } as React.CSSProperties}>
            <span>ISB</span>
            <LocalTime className="text-bone" />
            <span>{site.location.utcOffset}</span>
          </p>

          {/* The one conversion action that is on screen at every scroll position. */}
          <div className="flex items-center gap-3" data-intro style={{ "--d": "850ms" } as React.CSSProperties}>
            <a
              href="#contact"
              aria-current={active === "contact" ? "true" : undefined}
              className="nav-cta t-label inline-flex min-h-11 items-center gap-2 border border-[rgb(236_231_220/0.3)] px-3 text-bone transition-colors duration-200 hover-fine:hover:border-bone"
            >
              <span className="sq" aria-hidden="true" />
              Hire me
            </a>

          <button
            ref={toggleRef}
            type="button"
            className="t-label -mr-2 flex min-h-11 items-center gap-2 px-2 text-bone md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            Menu
            <span aria-hidden="true" className="flex flex-col gap-[3px]">
              <span className="block h-px w-4 bg-bone" />
              <span className="block h-px w-4 bg-bone" />
            </span>
          </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!menuOpen}
        data-lenis-prevent
        className="fixed inset-0 z-[60] flex flex-col bg-ink pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <div className="wrap flex h-[var(--nav-h)] items-center justify-between">
          <span className="t-label flex items-center gap-2.5 text-bone">
            <span className="sq" aria-hidden="true" />
            Abubakar
          </span>
          <button
            ref={closeRef}
            type="button"
            className="t-label -mr-2 min-h-11 px-2 text-bone"
            onClick={() => setMenuOpen(false)}
          >
            Close
          </button>
        </div>
        <nav aria-label="Mobile" className="wrap flex flex-1 flex-col justify-center">
          <ul className="border-t border-rule">
            {navItems.map((item, i) => (
              <li key={item.id} className="border-b border-rule">
                <a
                  href={`#${item.id}`}
                  onClick={(e) => onMenuLink(e, item.id)}
                  className="flex items-baseline justify-between py-4"
                  style={{ animation: menuOpen ? `fade-up 560ms var(--ease-out) ${i * 50}ms both` : undefined }}
                >
                  <span className="t-h3 text-bone">{item.label}</span>
                  <span className="t-label text-mute">{item.index}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {/* Every contact route, one tap away from anywhere on the page. */}
        <div className="wrap pb-6">
          <ul className="t-label flex flex-wrap gap-2">
            {contact.booking ? (
              <li>
                <a href={contact.booking} target="_blank" rel="noopener noreferrer" className="btn btn--solid min-h-11">
                  <span className="sq" aria-hidden="true" />
                  Book a call ↗<span className="sr-only"> (opens in new tab)</span>
                </a>
              </li>
            ) : null}
            <li>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="btn min-h-11">
                WhatsApp ↗<span className="sr-only"> (opens in new tab)</span>
              </a>
            </li>
            {contact.resume ? (
              <>
                <li>
                  <a href={contact.resume.href} target="_blank" rel="noopener noreferrer" className="btn min-h-11">
                    Résumé ↗<span className="sr-only"> (PDF preview, opens in new tab)</span>
                  </a>
                </li>
                <li>
                  <a href={contact.resume.href} download={contact.resume.download} className="btn min-h-11">
                    Download ↓<span className="sr-only"> résumé PDF</span>
                  </a>
                </li>
              </>
            ) : null}
          </ul>
          <div className="t-label mt-5 flex items-center justify-between gap-4 text-mute">
            <a href={`mailto:${site.email}`} className="link-u flex min-h-11 items-center text-bone [overflow-wrap:anywhere]">
              {site.email}
            </a>
            <span className="flex shrink-0 gap-2">
              ISB <LocalTime className="text-bone" />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
