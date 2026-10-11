import { readFields, TOPICS, validate, type ContactResponse } from "@/lib/contact";
import { site } from "@/data/site";

/**
 * POST /api/contact — validates a contact message and delivers it through Formspree.
 *
 * The form id lives in `site.formspreeId` (data/site.ts). Nothing else to configure: Formspree
 * emails the submission to the address on the account that owns the form. This route sits in front
 * of Formspree so the site keeps its own validation, spam checks and honest error states, and so
 * the form still works with JavaScript disabled.
 *
 * Answers JSON when the client asks for it (the JS form); otherwise (no-JS form post) redirects
 * back to /#contact-sent or /#contact-failed. Spam: honeypot, minimum fill time, per-IP rate
 * limit, link count, same-origin check.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MIN_FILL_MS = 3000;
const MAX_LINKS = 4;

// Best effort: per server instance. Serverless platforms run several instances, so treat this as
// a speed bump, not a guarantee.
const hits = new Map<string, number[]>();

function rateLimited(ip: string, now: number) {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // Some privacy tools strip it; the other checks still apply.
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const wantsJson = (req.headers.get("accept") ?? "").includes("application/json");
  const reply = (body: ContactResponse, status: number) =>
    wantsJson
      ? Response.json(body, { status })
      : Response.redirect(new URL(body.ok ? "/#contact-sent" : "/#contact-failed", req.url), 303);

  if (!sameOrigin(req)) {
    return reply({ ok: false, code: "bad_request", message: "This form can only be sent from the site itself." }, 403);
  }

  let data: FormData;
  try {
    data = await req.formData();
  } catch {
    return reply({ ok: false, code: "bad_request", message: "The form arrived incomplete. Please try again." }, 400);
  }

  // Honeypot: invisible to people (and to screen readers); bots fill every field. Answer as if
  // it worked so the bot learns nothing — nothing is sent.
  if (typeof data.get("website") === "string" && (data.get("website") as string).trim() !== "") {
    return reply({ ok: true }, 200);
  }

  const now = Date.now();
  const started = Number(data.get("started"));
  if (Number.isFinite(started) && started > 0 && started <= now && now - started < MIN_FILL_MS) {
    return reply(
      { ok: false, code: "too_fast", message: "That was faster than anyone can type. Please wait a moment and send it again." },
      400,
    );
  }

  const fields = readFields(data);
  const errors = validate(fields);
  if ((fields.message.match(/https?:\/\//gi)?.length ?? 0) > MAX_LINKS) {
    errors.message = "Messages with lots of links get caught by my spam filter. Please remove a few, or email me directly.";
  }
  if (Object.keys(errors).length) {
    return reply({ ok: false, code: "invalid", message: "Some fields need another look.", fields: errors }, 422);
  }

  // Only real send attempts count, so someone fixing a typo never locks themselves out.
  if (rateLimited(clientIp(req), now)) {
    return reply(
      {
        ok: false,
        code: "rate_limited",
        message: `That’s a lot of messages in a few minutes. Please try again later, or email ${site.email} directly.`,
      },
      429,
    );
  }

  const formId = site.formspreeId.trim();
  if (!formId) {
    console.error("[contact] Not configured: set formspreeId in data/site.ts.");
    return reply(
      {
        ok: false,
        code: "not_configured",
        message: `The form isn’t connected yet, so your message was not sent. Please email ${site.email} directly.`,
      },
      503,
    );
  }

  const topic = TOPICS.find((t) => t.id === fields.topic)?.label ?? "Something else";
  const sid = data.get("sid");

  try {
    const res = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        // `email` / `_replyto` make Formspree set reply-to to the sender.
        name: fields.name,
        email: fields.email,
        _replyto: fields.email,
        _subject: `Portfolio — ${topic}: ${fields.name}${fields.company ? ` (${fields.company})` : ""}`,
        company: fields.company || "—",
        about: topic,
        message: fields.message,
        sent_from: site.url,
        submission_id: typeof sid === "string" && /^[\w-]{8,64}$/.test(sid) ? sid : "—",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[contact] Formspree rejected the message:", res.status, await res.text().catch(() => ""));
      throw new Error(`Formspree ${res.status}`);
    }
  } catch (err) {
    if (!(err instanceof Error && err.message.startsWith("Formspree"))) console.error("[contact] Delivery failed:", err);
    return reply(
      {
        ok: false,
        code: "send_failed",
        message: `Your message didn’t go through on my side. Nothing was sent — please try again, or email ${site.email} directly.`,
      },
      502,
    );
  }

  return reply({ ok: true }, 200);
}
