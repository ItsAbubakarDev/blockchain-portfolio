"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export default function CopyEmail({ email }: { email: string }) {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => !!navigator.clipboard?.writeText,
    () => false,
  );
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!supported) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <button type="button" onClick={copy} className="btn">
        {copied && <span className="sq" aria-hidden="true" />}
        {copied ? "Copied" : "Copy"}
        <span className="sr-only"> email address</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </>
  );
}
