import { Instagram, AtSign, type LucideIcon } from "lucide-react";
import type { Format, Platform, Stage } from "@/components/templates/personal-brand/shared/types";

// Stage order drives every column / sort in the Pipeline + Calendar slices.
export const STAGES: { key: Stage; label: string }[] = [
  { key: "ideation", label: "Ideation" },
  { key: "production", label: "Production" },
  { key: "scheduled", label: "Scheduled" },
  { key: "published", label: "Published" },
];

export const stageLabel = (s: Stage): string =>
  STAGES.find((x) => x.key === s)?.label ?? s;

export const PLATFORMS: { key: Platform; label: string; icon: LucideIcon }[] = [
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "threads", label: "Threads", icon: AtSign },
];

export const platformMeta = (p: Platform) =>
  PLATFORMS.find((x) => x.key === p) ?? PLATFORMS[0];

// Subtle, semantic tints for format placeholders (no hardcoded hex).
export const formatTint: Record<Format, string> = {
  post: "bg-brand/15 text-brand",
  reel: "bg-primary/15 text-primary",
  carousel: "bg-secondary text-secondary-foreground",
  story: "bg-accent text-accent-foreground",
  thread: "bg-muted text-muted-foreground",
};

// Stage chip tints used by calendar + timeline.
export const stageTint: Record<Stage, string> = {
  ideation: "bg-muted text-muted-foreground border-border/60",
  production: "bg-accent text-accent-foreground border-border/60",
  scheduled: "bg-brand/15 text-brand border-brand/30",
  published: "bg-primary/15 text-primary border-primary/30",
};
