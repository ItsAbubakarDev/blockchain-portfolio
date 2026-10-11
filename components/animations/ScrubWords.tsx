/**
 * Splits a sentence into word spans for the scroll-scrubbed reveal (see ScrollAnimations).
 * Server component: the text is complete and readable without JS; the effect only dims and
 * re-brightens words as they scroll past.
 */
export default function ScrubWords({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <p className={`scrub-words ${className}`} data-scrub-words>
      {words.map((w, i) => (
        <span key={i} className="w">
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
