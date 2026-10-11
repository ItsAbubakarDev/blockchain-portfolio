import { roles } from "@/data/experience";
import { site } from "@/data/site";
import { technologies } from "@/data/technologies";

export function personJsonLd() {
  const current = roles.find((r) => r.end === null);
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    givenName: site.firstName,
    familyName: site.lastName,
    url: site.url,
    jobTitle: site.role,
    description: site.description,
    ...(current ? { worksFor: { "@type": "Organization", name: current.company } } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.city,
      addressCountry: site.location.countryCode,
    },
    sameAs: [site.github.url, site.linkedin.url],
    knowsAbout: technologies.map((t) => t.name),
  };
  // Escape "<" so the JSON can never close the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
