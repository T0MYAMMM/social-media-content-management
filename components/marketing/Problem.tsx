import { Layers, Clock, ShieldCheck, Compass } from "lucide-react";
import { Section, Eyebrow } from "./Section";

const POINTS = [
  {
    icon: Layers,
    title: "One system, not twelve tabs",
    body: "Notes apps, a spreadsheet calendar, three schedulers, a folder of screenshots. Cadence holds ideation, production, scheduling, and analytics in one place.",
  },
  {
    icon: Clock,
    title: "Stop re-explaining context",
    body: "Every idea keeps its brief, references, and brand notes attached — so picking a post back up next week takes seconds, not an archaeology dig.",
  },
  {
    icon: ShieldCheck,
    title: "Ship without the white-knuckle",
    body: "See exactly what's queued where, catch a typo before it's live, and publish to Instagram and Threads from the same approval flow.",
  },
  {
    icon: Compass,
    title: "A rhythm you can actually keep",
    body: "Cadence is built around cadence: a steady, sustainable pace of posting that compounds — instead of a sprint-then-silence cycle.",
  },
];

export function Problem() {
  return (
    <Section className="reveal">
      <div className="max-w-2xl">
        <Eyebrow>The problem</Eyebrow>
        <h2 className="mt-4 text-4xl sm:text-5xl">
          Great content dies in the gap between idea and post.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          The work isn&apos;t the writing — it&apos;s the scattered tooling around it.
          Cadence collapses that sprawl into one calm pipeline.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {POINTS.map(({ icon: Icon, title, body }, i) => (
          <div
            key={title}
            className="reveal flex gap-4"
            style={{ ["--d" as string]: `${0.06 * i}s` }}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card text-brand shadow-[var(--shadow-soft)]">
              <Icon className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
