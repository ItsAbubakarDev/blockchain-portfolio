"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";

const format = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: site.location.timeZone,
  }).format(date);

/** Islamabad time, updated on the minute. Renders a placeholder until mounted. */
export default function LocalTime({ className }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let interval = 0;
    const update = () => setTime(format(new Date()));
    update();
    const timeout = window.setTimeout(() => {
      update();
      interval = window.setInterval(update, 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <time className={className} suppressHydrationWarning>
      {time ?? "--:--"}
    </time>
  );
}
