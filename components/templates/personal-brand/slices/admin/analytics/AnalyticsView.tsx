"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Eye, Heart, Users } from "lucide-react";

import {
  useAccounts,
  useSnapshots,
  useMetrics,
  useStore,
} from "@/components/templates/personal-brand/shared/store";
import type { AnalyticsSnapshot, PostMetric } from "@/components/templates/personal-brand/shared/types";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const ALL = "all";

/** YYYYMMDD number → Date. */
function ymdToDate(ymd: number): Date {
  const y = Math.floor(ymd / 10000);
  const m = Math.floor((ymd % 10000) / 100) - 1;
  const d = ymd % 100;
  return new Date(y, m, d);
}

/** YYYYMMDD → short label like "Jun 3". */
function ymdToLabel(ymd: number): string {
  return ymdToDate(ymd).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const nf = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const fmt = (n: number) => nf.format(n);

type Row = {
  label: string;
  date: number;
  followers: number;
  reach: number;
  impressions: number;
  engagement: number; // percent
  profileViews: number;
};

/** Aggregate snapshots across accounts by date (sum followers/reach/impr/views, avg engagement). */
function aggregateByDate(snaps: AnalyticsSnapshot[]): Row[] {
  const byDate = new Map<number, { rows: AnalyticsSnapshot[] }>();
  for (const s of snaps) {
    const bucket = byDate.get(s.date) ?? { rows: [] };
    bucket.rows.push(s);
    byDate.set(s.date, bucket);
  }
  return [...byDate.entries()]
    .map(([date, { rows }]) => ({
      date,
      label: ymdToLabel(date),
      followers: rows.reduce((a, r) => a + r.followers, 0),
      reach: rows.reduce((a, r) => a + r.reach, 0),
      impressions: rows.reduce((a, r) => a + r.impressions, 0),
      engagement: rows.reduce((a, r) => a + r.engagement, 0) / rows.length / 1000,
      profileViews: rows.reduce((a, r) => a + r.profileViews, 0),
    }))
    .sort((a, b) => a.date - b.date);
}

function toRows(snaps: AnalyticsSnapshot[]): Row[] {
  return snaps
    .map((s) => ({
      date: s.date,
      label: ymdToLabel(s.date),
      followers: s.followers,
      reach: s.reach,
      impressions: s.impressions,
      engagement: s.engagement / 1000,
      profileViews: s.profileViews,
    }))
    .sort((a, b) => a.date - b.date);
}

function delta(rows: Row[], key: keyof Row): number | null {
  if (rows.length < 2) return null;
  const latest = rows[rows.length - 1][key] as number;
  const idx = Math.max(0, rows.length - 31);
  const past = rows[idx][key] as number;
  if (!past) return null;
  return ((latest - past) / past) * 100;
}

const engScore = (m: PostMetric) => m.likes + m.comments + m.shares + m.saves;

export function AnalyticsView() {
  const { ready } = useStore();
  const accounts = useAccounts();
  const snapshots = useSnapshots();
  const metrics = useMetrics();

  const [account, setAccount] = React.useState<string>(ALL);

  const rows = React.useMemo(() => {
    const scoped = account === ALL ? snapshots : snapshots.filter((s) => s.accountId === account);
    return account === ALL ? aggregateByDate(scoped) : toRows(scoped);
  }, [snapshots, account]);

  const latest = rows.length ? rows[rows.length - 1] : null;

  const topContent = React.useMemo(() => {
    const scopedPlatforms =
      account === ALL
        ? null
        : new Set(accounts.filter((a) => a.id === account).map((a) => a.platform));
    return [...metrics]
      .filter((m) => (scopedPlatforms ? scopedPlatforms.has(m.platform) : true))
      .sort((a, b) => engScore(b) - engScore(a))
      .slice(0, 6);
  }, [metrics, account, accounts]);

  if (!ready) return <AnalyticsSkeleton />;

  return (
    <div className="reveal space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Growth, reach, and engagement across your accounts.
          </p>
        </div>
        <Tabs value={account} onValueChange={setAccount}>
          <TabsList>
            <TabsTrigger value={ALL}>All</TabsTrigger>
            {accounts.map((a) => (
              <TabsTrigger key={a.id} value={a.id}>
                @{a.handle}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DeltaStat
          icon={Users}
          label="Followers"
          value={latest ? fmt(latest.followers) : "—"}
          delta={delta(rows, "followers")}
        />
        <DeltaStat
          icon={BarChart3}
          label="Reach"
          value={latest ? fmt(latest.reach) : "—"}
          delta={delta(rows, "reach")}
        />
        <DeltaStat
          icon={Heart}
          label="Engagement rate"
          value={latest ? `${latest.engagement.toFixed(1)}%` : "—"}
          delta={delta(rows, "engagement")}
        />
        <DeltaStat
          icon={Eye}
          label="Profile views"
          value={latest ? fmt(latest.profileViews) : "—"}
          delta={delta(rows, "profileViews")}
        />
      </div>

      {/* Charts */}
      {rows.length === 0 ? (
        <EmptyCard message="No analytics snapshots for this account yet." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Followers growth" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillFollowers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <ChartAxes />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="followers"
                  name="Followers"
                  stroke="var(--brand)"
                  strokeWidth={2}
                  fill="url(#fillFollowers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Reach & impressions">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <ChartAxes />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="reach"
                  name="Reach"
                  stroke="var(--brand)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  name="Impressions"
                  stroke="var(--muted-foreground)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Engagement rate">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <ChartAxes />
                <Tooltip content={<ChartTooltip suffix="%" />} cursor={{ fill: "var(--accent)" }} />
                <Bar dataKey="engagement" name="Engagement" fill="var(--brand)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Top content */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Top content</h2>
        {topContent.length === 0 ? (
          <EmptyCard message="No post metrics yet." />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
            {topContent.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center gap-3 border-border/60 p-3 transition hover:bg-accent/40 [&:not(:last-child)]:border-b"
              >
                <span className="w-4 text-sm font-medium text-muted-foreground">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.thumbUrl}
                  alt=""
                  className="size-11 shrink-0 rounded-md object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.caption || "Untitled post"}</p>
                  <Badge variant="outline" className="mt-1 text-[10px] capitalize">
                    {m.platform}
                  </Badge>
                </div>
                <div className="hidden gap-4 text-xs text-muted-foreground sm:flex">
                  <Metric label="Likes" value={m.likes} />
                  <Metric label="Comments" value={m.comments} />
                  <Metric label="Shares" value={m.shares} />
                  <Metric label="Saves" value={m.saves} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand">{fmt(engScore(m))}</p>
                  <p className="text-[10px] text-muted-foreground">engagement</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChartAxes() {
  return (
    <>
      <XAxis
        dataKey="label"
        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        tickLine={false}
        axisLine={false}
        minTickGap={24}
      />
      <YAxis
        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        tickLine={false}
        axisLine={false}
        width={44}
        tickFormatter={(v: number) => fmt(v)}
      />
    </>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border/60 bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}:{" "}
          <span className="font-medium text-popover-foreground">
            {suffix === "%" ? `${(p.value ?? 0).toFixed(1)}${suffix}` : `${fmt(p.value ?? 0)}${suffix}`}
          </span>
        </p>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-border/60 bg-card p-4 ${className ?? ""}`}>
      <p className="mb-3 text-sm font-medium">{title}</p>
      {children}
    </div>
  );
}

function DeltaStat({
  icon,
  label,
  value,
  delta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta: number | null;
}) {
  const hint =
    delta === null
      ? undefined
      : `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)}% vs 30 days ago`;
  return <StatCard icon={icon} label={label} value={value} hint={hint} />;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="font-medium text-foreground">{fmt(value)}</p>
      <p className="text-[10px]">{label}</p>
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-card/50 py-12 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-lg" />
        <Skeleton className="h-56 w-full rounded-lg" />
      </div>
    </div>
  );
}
