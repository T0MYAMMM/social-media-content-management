"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Inbox,
  Lightbulb,
  PenLine,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  useAccounts,
  useIdeas,
  useInteractions,
  useItems,
  useMetrics,
  useStore,
  useBrand,
  fmtDate,
  rel,
} from "@/components/templates/personal-brand/shared/store";
import type { PostMetric } from "@/components/templates/personal-brand/shared/types";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const fmt = (n: number) => compact.format(n);
const engScore = (m: PostMetric) => m.likes + m.comments + m.shares + m.saves;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function PulseView() {
  const { ready } = useStore();
  const items = useItems();
  const ideas = useIdeas();
  const interactions = useInteractions();
  const accounts = useAccounts();
  const metrics = useMetrics();
  const brand = useBrand();

  const brandName = brand?.brandName || "Cadence";
  const today = React.useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    [],
  );

  const drafts = items.filter((i) => i.stage === "ideation" || i.stage === "production").length;
  const now = Date.now();
  const scheduledThisWeek = items.filter(
    (i) => i.stage === "scheduled" && i.scheduledAt && i.scheduledAt >= now && i.scheduledAt <= now + WEEK_MS,
  ).length;
  const unread = interactions.filter((i) => i.status === "unread");
  const totalFollowers = accounts.reduce((a, acc) => a + acc.followers, 0);

  const upNext = React.useMemo(
    () =>
      items
        .filter((i) => i.stage === "scheduled" && i.scheduledAt)
        .sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0))
        .slice(0, 4),
    [items],
  );

  const needsIdeas = ideas.filter((i) => i.status === "spark" || i.status === "exploring").length;
  const recentUnread = React.useMemo(
    () => [...unread].sort((a, b) => b.ts - a.ts).slice(0, 3),
    [unread],
  );

  const topMovers = React.useMemo(
    () => [...metrics].sort((a, b) => engScore(b) - engScore(a)).slice(0, 3),
    [metrics],
  );

  if (!ready) return <PulseSkeleton />;

  return (
    <div className="reveal space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Good to see you · <span className="text-brand">{brandName}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{today}</p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={PenLine} label="Drafts" value={drafts} href="/dashboard/admin/pipeline" />
        <StatCard
          icon={CalendarClock}
          label="Scheduled this week"
          value={scheduledThisWeek}
          href="/dashboard/admin/calendar"
        />
        <StatCard
          icon={Inbox}
          label="Unread interactions"
          value={unread.length}
          href="/dashboard/admin/inbox"
        />
        <StatCard
          icon={Users}
          label="Total followers"
          value={fmt(totalFollowers)}
          href="/dashboard/admin/analytics"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Up next */}
        <Panel
          title="Up next"
          icon={CalendarClock}
          href="/dashboard/admin/calendar"
          action="Calendar"
        >
          {upNext.length === 0 ? (
            <Empty>Nothing scheduled. Plan your next post.</Empty>
          ) : (
            <ul className="divide-y divide-border/60">
              {upNext.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-md bg-accent/60 text-center">
                    <span className="text-[10px] uppercase text-muted-foreground">
                      {i.scheduledAt
                        ? new Date(i.scheduledAt).toLocaleDateString("en-US", { month: "short" })
                        : ""}
                    </span>
                    <span className="-mt-0.5 text-sm font-semibold leading-none">
                      {i.scheduledAt ? new Date(i.scheduledAt).getDate() : "—"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.scheduledAt ? fmtDate(i.scheduledAt) : "Unscheduled"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {i.platform}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Needs attention */}
        <Panel
          title="Needs attention"
          icon={Lightbulb}
          href="/dashboard/admin/ideas"
          action="Ideas"
        >
          <div className="space-y-3">
            <Link
              href="/dashboard/admin/ideas"
              className="flex items-center justify-between rounded-md border border-border/60 bg-card px-3 py-2 transition hover:bg-accent/40"
            >
              <span className="flex items-center gap-2 text-sm">
                <Lightbulb className="size-4 text-brand" />
                Ideas to develop
              </span>
              <span className="text-sm font-semibold">{needsIdeas}</span>
            </Link>
            {recentUnread.length === 0 ? (
              <Empty>Inbox is clear.</Empty>
            ) : (
              <ul className="space-y-2">
                {recentUnread.map((it) => (
                  <li
                    key={it.id}
                    className="rounded-md border border-border/60 bg-card px-3 py-2 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{it.author}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{rel(it.ts)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{it.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>

        {/* Top movers */}
        <Panel
          title="Top movers"
          icon={TrendingUp}
          href="/dashboard/admin/analytics"
          action="Analytics"
        >
          {topMovers.length === 0 ? (
            <Empty>No post metrics yet.</Empty>
          ) : (
            <ul className="space-y-2">
              {topMovers.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.thumbUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-md object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.caption || "Untitled post"}</p>
                    <Badge variant="outline" className="mt-0.5 text-[10px] capitalize">
                      {m.platform}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand">{fmt(engScore(m))}</p>
                    <p className="text-[10px] text-muted-foreground">engagement</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Accounts */}
        <Panel title="Accounts" icon={Users} href="/dashboard/admin/accounts" action="Manage">
          {accounts.length === 0 ? (
            <Empty>No accounts connected yet.</Empty>
          ) : (
            <ul className="space-y-2">
              {accounts.map((a) => (
                <li key={a.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.avatarUrl}
                    alt=""
                    className="size-9 shrink-0 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">@{a.handle}</p>
                    <p className="text-xs capitalize text-muted-foreground">{a.platform}</p>
                  </div>
                  {a.connected ? (
                    <span className="text-xs text-muted-foreground">{fmt(a.followers)} followers</span>
                  ) : (
                    <Link
                      href="/dashboard/admin/accounts"
                      className="text-xs font-medium text-brand hover:underline"
                    >
                      Connect
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Ask Copilot */}
      <Link
        href="/dashboard/admin/copilot"
        className="group flex items-center gap-4 rounded-lg border border-border/60 bg-card p-5 transition hover:border-brand/40 hover:bg-accent/30"
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Ask Copilot</p>
          <p className="text-sm text-muted-foreground">
            Draft captions, brainstorm hooks, and plan your week in your brand voice.
          </p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-brand" />
      </Link>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  href,
  action,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border/60 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="size-4 text-brand" />
          {title}
        </h2>
        <Link
          href={href}
          className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-brand"
        >
          {action} <ArrowRight className="size-3" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function PulseSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
