import { Lightbulb, PenSquare, CalendarDays, Check, ArrowRight } from "lucide-react";
import { Section, Eyebrow } from "./Section";
import { Card } from "@/components/ui/card";

const STAGES = [
  {
    icon: Lightbulb,
    name: "Ideation",
    line: "Capture sparks the moment they hit — voice notes, links, half-thoughts.",
    detail: "Every idea carries a brief and references forward.",
  },
  {
    icon: PenSquare,
    name: "Production",
    line: "Draft copy, build carousels, and script reels in a focused studio.",
    detail: "Copilot drafts in your voice; you stay the editor.",
  },
  {
    icon: CalendarDays,
    name: "Scheduled",
    line: "Slot posts onto a calendar tuned to when your audience is awake.",
    detail: "One queue across Instagram and Threads.",
  },
  {
    icon: Check,
    name: "Published",
    line: "Ship, then watch reach, saves, and replies roll back in.",
    detail: "Results loop straight back into ideation.",
  },
];

export function Pipeline() {
  return (
    <Section id="pipeline" className="reveal">
      <div className="max-w-2xl">
        <Eyebrow>The pipeline</Eyebrow>
        <h2 className="mt-4 text-4xl sm:text-5xl">Four stages. One unbroken flow.</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Nothing falls through the cracks because everything moves along the same
          track — and you can see exactly where every post stands.
        </p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-4">
        {STAGES.map(({ icon: Icon, name, line, detail }, i) => (
          <div key={name} className="relative">
            <Card
              className="reveal h-full gap-0 border-border/60 p-6 shadow-[var(--shadow-soft)]"
              style={{ ["--d" as string]: `${0.06 * i}s` }}
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Icon className="size-5" />
                </span>
                <span className="font-display text-sm text-muted-foreground">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-xl">{name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{line}</p>
              <p className="mt-3 text-xs font-medium text-brand">{detail}</p>
            </Card>
            {i < STAGES.length - 1 && (
              <ArrowRight
                aria-hidden
                className="absolute -right-3 top-1/2 hidden size-5 -translate-y-1/2 text-border lg:block"
              />
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
