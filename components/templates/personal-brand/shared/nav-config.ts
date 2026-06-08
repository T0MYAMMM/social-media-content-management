// Cadence — nav config. Imported by layouts and slices needing the
// PUBLIC_BASE / ADMIN_BASE constants and the admin sidebar groups.

import {
  AtSign,
  Bot,
  CalendarDays,
  Columns3,
  Images,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  LineChart,
  PenSquare,
  Settings,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import type {
  AdminNavGroup,
  AdminNavItem,
  FooterColumn,
  NavItem,
  User,
} from "@/components/templates/_shared/types/common";
import type { State } from "./types";
import { DEFAULT_SITE_CONFIG, TEMPLATE_SLUG } from "./site-config";
import { buildAdminPanelNav } from "@/components/templates/_shared/admin-panel/feature-blocks";
import { buildTemplatePaths } from "@/components/templates/_shared/config/template-paths";

const paths = buildTemplatePaths(TEMPLATE_SLUG);
export const PUBLIC_BASE = paths.publicBase;
export const DASHBOARD_BASE = paths.dashboardBase;
export const ADMIN_PANEL_BASE = paths.adminPanelBase;
export const WORKSPACE_BASE = paths.workspaceBase;
/** @deprecated use ADMIN_PANEL_BASE */
export const ADMIN_BASE = ADMIN_PANEL_BASE;

// Marketing landing nav — anchors into the single-page product site.
export const PUBLIC_NAV: NavItem[] = [
  { label: "Pipeline", href: `${PUBLIC_BASE}/#pipeline` },
  { label: "Copilot", href: `${PUBLIC_BASE}/#copilot` },
  { label: "Analytics", href: `${PUBLIC_BASE}/#analytics` },
  { label: "Pricing", href: `${PUBLIC_BASE}/#pricing` },
];

export const PUBLIC_CTA = { label: "Open the console", href: `${PUBLIC_BASE}/dashboard` };

export const FOOTER_COLUMNS: FooterColumn[] = [
  { heading: "Product", items: PUBLIC_NAV },
  {
    heading: "Legal",
    items: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export const FOOTER_TAGLINE = "Cadence — the social content OS";

export const OWNER_USER: User = {
  name: DEFAULT_SITE_CONFIG.ownerName,
  role: DEFAULT_SITE_CONFIG.ownerRole,
  initials: DEFAULT_SITE_CONFIG.ownerInitials,
  email: DEFAULT_SITE_CONFIG.email,
};

/**
 * Build admin primary nav with live counts from the store. Pass the current
 * state from useStore() inside the layout (sidebar reads these reactively).
 */
export function buildAdminPrimaryNav(state: State): AdminNavItem[] {
  const sparks = state.ideas.filter((i) => i.status === "spark" || i.status === "exploring").length;
  const inProduction = state.items.filter((i) => i.stage === "production").length;
  const scheduled = state.items.filter((i) => i.stage === "scheduled").length;
  const unread = state.interactions.filter((i) => i.status === "unread").length;
  return [
    { id: "pulse", label: "Pulse", href: ADMIN_BASE, icon: LayoutDashboard, count: null },
    { id: "ideas", label: "Ideation", href: `${ADMIN_BASE}/ideas`, icon: Lightbulb, count: sparks || null },
    { id: "studio", label: "Studio", href: `${ADMIN_BASE}/studio`, icon: PenSquare, count: inProduction || null },
    { id: "pipeline", label: "Pipeline", href: `${ADMIN_BASE}/pipeline`, icon: Columns3, count: null },
    { id: "calendar", label: "Calendar", href: `${ADMIN_BASE}/calendar`, icon: CalendarDays, count: scheduled || null },
    { id: "gallery", label: "Gallery", href: `${ADMIN_BASE}/gallery`, icon: Images, count: null },
    { id: "analytics", label: "Analytics", href: `${ADMIN_BASE}/analytics`, icon: LineChart, count: null },
    { id: "inbox", label: "Inbox", href: `${ADMIN_BASE}/inbox`, icon: Inbox, count: unread || null },
    { id: "accounts", label: "Accounts", href: `${ADMIN_BASE}/accounts`, icon: AtSign, count: null },
    { id: "brand", label: "Brand Profile", href: `${ADMIN_BASE}/brand`, icon: Sparkles, count: null },
    { id: "copilot", label: "Copilot", href: `${ADMIN_BASE}/copilot`, icon: Bot, count: null },
  ];
}

export const ADMIN_SETTINGS_NAV: AdminNavItem[] = [
  { id: "ai", label: "AI Config", href: `${ADMIN_BASE}/settings/ai`, icon: Wand2 },
  { id: "team", label: "Team", href: `${ADMIN_BASE}/settings/team`, icon: Users },
  { id: "site", label: "Site", href: `${ADMIN_BASE}/settings/site`, icon: Settings },
];

/**
 * Grouped admin nav: Overview / Create / Audience / Brand / Admin Panel.
 */
export function buildAdminNav(state: State): AdminNavGroup[] {
  const flat = buildAdminPrimaryNav(state);
  const pick = (...ids: string[]) =>
    ids.map((id) => flat.find((i) => i.id === id)).filter(Boolean) as AdminNavItem[];

  return [
    { id: "overview", label: "Overview", homeAware: true, items: pick("pulse") },
    { id: "create", label: "Create", items: pick("ideas", "studio", "pipeline", "calendar", "gallery") },
    { id: "audience", label: "Audience", items: pick("analytics", "inbox", "accounts") },
    { id: "brand", label: "Brand & AI", items: pick("brand", "copilot") },
    { id: "admin-panel", label: "Admin Panel", items: buildAdminPanelNav(ADMIN_BASE) },
  ];
}
