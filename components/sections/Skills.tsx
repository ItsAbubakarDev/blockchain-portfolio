import { categories, links, technologies } from "@/data/technologies";
import SectionHead, { Statement } from "@/components/ui/SectionHead";
import PatchBay from "./skills/PatchBay";

export default function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="section relative z-[1] bg-ink">
      <div className="wrap">
        <SectionHead index="05" label="Skills" meta={`${categories.length} groups · ${technologies.length} tools · ${links.length} links`} />

        <div className="grid-edit mt-[var(--head-gap)] gap-y-10">
          <Statement id="skills-title" lines={["The stack", "is a graph"]} className="col-span-full lg:col-span-8" />
          <div className="col-span-full max-w-[34ch] self-end md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9" data-reveal>
            <p className="t-lead text-bone/90">
              The tools I work with, from the screen a customer sees down to the blockchain itself.
            </p>
            <p className="mt-3 text-mute">Every tool here earns its place by connecting to another. Select one to trace what it works with.</p>
          </div>
        </div>

        <div className="mt-16 lg:mt-24" data-reveal>
          <PatchBay categories={categories} technologies={technologies} links={links} />
        </div>
      </div>
    </section>
  );
}
