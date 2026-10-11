import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "line";
  external?: boolean;
  className?: string;
};

/** Link styled as a button. Static: no pointer-following motion, just the hover fill. */
export default function Button({ href, children, variant = "line", external, className = "" }: Props) {
  return (
    <a
      href={href}
      className={`btn ${variant === "solid" ? "btn--solid" : ""} group ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span className="btn__label flex items-center gap-3">{children}</span>
      {external ? <span className="sr-only">(opens in new tab)</span> : null}
    </a>
  );
}
