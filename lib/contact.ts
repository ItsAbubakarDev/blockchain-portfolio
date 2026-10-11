// Contact form rules, shared by the client (instant feedback) and the route handler (the
// authority). No dependencies, so it costs nothing in the client bundle.

export const TOPICS = [
  { id: "project", label: "A project or contract" },
  { id: "role", label: "A full-time role" },
  { id: "other", label: "Something else" },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];

export type ContactFields = {
  name: string;
  email: string;
  company: string;
  topic: TopicId;
  message: string;
};

export type FieldErrors = Partial<Record<keyof ContactFields, string>>;

export const LIMITS = { name: 100, email: 200, company: 120, messageMin: 20, messageMax: 5000 } as const;

// Deliberately permissive: one @, something on each side, a dot in the domain, no spaces.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Read and trim the fields from a FormData (or anything with .get). */
export function readFields(data: { get(name: string): unknown }): ContactFields {
  const str = (k: string) => {
    const v = data.get(k);
    return typeof v === "string" ? v.trim() : "";
  };
  const topic = str("topic");
  return {
    name: str("name"),
    email: str("email"),
    company: str("company"),
    topic: (TOPICS.some((t) => t.id === topic) ? topic : "other") as TopicId,
    message: str("message"),
  };
}

/** Human error messages, keyed by field. Empty object = valid. */
export function validate(f: ContactFields): FieldErrors {
  const e: FieldErrors = {};
  if (!f.name) e.name = "Please tell me your name.";
  else if (f.name.length > LIMITS.name) e.name = `Please keep your name under ${LIMITS.name} characters.`;

  if (!f.email) e.email = "I need an email address to reply to.";
  else if (f.email.length > LIMITS.email || !EMAIL.test(f.email))
    e.email = "That email address doesn’t look complete — check for a typo.";

  if (f.company.length > LIMITS.company) e.company = `Please keep this under ${LIMITS.company} characters.`;

  if (!f.message) e.message = "Please write a short message.";
  else if (f.message.length < LIMITS.messageMin)
    e.message = `A little more detail helps — at least ${LIMITS.messageMin} characters.`;
  else if (f.message.length > LIMITS.messageMax)
    e.message = `Please keep it under ${LIMITS.messageMax.toLocaleString("en-US")} characters, or email me directly.`;
  return e;
}

/** What the endpoint answers with (JSON requests). */
export type ContactResponse =
  | { ok: true }
  | {
      ok: false;
      code: "invalid" | "too_fast" | "rate_limited" | "not_configured" | "send_failed" | "bad_request";
      message: string;
      fields?: FieldErrors;
    };
