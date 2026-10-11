import { projects } from "@/data/projects";
import SectionHead, { Statement } from "@/components/ui/SectionHead";
import NodesVisual from "@/components/visuals/NodesVisual";
import WalletVisual from "@/components/visuals/WalletVisual";
import MarketplaceVisual from "@/components/visuals/MarketplaceVisual";
import Showcase from "./work/Showcase";
import ChainSplitFigure from "./work/ChainSplitFigure";

// Left-hand models per study; captions say exactly what is drawn. Studies without one show their
// architecture drawing alone (data/projects.ts → diagram).
const PRIMARY: Record<string, { node: React.ReactNode; caption: string; kind: "Simulation" | "Concept" }> = {
  "chain-split": {
    node: <ChainSplitFigure />,
    caption: "One history becomes two, then one again — illustrative, not a trace of the incident",
    kind: "Concept",
  },
  forks: { node: <NodesVisual />, caption: "A block propagating across peers, build pipeline below", kind: "Simulation" },
  "evm-wallets": { node: <WalletVisual />, caption: "Per-chain nonce queues through an isolated signer", kind: "Simulation" },
  "real-estate": { node: <MarketplaceVisual />, caption: "Contract events replayed into the off-chain index", kind: "Simulation" },
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function Work() {
  const total = projects.length;

  return (
    <section id="work" aria-labelledby="work-title" className="section relative z-[1] bg-ink">
      <div className="wrap">
        <SectionHead index="02" label="Selected work" meta={`${pad(total)} case studies`} />

        <div className="grid-edit mt-[var(--head-gap)] gap-y-10">
          <Statement id="work-title" lines={["Systems that", "run under", "the product"]} className="col-span-full lg:col-span-8" />
          <div className="col-span-full self-end md:col-span-6 md:col-start-3 lg:col-span-4 lg:col-start-9" data-reveal>
            <p className="t-lead max-w-[34ch] text-bone/90">
              Live products and the systems under them. Each one says what it is in plain words first; the problem, what I
              built and the result follow.
            </p>
            <nav aria-label="Case studies" className="mt-6">
              <ol className="t-label flex flex-wrap gap-x-5 gap-y-2 text-mute">
                {projects.map((p, i) => (
                  <li key={p.id}>
                    <a href={`#project-${p.id}`} className="group inline-flex min-h-8 items-center gap-1.5 hover-fine:hover:text-bone">
                      <span className="text-faint">{pad(i + 1)}</span>
                      <span className="link-draw">{p.title.length <= 14 ? p.title : p.domain}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </div>

        <div className="showcases mt-16 lg:mt-24">
          {projects.map((p, i) => (
            <Showcase key={p.id} project={p} index={pad(i + 1)} total={total} primary={PRIMARY[p.id]} />
          ))}
        </div>
      </div>
    </section>
  );
}
