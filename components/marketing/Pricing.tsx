import Link from "next/link";
import { Check } from "lucide-react";
import { Section, Eyebrow } from "./Section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    name: "Solo",
    price: "$0",
    cadence: "/ month",
    blurb: "For the one-person brand finding their rhythm.",
    features: [
      "1 Instagram + 1 Threads account",
      "Full ideation → publish pipeline",
      "50 copilot generations / month",
      "Local upload + paste-URL media",
      "Basic reach & engagement stats",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Studio",
    price: "$24",
    cadence: "/ month",
    blurb: "For creators and small teams shipping every week.",
    features: [
      "Up to 5 connected accounts",
      "Unlimited copilot generations",
      "Brand-voice profile + RAG grounding",
      "Google Photos, Drive & Unsplash media",
      "Unified inbox + full analytics",
      "Smart-time scheduling",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Agency",
    price: "$79",
    cadence: "/ month",
    blurb: "For studios managing many brands at once.",
    features: [
      "Unlimited accounts & workspaces",
      "Per-brand voice profiles",
      "Roles, approvals & audit trail",
      "Priority publishing + support",
      "Exportable reporting",
    ],
    cta: "Talk to us",
    featured: false,
  },
];

export function Pricing() {
  return (
    <Section id="pricing" className="reveal">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow>Pricing</Eyebrow>
        </div>
        <h2 className="mt-4 text-4xl sm:text-5xl">Priced for your pace.</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free, upgrade when your cadence picks up. Every plan includes the
          full pipeline — bigger plans add accounts, AI, and team controls.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
        {TIERS.map((tier, i) => (
          <Card
            key={tier.name}
            className={cn(
              "reveal relative gap-0 p-7 shadow-[var(--shadow-soft)]",
              tier.featured
                ? "border-brand/40 shadow-[var(--shadow-lift)] lg:-translate-y-3"
                : "border-border/60",
            )}
            style={{ ["--d" as string]: `${0.07 * i}s` }}
          >
            {tier.featured && (
              <Badge className="absolute -top-3 left-7 bg-brand text-brand-foreground">
                Most popular
              </Badge>
            )}
            <h3 className="text-2xl">{tier.name}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{tier.blurb}</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold">{tier.price}</span>
              <span className="text-sm text-muted-foreground">{tier.cadence}</span>
            </div>

            <Button
              asChild
              className={cn(
                "mt-6 w-full",
                tier.featured
                  ? "bg-brand text-brand-foreground hover:bg-brand/90"
                  : "",
              )}
              variant={tier.featured ? "default" : "outline"}
            >
              <Link href="/dashboard">{tier.cta}</Link>
            </Button>

            <ul className="mt-7 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  );
}
