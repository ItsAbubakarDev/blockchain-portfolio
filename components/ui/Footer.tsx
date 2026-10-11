import { site } from "@/data/site";

/** `topHref` is "#top" on the home page; a case-study page has no #top, so it scrolls itself. */
export default function Footer({ topHref = "#top" }: { topHref?: string } = {}) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-[1] bg-ink">
      <div className="wrap">
        <div className="t-label flex flex-col gap-4 border-t border-rule py-8 text-mute md:flex-row md:items-baseline md:justify-between">
          <p>
            © {year} {site.name}
          </p>
          <p>Archivo &amp; IBM Plex Mono · Next.js, Three.js, GSAP · Avatar sculpted in code</p>
          <a href={topHref} className="group inline-flex min-h-11 items-center gap-2 text-bone md:min-h-0">
            <span className="link-draw">Back to top</span>
            <span aria-hidden="true" className="arrow">
              ↑
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
