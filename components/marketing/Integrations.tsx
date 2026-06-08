import Link from "next/link";
import { Instagram, AtSign, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { Section, Eyebrow } from "./Section";
import { Button } from "@/components/ui/button";

export function Integrations() {
  return (
    <Section className="reveal">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-[var(--shadow-soft)] sm:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Integrations</Eyebrow>
            <h2 className="mt-4 text-4xl sm:text-5xl">Connect your accounts in minutes.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Cadence publishes through the official Instagram Graph API and Threads
              API. Authorize once with secure OAuth — no passwords stored, revoke
              anytime from your Meta settings.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Zap className="size-4 text-brand" />
                Direct publishing, scheduling, and insights pull-back
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-brand" />
                Token-based OAuth — we never see your login
              </li>
            </ul>

            <Button asChild className="mt-8 bg-brand text-brand-foreground hover:bg-brand/90">
              <Link href="/dashboard">
                Connect your accounts
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PlatformTile icon={Instagram} name="Instagram" detail="Graph API" />
            <PlatformTile icon={AtSign} name="Threads" detail="Threads API" />
          </div>
        </div>
      </div>
    </Section>
  );
}

function PlatformTile({
  icon: Icon,
  name,
  detail,
}: {
  icon: typeof Instagram;
  name: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-background p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <Icon className="size-6" />
      </span>
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}
