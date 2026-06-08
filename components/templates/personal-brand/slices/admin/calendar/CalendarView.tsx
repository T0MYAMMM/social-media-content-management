"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarClock,
  Send,
} from "lucide-react";

import { useItems } from "@/components/templates/personal-brand/shared/store";
import type { ContentItem, Stage } from "@/components/templates/personal-brand/shared/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { platformMeta, stageLabel, stageTint } from "../pipeline/shared";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// The timestamp a scheduled/published item lands on, if any.
function itemTs(item: ContentItem): number | null {
  if (item.stage === "published" && item.publishedAt) return item.publishedAt;
  if (item.stage === "scheduled" && item.scheduledAt) return item.scheduledAt;
  return null;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const tsDayKey = (ts: number) => dayKey(new Date(ts));

function buildGrid(viewDate: Date): Date[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay()); // back up to Sunday
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const fmtDayLong = (ts: number) =>
  new Date(ts).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function PlatformDot({ platform }: { platform: ContentItem["platform"] }) {
  const { icon: Icon, label } = platformMeta(platform);
  return <Icon className="size-3 shrink-0" aria-label={label} />;
}

function StageBadge({ stage }: { stage: Stage }) {
  return (
    <Badge variant="outline" className={cn("font-normal capitalize", stageTint[stage])}>
      {stageLabel(stage)}
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */

export function CalendarView() {
  const items = useItems();
  const [viewDate, setViewDate] = React.useState(() => new Date());
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  // Scheduled + published only, indexed by day.
  const dated = React.useMemo(
    () =>
      items
        .map((it) => ({ it, ts: itemTs(it) }))
        .filter((x): x is { it: ContentItem; ts: number } => x.ts !== null),
    [items],
  );

  const byDay = React.useMemo(() => {
    const map = new Map<string, { it: ContentItem; ts: number }[]>();
    for (const entry of dated) {
      const k = tsDayKey(entry.ts);
      const arr = map.get(k) ?? [];
      arr.push(entry);
      map.set(k, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.ts - b.ts);
    return map;
  }, [dated]);

  const grid = React.useMemo(() => buildGrid(viewDate), [viewDate]);
  const month = viewDate.getMonth();
  const todayKey = dayKey(new Date());

  const timeline = React.useMemo(
    () => [...dated].sort((a, b) => b.ts - a.ts).slice(0, 12),
    [dated],
  );

  const selected = selectedKey ? byDay.get(selectedKey) ?? [] : [];

  const shiftMonth = (delta: number) =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));

  return (
    <div className="space-y-8">
      <section className="reveal space-y-6">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Schedule</p>
          <h1 className="text-3xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Everything scheduled and published, laid out month by month.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="min-w-44 text-xl font-semibold tracking-tight">
              {MONTHS[month]} {viewDate.getFullYear()}
            </h2>
            <div className="inline-flex items-center gap-1">
              <Button variant="outline" size="icon" className="size-8" onClick={() => shiftMonth(-1)}>
                <ChevronLeft className="size-4" />
                <span className="sr-only">Previous month</span>
              </Button>
              <Button variant="outline" size="icon" className="size-8" onClick={() => shiftMonth(1)}>
                <ChevronRight className="size-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setViewDate(new Date())}>
            <CalendarDays className="size-4" />
            Today
          </Button>
        </div>
      </section>

      {dated.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-border/60 bg-muted/30 px-6 py-16 text-center">
          <CalendarClock className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No scheduled content yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Schedule items from the Pipeline and they’ll appear here on their planned day.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
            <div className="grid grid-cols-7 border-b border-border/60 bg-muted/40">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {grid.map((date, i) => {
                const k = dayKey(date);
                const dayItems = byDay.get(k) ?? [];
                const inMonth = date.getMonth() === month;
                const isToday = k === todayKey;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => dayItems.length > 0 && setSelectedKey(k)}
                    className={cn(
                      "min-h-24 border-b border-r border-border/40 p-1.5 text-left align-top transition last:border-r-0",
                      "[&:nth-child(7n)]:border-r-0",
                      inMonth ? "bg-card" : "bg-muted/30 text-muted-foreground",
                      dayItems.length > 0 ? "cursor-pointer hover:bg-accent/40" : "cursor-default",
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={cn(
                          "grid size-5 place-items-center rounded-full text-xs tabular-nums",
                          isToday && "bg-brand text-brand-foreground font-semibold",
                          !inMonth && "opacity-60",
                        )}
                      >
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayItems.slice(0, 3).map(({ it }) => (
                        <div
                          key={it.id}
                          className={cn(
                            "flex items-center gap-1 truncate rounded border px-1 py-0.5 text-[10px] leading-tight",
                            stageTint[it.stage],
                          )}
                        >
                          <PlatformDot platform={it.platform} />
                          <span className="truncate">{it.title}</span>
                        </div>
                      ))}
                      {dayItems.length > 3 && (
                        <p className="px-1 text-[10px] text-muted-foreground">
                          +{dayItems.length - 3} more
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">Timeline</h2>
              <Badge variant="secondary">{dated.length}</Badge>
            </div>
            <ol className="space-y-3">
              {timeline.map(({ it, ts }) => {
                const StageIcon = it.stage === "published" ? Send : CalendarClock;
                return (
                  <li
                    key={it.id}
                    className="flex items-center gap-4 rounded-lg border border-border/60 bg-card p-3"
                  >
                    <div className="flex w-20 shrink-0 flex-col items-center rounded-md bg-muted/50 py-1.5 text-center">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {MONTHS[new Date(ts).getMonth()].slice(0, 3)}
                      </span>
                      <span className="text-lg font-semibold leading-none tabular-nums">
                        {new Date(ts).getDate()}
                      </span>
                      <span className="mt-0.5 text-[10px] text-muted-foreground">{fmtTime(ts)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{it.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <PlatformDot platform={it.platform} />
                        {platformMeta(it.platform).label}
                        <span className="opacity-40">·</span>
                        <span className="capitalize">{it.format}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                      <StageIcon className="size-3.5" />
                      <StageBadge stage={it.stage} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}

      <Sheet open={selectedKey !== null} onOpenChange={(open) => !open && setSelectedKey(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selected.length > 0 ? fmtDayLong(selected[0].ts) : "Day"}</SheetTitle>
            <SheetDescription>
              {selected.length} item{selected.length === 1 ? "" : "s"} on this day.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-full px-4 pb-6">
            <div className="space-y-3">
              {selected.map(({ it, ts }) => (
                <div key={it.id} className="rounded-lg border border-border/60 bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{it.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{fmtTime(ts)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="gap-1 font-normal">
                      <PlatformDot platform={it.platform} />
                      {platformMeta(it.platform).label}
                    </Badge>
                    <Badge variant="secondary" className="font-normal capitalize">
                      {it.format}
                    </Badge>
                    <StageBadge stage={it.stage} />
                  </div>
                  {it.caption && (
                    <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{it.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
