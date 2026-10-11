import { statSync } from "node:fs";
import { join } from "node:path";
import { site } from "@/data/site";

export type ContactLinks = {
  /** Scheduling URL, or null when not set yet. */
  booking: string | null;
  /** Résumé link + human size, or null when public/<resumeFile> doesn't exist. */
  resume: { href: string; download: string; size: string } | null;
  /** In development, show marked placeholders for whatever is missing. */
  showPlaceholders: boolean;
};

/** Server only (reads the filesystem). Resolved at build/render time, so no link points at a missing file. */
export function getContactLinks(): ContactLinks {
  let resume: ContactLinks["resume"] = null;
  try {
    const { size } = statSync(join(process.cwd(), "public", site.resumeFile));
    resume = {
      href: `/${site.resumeFile}`,
      download: site.resumeName,
      size: size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`,
    };
  } catch {
    resume = null;
  }
  return {
    booking: site.bookingUrl.trim() || null,
    resume,
    showPlaceholders: process.env.NODE_ENV === "development",
  };
}

