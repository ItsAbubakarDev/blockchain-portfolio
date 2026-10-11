// Contact URLs, safe to import from client components (no filesystem access).
import { site } from "@/data/site";

/** wa.me deep link with a short greeting prefilled (opens the app on phones, WhatsApp Web elsewhere). */
export const whatsappUrl = () => `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(site.whatsapp.greeting)}`;

/** mailto with a subject, so messages from the site are easy to spot. */
export const mailtoUrl = () => `mailto:${site.email}?subject=${encodeURIComponent("Hello from your portfolio")}`;
