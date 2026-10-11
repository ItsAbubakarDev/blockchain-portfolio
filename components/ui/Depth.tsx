import type { ReactNode } from "react";

type Props = {
  /** Summary label. Short, plain, says what's inside. */
  label?: string;
  children: ReactNode;
  className?: string;
};

/**
 * The second layer under a plain-language sentence. A native <details>: works without JS, is
 * keyboard and screen-reader operable as-is, and opens itself for find-in-page.
 * The body never animates in, so opening it never delays reading.
 */
export default function Depth({ label = "Technical detail", children, className = "" }: Props) {
  return (
    <details className={`depth ${className}`}>
      <summary className="depth__summary t-label">
        <span className="depth__icon" aria-hidden="true" />
        {label}
      </summary>
      <div className="depth__body">{children}</div>
    </details>
  );
}
