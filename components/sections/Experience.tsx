import { roles } from "@/data/experience";
import { projects } from "@/data/projects";
import { formatMonth, isoMonth } from "@/lib/utils/dates";
import SectionHead, { Statement } from "@/components/ui/SectionHead";
import Timeline from "./experience/Timeline";

export default function Experience() {
  // Computed at build/render time; "Present" moves forward with each deploy.
  const now = isoMonth(new Date());
  const first = roles[roles.length - 1];

  return (
    <section id="experience" aria-labelledby="experience-title" className="section relative z-[1] bg-ink">
      <div className="wrap">
        <SectionHead index="04" label="Experience" meta={`${formatMonth(first.start)} – Present`} />

        <div className="grid-edit mt-[var(--head-gap)] gap-y-10">
          <Statement id="experience-title" lines={["Each role", "closer to", "the chain"]} className="col-span-full lg:col-span-8" />
          <p className="t-lead col-span-full max-w-[34ch] self-end text-mute md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9" data-reveal>
            From product software, to the backend of a live investment platform, to leading the blockchain team behind an
            exchange.
          </p>
        </div>

        <div className="mt-16 lg:mt-28">
          <Timeline roles={roles} now={now} studyTitles={Object.fromEntries(projects.map((p) => [p.id, p.title]))} />
        </div>
      </div>
    </section>
  );
}
