// Cadence — single source of brand identity.
// All UI (nav, footer, sidebar, metadata, og-image, sitemap) reads from here.
// Edit-driven: SettingsView writes patches via store; values fall back to these.

import { buildTemplatePaths } from "@/components/templates/_shared/config/template-paths";

export type SiteConfig = {
  brandLetter: string;
  brandName: string;
  tagline: string;
  ownerName: string;
  ownerRole: string;
  ownerInitials: string;
  description: string;
  baseUrl: string;
  twitter: string;
  email: string;
  bookCallHref: string;
  defaultLocale: "id-ID" | "en-US";
  themeColor: string;
};

/** Canonical slug — rename here, all derived paths follow. */
export const TEMPLATE_SLUG = "cadence";
const paths = buildTemplatePaths(TEMPLATE_SLUG);

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandLetter: "C",
  brandName: "Cadence",
  tagline: "The social content OS for Instagram & Threads",
  ownerName: "Studio Owner",
  ownerRole: "owner",
  ownerInitials: "SO",
  description:
    "Cadence runs your content end-to-end — ideation, production, and release — for Instagram and Threads, with an AI copilot that learns your voice.",
  baseUrl: "https://cadence.app",
  twitter: "@cadence",
  email: "hello@cadence.app",
  bookCallHref: `${paths.publicBase}/dashboard`,
  defaultLocale: "en-US",
  themeColor: "#c2562f",
};
