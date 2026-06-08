import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card px-6 py-16 text-center shadow-[var(--shadow-lift)] sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(70% 80% at 50% 0%, color-mix(in oklch, var(--brand) 14%, transparent), transparent 70%)",
          }}
        />
        <div className="reveal mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-brand" />
            Find your cadence
          </span>
          <h2 className="mt-6 text-4xl text-balance sm:text-5xl md:text-6xl">
            Stop juggling tabs. Start keeping a rhythm.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Bring ideation, production, scheduling, and analytics into one calm
            system for Instagram and Threads.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-brand text-brand-foreground hover:bg-brand/90">
              <Link href="/dashboard">
                Open the console
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#pricing">Compare plans</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
