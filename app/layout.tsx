import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { site } from "@/data/site";
import { personJsonLd } from "@/lib/utils/seo";
import Navigation from "@/components/ui/Navigation";
import FloatingContact from "@/components/ui/FloatingContact";
import { getContactLinks } from "@/lib/contact-links";
import Loader from "@/components/ui/Loader";
import SmoothScroll from "@/components/animations/SmoothScroll";
import RevealObserver from "@/components/animations/RevealObserver";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const title = `${site.name} — ${site.role}`;
const description =
  "Muhammad Abubakar — lead blockchain engineer in Islamabad. Exchange infrastructure, custom Bitcoin and EVM L1 forks, and deposit, swap and withdrawal pipelines across Bitcoin, EVM and TRON.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s — ${site.name}` },
  description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "Muhammad Abubakar",
    "blockchain engineer",
    "backend engineer",
    "smart contract developer",
    "lead blockchain engineer",
    "Bitcoin Core fork",
    "crypto exchange backend",
    "blockchain payment infrastructure",
    "Solidity",
    "Bitcoin Core",
    "EVM",
    "TRON",
    "Islamabad",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: site.name,
    title,
    description,
    locale: "en_US",
    firstName: site.firstName,
    lastName: site.lastName,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body>
        <Script id="js-flag" strategy="beforeInteractive">
          {`document.documentElement.classList.add('js')`}
        </Script>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd() }} />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Loader />
        <Navigation contact={getContactLinks()} />
        {children}
        <FloatingContact />
        <div className="grain" aria-hidden="true" />
        <SmoothScroll />
        <RevealObserver />
      </body>
    </html>
  );
}
