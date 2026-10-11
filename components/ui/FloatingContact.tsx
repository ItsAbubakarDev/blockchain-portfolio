"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { mailtoUrl, whatsappUrl } from "@/lib/contact-urls";

/**
 * WhatsApp + email, pinned bottom-right. Compact and inside the safe area. Stays out of the way on
 * the first screenful of any page — the hero and a case-study title both carry their own actions,
 * and on phones the buttons would cover the opening lines — and again over the Contact section or
 * footer, where the same routes are already on screen beside form fields being typed into.
 */
export default function FloatingContact() {
  const [away, setAway] = useState(true);

  useEffect(() => {
    const targets = [document.getElementById("contact"), document.querySelector("footer")].filter(Boolean) as Element[];
    const visible = new Set<Element>();
    let atTop = true;
    const update = () => setAway(atTop || visible.size > 0);

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      update();
    });
    targets.forEach((t) => io.observe(t));

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const next = window.scrollY < window.innerHeight * 0.6;
        if (next !== atTop) {
          atTop = next;
          update();
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <aside className="fab" data-away={away || undefined} aria-label="Quick contact">
      <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="fab__btn fab__btn--solid">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[22px]">
          <path
            fill="currentColor"
            d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 7c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41"
          />
        </svg>
        <span className="fab__label t-label" aria-hidden="true">WhatsApp</span>
        <span className="sr-only">Message Muhammad on WhatsApp, {site.whatsapp.display} (opens in new tab)</span>
      </a>
      <a href={mailtoUrl()} className="fab__btn">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="5.5" width="18" height="13" rx="1" />
          <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
        </svg>
        <span className="fab__label t-label" aria-hidden="true">Email</span>
        <span className="sr-only">Email Muhammad at {site.email}</span>
      </a>
    </aside>
  );
}
