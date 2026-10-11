"use client";

import { useEffect, useRef, useState } from "react";
import { LIMITS, readFields, TOPICS, validate, type ContactFields, type ContactResponse, type FieldErrors } from "@/lib/contact";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; name: string; email: string }
  | { kind: "error"; message: string };

const ORDER: (keyof ContactFields)[] = ["name", "email", "company", "message"];

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * The contact form. Without JS it is a plain POST to /api/contact with native validation, and the
 * endpoint redirects back to #contact-sent / #contact-failed. With JS: the same rules as the server
 * (lib/contact.ts) give instant, specific errors; the request has a visible sending state; success
 * and failure are both shown for what they are, and failures always offer the email address.
 */
export default function ContactForm({ email }: { email: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef<HTMLInputElement>(null);
  const sidRef = useRef<HTMLInputElement>(null);
  const sentRef = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [announce, setAnnounce] = useState("");

  // JS is running: take over validation, and stamp the start time + a submission id.
  const arm = () => {
    if (formRef.current) formRef.current.noValidate = true;
    if (startedRef.current) startedRef.current.value = String(Date.now());
    if (sidRef.current) sidRef.current.value = newId();
  };
  // Re-arm whenever the form (re)mounts: first load, and after "Write another message".
  const isSent = status.kind === "sent";
  useEffect(() => {
    if (!isSent) arm();
  }, [isSent]);

  useEffect(() => {
    if (status.kind === "sent") sentRef.current?.focus();
  }, [status]);

  const current = () => readFields(new FormData(formRef.current!));

  // Re-check a field once the reader has left it, and keep re-checking it while it's wrong,
  // so an error disappears the moment it's fixed (and never appears while someone is still typing).
  const recheck = (name: keyof ContactFields, force = false) => {
    if (!force && !touched.has(name) && !errors[name]) return;
    const next = validate(current())[name];
    setErrors((e) => (e[name] === next ? e : { ...e, [name]: next }));
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof ContactFields;
    if (!e.target.value.trim() && !touched.has(name)) return; // Tabbing past an empty field isn't an error yet.
    setTouched((t) => new Set(t).add(name));
    recheck(name, true);
  };
  const onInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    recheck(e.currentTarget.name as keyof ContactFields);

  const focusFirst = (errs: FieldErrors) => {
    const first = ORDER.find((k) => errs[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.kind === "sending") return;
    const form = e.currentTarget;
    const errs = validate(current());
    setTouched(new Set(ORDER));
    setErrors(errs);
    const n = Object.keys(errs).length;
    if (n) {
      setAnnounce(`${n === 1 ? "One field needs" : `${n} fields need`} another look.`);
      focusFirst(errs);
      return;
    }

    setStatus({ kind: "sending" });
    setAnnounce("Sending your message…");
    let body: ContactResponse;
    try {
      const res = await fetch("/api/contact", { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      body = (await res.json().catch(() => null)) ?? {
        ok: false,
        code: "send_failed",
        message: `Something went wrong on my side (error ${res.status}). Your message was not sent — please try again, or email ${email}.`,
      };
    } catch {
      body = {
        ok: false,
        code: "send_failed",
        message: `Couldn’t reach the server — check your connection and try again. Your message was not sent; you can also email ${email}.`,
      };
    }

    if (body.ok) {
      const f = current();
      form.reset();
      setErrors({});
      setTouched(new Set());
      setAnnounce("");
      setStatus({ kind: "sent", name: f.name, email: f.email });
      return;
    }
    if (body.code === "invalid" && body.fields) {
      setErrors(body.fields);
      focusFirst(body.fields);
    }
    setStatus({ kind: "error", message: body.message });
    setAnnounce("");
  };

  const err = (name: keyof ContactFields) => errors[name];
  const describedBy = (name: keyof ContactFields, hint?: boolean) =>
    [hint ? `cf-${name}-hint` : "", err(name) ? `cf-${name}-error` : ""].filter(Boolean).join(" ") || undefined;
  const errorText = (name: keyof ContactFields) =>
    err(name) ? (
      <p id={`cf-${name}-error`} className="field__error">
        <span className="sq" aria-hidden="true" />
        {err(name)}
      </p>
    ) : null;

  const sending = status.kind === "sending";

  if (status.kind === "sent") {
    return (
      <div className="contact-done" role="status">
        <h3 ref={sentRef} tabIndex={-1} className="t-h3 flex items-center gap-3 text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)]">
          <span className="sq" aria-hidden="true" />
          Message sent
        </h3>
        <p className="mt-4 max-w-[46ch] text-bone/90">
          Thanks, {status.name} — it’s in my inbox. I’ll reply to <span className="text-bone">{status.email}</span>.
        </p>
        <button type="button" className="btn mt-8" onClick={() => setStatus({ kind: "idle" })}>
          Write another message
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action="/api/contact"
      method="post"
      onSubmit={onSubmit}
      aria-labelledby="contact-form-title"
      aria-busy={sending}
      className="contact-form"
    >
      <h3 id="contact-form-title" className="t-label text-mute">
        Send a message
      </h3>

      {/* No-JS outcomes: the endpoint redirects back to one of these anchors. */}
      <p id="contact-sent" className="target-note">
        <span className="sq" aria-hidden="true" /> Message sent — thank you. I’ll reply by email.
      </p>
      <p id="contact-failed" className="target-note">
        <span className="sq" aria-hidden="true" /> Your message could not be sent. Please email {email} directly.
      </p>

      <div className="mt-6 grid gap-x-6 gap-y-5 md:grid-cols-2">
        <div className="field">
          <label htmlFor="cf-name" className="field__label">
            Name
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={LIMITS.name}
            aria-invalid={!!err("name")}
            aria-describedby={describedBy("name")}
            onBlur={onBlur}
            onInput={onInput}
            className="field__input"
          />
          {errorText("name")}
        </div>

        <div className="field">
          <label htmlFor="cf-email" className="field__label">
            Email
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            required
            maxLength={LIMITS.email}
            aria-invalid={!!err("email")}
            aria-describedby={describedBy("email")}
            onBlur={onBlur}
            onInput={onInput}
            className="field__input"
          />
          {errorText("email")}
        </div>

        <div className="field md:col-span-2">
          <label htmlFor="cf-company" className="field__label">
            Company <span className="text-mute">(optional)</span>
          </label>
          <input
            id="cf-company"
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={LIMITS.company}
            aria-invalid={!!err("company")}
            aria-describedby={describedBy("company")}
            onBlur={onBlur}
            onInput={onInput}
            className="field__input"
          />
          {errorText("company")}
        </div>

        <fieldset className="field md:col-span-2">
          <legend className="field__label">What’s this about?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {TOPICS.map((t, i) => (
              <label key={t.id} className="choice">
                <input type="radio" name="topic" value={t.id} defaultChecked={i === 0} className="sr-only" />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field md:col-span-2">
          <label htmlFor="cf-message" className="field__label">
            Message
          </label>
          <p id="cf-message-hint" className="field__hint">
            What you’re building, and where you’d like help. A few sentences is plenty.
          </p>
          <textarea
            id="cf-message"
            name="message"
            rows={6}
            required
            minLength={LIMITS.messageMin}
            maxLength={LIMITS.messageMax}
            aria-invalid={!!err("message")}
            aria-describedby={describedBy("message", true)}
            onBlur={onBlur}
            onInput={onInput}
            className="field__input field__input--area"
            data-lenis-prevent
          />
          {errorText("message")}
        </div>
      </div>

      {/* Spam trap: hidden from people and assistive tech; bots fill it in. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="cf-website">Leave this field empty</label>
        <input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input ref={startedRef} type="hidden" name="started" defaultValue="" />
      <input ref={sidRef} type="hidden" name="sid" defaultValue="" />

      {status.kind === "error" ? (
        <div role="alert" className="form-alert mt-6">
          <p>{status.message}</p>
          <p className="mt-2">
            <a href={`mailto:${email}`} className="group link-u inline-flex gap-2 text-bone">
              Write an email instead
              <span aria-hidden="true" className="arrow arrow-r">
                →
              </span>
            </a>
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" className="btn btn--solid" aria-disabled={sending}>
          <span className={`sq ${sending ? "contact-pulse" : ""}`} aria-hidden="true" />
          {sending ? "Sending…" : "Send message"}
        </button>
        <p className="t-label text-mute">Goes straight to my inbox.</p>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
    </form>
  );
}
