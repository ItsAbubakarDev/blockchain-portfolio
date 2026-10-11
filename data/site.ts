export const site = {
  name: "Muhammad Abubakar",
  firstName: "Muhammad",
  lastName: "Abubakar",
  role: "Lead Blockchain Engineer",
  positioning: "Lead Blockchain Engineer · Exchange Infrastructure & L1 Forks",
  url: "https://itsabubakar.me",
  email: "abubakarrashraf20@gmail.com",
  /**
   * Formspree form id — the contact form posts here via /api/contact.
   * Formspree delivers to the address on the account that owns the form (formspree.io → Forms).
   */
  formspreeId: "xnpjvnbv",
  /** WhatsApp in international format without "+" (wa.me links), and as shown to people. */
  whatsapp: {
    number: "923118409238",
    display: "+92 311 8409238",
    greeting: "Hi Muhammad, I found your portfolio and would like to talk about a project.",
  },
  medium: {
    handle: "abubakarrashraf20",
    url: "https://medium.com/@abubakarrashraf20",
  },
  /**
   * Scheduling link. If it's ever emptied, "Book a call" shows as a marked placeholder in
   * `npm run dev` and is left out of production builds, so the live site never shows a dead button.
   */
  bookingUrl: "https://calendly.com/abubakarrashraf20/30min",
  /**
   * Résumé: public/resume.pdf (generated from Muhammad_Abubakar_Lead_Blockchain_Engineer.docx).
   * Preview/download appear only when the file exists (checked at build time), with its real size.
   * To update it, replace the PDF — e.g. Word → File → Save As → PDF. `resumeName` is the saved filename.
   */
  resumeFile: "resume.pdf",
  resumeName: "Muhammad-Abubakar-Resume.pdf",
  github: {
    handle: "ItsAbubakarDev",
    url: "https://github.com/ItsAbubakarDev",
  },
  linkedin: {
    handle: "dev-muhammad-abubakar",
    url: "https://www.linkedin.com/in/dev-muhammad-abubakar",
  },
  location: {
    city: "Islamabad",
    country: "Pakistan",
    countryCode: "PK",
    timeZone: "Asia/Karachi",
    utcOffset: "UTC+5",
    coordinates: "33.68° N · 73.05° E",
  },
  networks: ["Bitcoin", "Ethereum", "BSC", "Base", "Polygon", "TRON"],
  /**
   * The plain-language promise: what the work is and why it's hard, for a reader with no crypto
   * background. The technical layer sits under it in mono (`stackLine`).
   */
  plain:
    "I build the systems that let a business take payments in crypto and know, for certain, that the money arrived. It’s hard because every blockchain works differently — and none of them ever tells you “done”.",
  stackLine: "Bitcoin Core forks · EVM · TRON — Node.js, TypeScript, Solidity, C++",
  description:
    "Muhammad Abubakar is a lead blockchain engineer in Islamabad building exchange infrastructure, custom Bitcoin and EVM L1 forks, and deposit, swap and withdrawal pipelines across Bitcoin, EVM networks and TRON.",
} as const;

/** Roles cycled by the hero rotator (the first is the primary title). */
export const rotatorRoles = [
  "Blockchain Engineer",
  "Blockchain Backend Lead",
  "Bitcoin Core Developer",
  "Smart Contract Developer",
  "Backend Engineer",
] as const;

export const navItems = [
  { id: "about", label: "About", index: "01" },
  { id: "work", label: "Work", index: "02" },
  { id: "research", label: "Research", index: "03" },
  { id: "experience", label: "Experience", index: "04" },
  { id: "skills", label: "Skills", index: "05" },
  { id: "contact", label: "Contact", index: "06" },
] as const;
