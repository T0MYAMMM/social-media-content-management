import { Lightbulb, PenSquare, CalendarDays, Check } from "lucide-react";

const COLUMNS = [
  {
    title: "Ideation",
    icon: Lightbulb,
    cards: ["Q3 'behind the build' series", "Reply-guy thread on shipping"],
    tone: "muted",
  },
  {
    title: "Production",
    icon: PenSquare,
    cards: ["Carousel — 5 retention tips", "Reel script + hook draft"],
    tone: "brand",
  },
  {
    title: "Scheduled",
    icon: CalendarDays,
    cards: ["Tue 9:00 — IG carousel", "Wed 12:30 — Threads quote"],
    tone: "muted",
  },
  {
    title: "Published",
    icon: Check,
    cards: ["Mon — Reel · 41k reach", "Sun — Thread · 880 replies"],
    tone: "muted",
  },
] as const;

/** Stylized browser-framed kanban mock of the Cadence console. */
export function AppMock() {
  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-border/60 bg-card shadow-[var(--shadow-lift)]">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
        <span className="size-3 rounded-full bg-border" />
        <span className="size-3 rounded-full bg-border" />
        <span className="size-3 rounded-full bg-border" />
        <div className="ml-3 flex h-6 flex-1 items-center rounded-md border border-border/60 bg-background px-3 text-xs text-muted-foreground">
          app.cadence.so/pipeline
        </div>
      </div>

      {/* kanban */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:p-6 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          return (
            <div key={col.title} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon
                  className={col.tone === "brand" ? "size-4 text-brand" : "size-4 text-muted-foreground"}
                />
                {col.title}
              </div>
              {col.cards.map((card, i) => (
                <div
                  key={card}
                  className={[
                    "rounded-lg border p-3 text-xs leading-snug",
                    col.tone === "brand" && i === 0
                      ? "border-brand/30 bg-brand/5 text-foreground"
                      : "border-border/60 bg-background text-muted-foreground",
                  ].join(" ")}
                >
                  {card}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
