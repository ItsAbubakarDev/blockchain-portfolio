import { Fragment } from "react";
import { lookup } from "@/data/glossary";
import Term from "./Term";

const MARK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/** Strip [[term]] marks, for places that need the plain string (metadata, aria labels). */
export const plainText = (text: string) => text.replace(MARK, "$1");

/**
 * Renders a copy string, turning [[term]] marks into tap/hover definitions from the glossary.
 * Server component: only the terms themselves hydrate.
 */
export default function Annotated({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(MARK)) {
    const [whole, shown, key] = m;
    const entry = lookup(key ?? shown);
    parts.push(text.slice(last, m.index));
    parts.push(
      entry ? (
        <Term key={m.index} term={entry.term} definition={entry.definition}>
          {shown}
        </Term>
      ) : (
        shown
      ),
    );
    last = m.index + whole.length;
  }
  parts.push(text.slice(last));
  return <>{parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)}</>;
}
