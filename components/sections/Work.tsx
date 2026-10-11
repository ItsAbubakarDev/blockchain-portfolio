import { projects } from "@/data/projects";
import SectionHead, { Statement } from "@/components/ui/SectionHead";
import PaymentsVisual from "@/components/visuals/PaymentsVisual";
import NodesVisual from "@/components/visuals/NodesVisual";
import WalletVisual from "@/components/visuals/WalletVisual";
import MarketplaceVisual from "@/components/visuals/MarketplaceVisual";
import Showcase from "./work/Showcase";
import Annotated from "@/components/ui/Annotated";
import Depth from "@/components/ui/Depth";

// Each visual is a simulation of the system's behaviour; captions say exactly what is drawn.
const VISUALS: Record<string, { node: React.ReactNode; caption: string }> = {
  payments: { node: <PaymentsVisual />, caption: "Payments on three chain families settle into one state" },
  "bitcoin-fork": { node: <NodesVisual />, caption: "A block propagating across peers, build pipeline below" },
  "evm-wallets": { node: <WalletVisual />, caption: "Per-chain nonce queues through an isolated signer" },
  "real-estate": { node: <MarketplaceVisual />, caption: "Contract events replayed into the off-chain index" },
};

export default function Work() {
  const featured = projects.filter((p) => VISUALS[p.id]);
  const others = projects.filter((p) => !VISUALS[p.id]);
  const total = featured.length;

  return (
    <section id="work" aria-labelledby="work-title" className="section relative z-[1] bg-ink">
      <div className="wrap">
        <SectionHead index="02" label="Selected work" meta={`${String(total).padStart(2, "0")} case studies · ${String(projects.length).padStart(2, "0")} systems`} />

        <div className="grid-edit mt-[var(--head-gap)] gap-y-10">
          <Statement id="work-title" lines={["Systems that", "run under", "the product"]} className="col-span-full lg:col-span-8" />
          <div className="col-span-full self-end md:col-span-6 md:col-start-3 lg:col-span-4 lg:col-start-9" data-reveal>
            <p className="t-lead max-w-[34ch] text-bone/90">
              Systems I’ve built, each in one plain sentence first. The architecture, trade-offs and a working model of
              each sit right underneath.
            </p>
            <nav aria-label="Case studies" className="mt-6">
              <ol className="t-label flex flex-wrap gap-x-5 gap-y-2 text-mute">
                {featured.map((p, i) => (
                  <li key={p.id}>
                    <a href={`#project-${p.id}`} className="group inline-flex min-h-8 items-center gap-1.5 hover-fine:hover:text-bone">
                      <span className="text-faint">{String(i + 1).padStart(2, "0")}</span>
                      <span className="link-draw">{p.domain}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        <div className="showcases mt-16 lg:mt-24">
          {featured.map((p, i) => (
            <Showcase
              key={p.id}
              project={{ ...p, index: String(i + 1).padStart(2, "0") }}
              total={total}
              figure={String(i + 1).padStart(2, "0")}
              caption={VISUALS[p.id].caption}
              visual={VISUALS[p.id].node}
            />
          ))}
        </div>

        {others.length ? (
          <div className="pt-[clamp(5rem,4rem+6vw,9rem)]">
            <p className="t-label border-t border-rule pt-3 text-mute" data-reveal>
              Also built
            </p>
            <div className="grid-edit mt-10 gap-y-14">
              {others.map((p, i) => (
                <article
                  key={p.id}
                  id={`project-${p.id}`}
                  aria-labelledby={`project-${p.id}-title`}
                  className="col-span-full scroll-mt-[calc(var(--nav-h)+16px)] md:col-span-4 lg:col-span-5 lg:even:col-start-7"
                  data-reveal
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <p className="t-label text-mute">{p.domain}</p>
                  <h3 id={`project-${p.id}-title`} className="t-h3 mt-4 text-[clamp(1.75rem,1.2rem+2vw,3rem)]">
                    {p.title}
                  </h3>
                  <p className="mt-5 max-w-[40ch] text-[1.0625rem] leading-relaxed text-bone/90">{p.plain}</p>
                  <Depth className="mt-3">
                    <p className="max-w-[48ch] text-mute">
                      <Annotated text={p.summary} />
                    </p>
                  </Depth>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stack">
                    {p.stack.map((s) => (
                      <li key={s} className="chip">
                        {s}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
