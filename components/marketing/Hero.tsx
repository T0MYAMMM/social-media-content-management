import Link from "next/link";
import { ArrowRight, Bot, Instagram, AtSign, Images, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppMock } from "./AppMock";

const TRUST = [
  { icon: Instagram, label: "Instagram" },
  { icon: AtSign, label: "Threads" },
  { icon: Bot, label: "AI copilot" },
  { icon: Images, label: "Your media, anywhere" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* warm radial wash behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklch, var(--brand) 12%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto w-full max-w-6xl px-6 pt-28 pb-12 sm:pt-36">
        <div className="mx-auto max-w-3xl text-center">
          <div className="reveal flex justify-center" style={{ ["--d" as string]: "0s" }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-muted-foreground shadow-[var(--shadow-soft)]">
              <Sparkles className="size-3.5 text-brand" />
              The content OS for Instagram &amp; Threads
            </span>
          </div>

          <h1
            className="reveal mt-6 text-balance text-5xl sm:text-6xl md:text-7xl"
            style={{ ["--d" as string]: "0.06s" }}
          >
            Run your whole content rhythm — from spark to published.
          </h1>

          <p
            className="reveal mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
            style={{ ["--d" as string]: "0.12s" }}
          >
            Cadence is the calm, single system for social teams: capture ideas,
            produce posts, schedule, and ship to Instagram and Threads — with an
            AI copilot that actually sounds like your brand.
          </p>

          <div
            className="reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ ["--d" as string]: "0.18s" }}
          >
            <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
              <Link href="/dashboard">
                Open the console
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#pipeline">See the pipeline</Link>
            </Button>
          </div>

          <ul
            className="reveal mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
            style={{ ["--d" as string]: "0.24s" }}
          >
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="size-4 text-brand" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal mt-16" style={{ ["--d" as string]: "0.3s" }}>
          <AppMock />
        </div>
      </div>
    </section>
  );
}
