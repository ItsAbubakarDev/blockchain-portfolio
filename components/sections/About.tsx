import { site } from "@/data/site";
import ScrubWords from "@/components/animations/ScrubWords";
import SectionHead, { Statement } from "@/components/ui/SectionHead";
import Annotated from "@/components/ui/Annotated";
import Depth from "@/components/ui/Depth";

// What each area means in practice — drawn from the projects and roles in data/.
// `plain` is the first layer (no jargon); `tech` sits behind a "Technical detail" toggle.
const AREAS = [
  {
    title: "Blockchain",
    plain: "Connecting a product to the blockchains its customers actually use, so it can see money arrive and send it out.",
    tech: `Integrations across ${site.networks.slice(0, -1).join(", ")} and ${site.networks.at(-1)}: reading blocks, tracking transactions through [[confirmations]], settling payments.`,
  },
  {
    title: "Backend systems",
    plain: "The servers and APIs an app talks to, built so a glitch never charges or pays anyone twice.",
    tech: "Node.js and TypeScript services, REST APIs, and [[webhooks]] that are signed, retried and [[idempotent]].",
  },
  {
    title: "Smart contracts",
    plain: "Programs that live on the blockchain and enforce the rules of a deal without a middleman.",
    tech: "Solidity on [[EVM]] networks, and the backend code that reads, writes and reconciles contract state.",
  },
  {
    title: "Web3 infrastructure",
    plain: "Running the blockchain itself — including new networks forked from Bitcoin — not just renting access to someone else’s.",
    tech: "Bitcoin Core v22 and post-v29 forks in production: chainparams and genesis design, [[seed nodes|seed node]] and DNS seeders, cross-platform builds, systemd-managed full nodes, a live chain split diagnosed and resolved.",
  },
  {
    title: "System architecture",
    plain: "Designing for the day something goes wrong — on a blockchain it will — so nothing is lost and nothing counts twice.",
    tech: "Explicit state machines, events that can arrive twice, and failure handled as a normal code path.",
  },
];

// Each principle: the title, what it means for the business, then the engineering version.
const PRINCIPLES = [
  {
    title: "Assume everything arrives twice",
    plain: "Networks retry. A payment notice can show up twice; it should only ever count once.",
    tech: "Webhooks retry, RPC calls time out, blocks [[reorganise|reorg]]. [[Idempotency|idempotent]] is designed in.",
  },
  {
    title: "State you can point at",
    plain: "At any moment you can ask where a payment is, and why — and get a straight answer.",
    tech: "Every payment, transaction and job has an explicit state and a recorded reason for it.",
  },
  {
    title: "Failure is a code path",
    plain: "Things will go wrong. What happens next is decided in advance, not improvised.",
    tech: "Timeouts, stuck [[nonces]] and dropped transactions are designed like features.",
  },
  {
    title: "Boring where it counts",
    plain: "The payment system should be the least exciting part of your product.",
    tech: "Interesting problems, unremarkable infrastructure. The rail should be the quiet part.",
  },
];

/**
 * About continues the hero: on desktop the figure moves to the left half and turns toward this copy.
 * Statement → a plain sentence that brightens as it is read, with the engineering version under it
 * → focus areas (plain line, technical detail on demand) → working principles.
 */
export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="section relative z-[1]">
      <div className="wrap">
        <SectionHead index="01" label="About" meta="Behind the interface" />

        <div className="grid-edit mt-[var(--head-gap)]">
          <div className="col-span-full lg:col-span-7 lg:col-start-6">
            <Statement id="about-title" lines={["I build the", "infrastructure", "behind the", "interface"]} />
            <ScrubWords
              className="t-lead mt-10 max-w-[34ch] text-[clamp(1.35rem,1rem+1.2vw,2.1rem)] leading-[1.25] lg:mt-14"
              text="Most of what I build is invisible when it works: the code that takes a crypto payment, checks it really landed, moves money out of a wallet safely and tells the rest of the product what happened — on blockchains I often run myself."
            />
            <p className="mt-8 max-w-[52ch] text-mute" data-reveal>
              <span className="t-label mr-2 text-bone">In engineering terms</span>
              <Annotated text="Backend systems for blockchain products — payment rails, wallet services, node infrastructure and chain integrations — plus the APIs and [[webhooks]] that connect them to everything else. Correct first, then fast." />
            </p>
          </div>
        </div>

        <div className="grid-edit mt-20 lg:mt-32">
          <p className="t-label col-span-full mb-6 text-mute lg:col-span-4 lg:col-start-6 lg:mb-0" data-reveal>
            Focus areas
          </p>
          <ol className="col-span-full border-t border-rule lg:col-span-7 lg:col-start-6 lg:mt-6">
            {AREAS.map((area, i) => (
              <li
                key={area.title}
                className="focus-row group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 border-b border-rule pb-3 pt-5 md:grid-cols-[3rem_minmax(0,14rem)_minmax(0,1fr)] md:gap-x-6 md:pt-6"
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="t-label pt-1 text-mute" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="t-h3 flex items-center text-[clamp(1.3rem,1rem+0.9vw,1.75rem)]">
                  <span className="focus-row__dot sq" aria-hidden="true" />
                  {area.title}
                </h3>
                <div className="col-start-2 mt-2 max-w-[46ch] md:col-start-3 md:mt-0">
                  <p className="text-bone/90">{area.plain}</p>
                  <Depth className="mt-1">
                    <p className="text-mute">
                      <Annotated text={area.tech} />
                    </p>
                  </Depth>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-24 lg:mt-36" data-scene-exit>
          <p className="t-label border-t border-rule pt-3 text-mute" data-reveal>
            How I work
          </p>
          <ol className="grid-edit mt-10 gap-y-12">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title} className="col-span-full md:col-span-4 lg:col-span-3" data-reveal style={{ "--i": i } as React.CSSProperties}>
                <p className="t-label text-mute" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")} / 04
                </p>
                <h3 className="mt-4 text-[1.25rem] font-medium leading-tight tracking-[-0.01em]">{p.title}</h3>
                <p className="mt-3 max-w-[34ch] text-bone/90">{p.plain}</p>
                <p className="mt-3 max-w-[34ch] text-[0.9375rem] text-mute">
                  <Annotated text={p.tech} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
