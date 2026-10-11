import type { Delivery } from "@/data/projects";

/**
 * Attribution: these are employer products, not personal projects. Names the company, the role
 * it was delivered in, and what part of it is Muhammad's — so a reader is never left guessing
 * whether he owns the product.
 */
export default function Delivered({ delivery, compact = false }: { delivery: Delivery; compact?: boolean }) {
  return (
    <div className={`delivered ${compact ? "delivered--compact" : ""}`}>
      <p className="t-label delivered__head">
        <span className="sq" aria-hidden="true" />
        Delivered at <span className="text-bone">{delivery.org}</span>
      </p>
      <p className="t-label delivered__role">
        {delivery.role} · {delivery.period}
      </p>
      {compact ? null : <p className="delivered__note">{delivery.note}</p>}
    </div>
  );
}
