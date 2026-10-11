import { site } from "@/data/site";
import LocalTime from "@/components/ui/LocalTime";
import CopyEmail from "@/components/ui/CopyEmail";
import SectionHead, { Statement } from "@/components/ui/SectionHead";
import Button from "@/components/ui/Button";
import { getContactLinks } from "@/lib/contact-links";
import { whatsappUrl } from "@/lib/contact-urls";
import ContactForm from "./contact/ContactForm";

const External = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-baseline gap-2">
    <span className="link-u">{children}</span>
    <span aria-hidden="true" className="arrow arrow-ne text-mute">
      ↗
    </span>
    <span className="sr-only">(opens in new tab)</span>
  </a>
);

/** Dev-only marker for a contact route the owner hasn't supplied yet. Never rendered in production. */
const Placeholder = ({ children }: { children: React.ReactNode }) => (
  <span className="btn btn--placeholder" title="Placeholder — only visible in development">
    {children}
  </span>
);

/**
 * The close: the figure returns on the right (desktop) while the page says what to do next.
 * Fastest routes first (call, résumé, email), then the form, then profiles.
 */
export default function Contact() {
  const links = getContactLinks();
  const hasActions = !!(links.booking || links.resume || links.showPlaceholders);

  return (
    <section id="contact" aria-labelledby="contact-title" className="section relative z-[1] flex min-h-svh flex-col pb-12">
      <div className="wrap flex flex-1 flex-col">
        <SectionHead
          index="06"
          label="Contact"
          meta={
            <>
              {site.location.city} · <LocalTime className="text-bone" /> {site.location.utcOffset}
            </>
          }
        />

        <div className="grid-edit mt-[var(--head-gap)] flex-1 gap-y-12">
          <div className="col-span-full lg:col-span-7">
            <Statement id="contact-title" lines={["Let’s build", "the part", "that has", "to work"]} />

            <p className="t-lead mt-10 max-w-[36ch] text-bone/90 lg:mt-14" data-reveal>
              Tell me what you’re building. A sentence or two is enough to start
              {links.booking ? " — or skip the writing and book a call." : "."}
            </p>

            {hasActions ? (
              <div className="mt-8 flex flex-wrap gap-3" data-reveal>
                {links.booking ? (
                  <Button href={links.booking} variant="solid" external>
                    <span className="sq" aria-hidden="true" />
                    Book a call
                    <span aria-hidden="true" className="arrow arrow-ne">
                      ↗
                    </span>
                  </Button>
                ) : links.showPlaceholders ? (
                  <Placeholder>Book a call — set bookingUrl in data/site.ts</Placeholder>
                ) : null}
                {links.resume ? (
                  <>
                    <a href={links.resume.href} target="_blank" rel="noopener noreferrer" className="btn group">
                      Preview résumé
                      <span aria-hidden="true" className="arrow arrow-ne">
                        ↗
                      </span>
                      <span className="sr-only">(PDF, opens in new tab)</span>
                    </a>
                    <a href={links.resume.href} download={links.resume.download} className="btn group">
                      Download
                      <span className="text-mute">PDF · {links.resume.size}</span>
                      <span aria-hidden="true" className="arrow arrow-d">
                        ↓
                      </span>
                    </a>
                  </>
                ) : links.showPlaceholders ? (
                  <Placeholder>Résumé — add public/{site.resumeFile}</Placeholder>
                ) : null}
              </div>
            ) : null}

            <div className="mt-8" data-reveal>
              <p className="t-label text-mute">Or write to</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-4">
                <a href={`mailto:${site.email}`} className="link-u text-[clamp(1.35rem,0.9rem+1.8vw,2.5rem)] font-medium tracking-[-0.02em] [overflow-wrap:anywhere]">
                  {site.email}
                </a>
                <CopyEmail email={site.email} />
              </div>
            </div>

            {/* No entrance reveal: an interactive form is never hidden, even briefly. */}
            <div className="mt-16 border-t border-rule pt-8 lg:mt-20">
              <ContactForm email={site.email} />
            </div>

            <div className="mt-16 lg:mt-20" data-reveal>
              <dl className="spec max-w-[40rem]">
                <div>
                  <dt className="t-label text-mute">WhatsApp</dt>
                  <dd>
                    <External href={whatsappUrl()}>{site.whatsapp.display}</External>
                  </dd>
                </div>
                <div>
                  <dt className="t-label text-mute">GitHub</dt>
                  <dd>
                    <External href={site.github.url}>github.com/{site.github.handle}</External>
                  </dd>
                </div>
                <div>
                  <dt className="t-label text-mute">LinkedIn</dt>
                  <dd className="[overflow-wrap:anywhere]">
                    <External href={site.linkedin.url}>linkedin.com/in/{site.linkedin.handle}</External>
                  </dd>
                </div>
                <div>
                  <dt className="t-label text-mute">Medium</dt>
                  <dd>
                    <External href={site.medium.url}>medium.com/@{site.medium.handle}</External>
                  </dd>
                </div>
                <div>
                  <dt className="t-label text-mute">Location</dt>
                  <dd>
                    {site.location.city}, {site.location.country}
                    <span className="t-label ml-3 text-mute">
                      <LocalTime className="text-bone" /> {site.location.utcOffset}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
