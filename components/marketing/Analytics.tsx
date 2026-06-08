import { LineChart, Inbox, Instagram, AtSign, TrendingUp } from "lucide-react";
import { Section, Eyebrow } from "./Section";
import { Card } from "@/components/ui/card";

const BARS = [38, 52, 44, 61, 70, 66, 84];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const SPARK = "M0 34 L20 30 L40 32 L60 22 L80 24 L100 14 L120 16 L140 6";

const MESSAGES = [
  {
    icon: Instagram,
    handle: "@maya.builds",
    text: "this carousel saved me a whole afternoon 🙏",
    platform: "Instagram · DM",
  },
  {
    icon: AtSign,
    handle: "@devnotes",
    text: "where do you keep the full thread? need to bookmark",
    platform: "Threads · reply",
  },
  {
    icon: Instagram,
    handle: "@studio.kn",
    text: "do you take freelance? loved the last reel",
    platform: "Instagram · comment",
  },
];

export function Analytics() {
  return (
    <Section id="analytics" className="reveal">
      <div className="max-w-2xl">
        <Eyebrow>Analytics &amp; inbox</Eyebrow>
        <h2 className="mt-4 text-4xl sm:text-5xl">
          See what&apos;s working — and never miss a reply.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Growth and engagement in plain numbers, plus a unified inbox that pulls
          every comment and DM from Instagram and Threads into one queue.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {/* growth card */}
        <Card className="gap-0 border-border/60 p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <LineChart className="size-4 text-brand" />
              Reach · this week
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
              <TrendingUp className="size-3" />
              +24%
            </span>
          </div>

          <div className="mt-6 flex items-end gap-3" aria-hidden>
            {BARS.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end">
                  <div
                    className={[
                      "w-full rounded-t-md",
                      i === BARS.length - 1 ? "bg-brand" : "bg-brand/25",
                    ].join(" ")}
                    style={{ height: `${h}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{DAYS[i]}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-border/60 pt-4">
            <p className="text-xs text-muted-foreground">Follower growth · 30 days</p>
            <svg
              viewBox="0 0 140 40"
              className="mt-2 h-12 w-full"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d={SPARK} stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`${SPARK} L140 40 L0 40 Z`} fill="var(--brand)" fillOpacity="0.08" />
            </svg>
          </div>
        </Card>

        {/* inbox card */}
        <Card className="gap-0 border-border/60 p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Inbox className="size-4 text-brand" />
              Unified inbox
            </div>
            <span className="rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground">
              3 unread
            </span>
          </div>

          <ul className="mt-5 space-y-3">
            {MESSAGES.map((m) => {
              const Icon = m.icon;
              return (
                <li
                  key={m.handle}
                  className="flex gap-3 rounded-lg border border-border/60 bg-background p-3"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-brand">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{m.handle}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{m.platform}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{m.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </Section>
  );
}
