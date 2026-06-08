"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Sparkles, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const STEPS = ["Workspace", "Voice", "Pillars", "Content", "Done"];

/**
 * Post-claim onboarding. Captures workspace identity (settings) AND the brand
 * profile (voice/tone/audience/goals/pillars) that powers the AI copilot.
 * Shown once until siteSettings.onboardedAt is set. Skippable.
 */
export function OnboardingWizard({ onDone }: { onDone: () => void }) {
  const upsertSettings = useMutation(api.settings.upsert);
  const upsertBrand = useMutation(api.brandProfile.upsert);
  const seedSample = useMutation(api.seed.seedSample);
  const status = useQuery(api.setup.status);
  const [step, setStep] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [seeded, setSeeded] = React.useState(false);

  const [siteName, setSiteName] = React.useState("");
  const [ownerName, setOwnerName] = React.useState("");
  const [themeDefault, setThemeDefault] = React.useState("system");
  const [voice, setVoice] = React.useState("");
  const [tone, setTone] = React.useState("");
  const [audience, setAudience] = React.useState("");
  const [goals, setGoals] = React.useState("");
  const [pillars, setPillars] = React.useState<string[]>([]);
  const [pillarDraft, setPillarDraft] = React.useState("");

  const alreadySeeded = seeded || status?.seeded;

  function addPillar() {
    const v = pillarDraft.trim();
    if (v && !pillars.includes(v)) setPillars((p) => [...p, v]);
    setPillarDraft("");
  }

  async function finish(skip = false) {
    setBusy(true);
    try {
      await upsertSettings({
        siteName: siteName || undefined,
        ownerName: ownerName || undefined,
        themeDefault: themeDefault || undefined,
        markOnboarded: true,
      });
      if (!skip) {
        await upsertBrand({
          brandName: siteName || undefined,
          voice: voice || undefined,
          tone: tone || undefined,
          audience: audience || undefined,
          goals: goals || undefined,
          pillars: pillars.length ? pillars : undefined,
          markOnboarded: true,
        });
      }
      onDone();
    } finally {
      setBusy(false);
    }
  }

  async function doSeed() {
    setBusy(true);
    try {
      await seedSample();
      setSeeded(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 py-10">
      <Card className="w-full max-w-lg border-border/60 shadow-[var(--shadow-lift)]">
        <CardContent className="p-7">
          <div className="mb-1 flex items-center gap-2 text-brand">
            <Sparkles className="size-4" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">
              Cadence setup · {step + 1}/{STEPS.length}
            </span>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="mb-5 mt-2 h-1.5" />

          {step === 0 && (
            <div className="space-y-4">
              <Head title="Welcome to Cadence" sub="Let's set up your workspace. You can change all of this later." />
              <Field label="Workspace / brand name">
                <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="e.g. Lumen Studio" />
              </Field>
              <Field label="Your name">
                <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Owner name" />
              </Field>
              <Field label="Default theme">
                <div className="flex gap-2">
                  {["light", "dark", "system"].map((t) => (
                    <Button key={t} type="button" variant={themeDefault === t ? "default" : "outline"} size="sm" className="flex-1 capitalize" onClick={() => setThemeDefault(t)}>
                      {t}
                    </Button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Head title="Your brand voice" sub="This teaches the AI copilot how you sound — it grounds every idea and caption." />
              <Field label="Voice — how you sound">
                <Textarea value={voice} onChange={(e) => setVoice(e.target.value)} rows={3} placeholder="e.g. Warm, direct, a little witty. We talk like a smart friend, never a brochure." />
              </Field>
              <Field label="Tone (a few words)">
                <Input value={tone} onChange={(e) => setTone(e.target.value)} placeholder="confident · playful · concise" />
              </Field>
              <Field label="Audience — who you talk to">
                <Textarea value={audience} onChange={(e) => setAudience(e.target.value)} rows={2} placeholder="Indie founders and creators building in public." />
              </Field>
              <Field label="Goals">
                <Textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={2} placeholder="Grow to 25k engaged followers; drive signups; build authority on content ops." />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Head title="Content pillars" sub="The 3–5 themes you post about. The copilot uses these to generate on-brand ideas." />
              <div className="flex gap-2">
                <Input
                  value={pillarDraft}
                  onChange={(e) => setPillarDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPillar(); } }}
                  placeholder="e.g. Behind the scenes"
                />
                <Button type="button" variant="outline" onClick={addPillar}><Plus className="size-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {pillars.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pillars yet — add a few above.</p>
                ) : (
                  pillars.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-sm text-brand">
                      {p}
                      <button type="button" onClick={() => setPillars((ps) => ps.filter((x) => x !== p))} className="opacity-60 hover:opacity-100">
                        <X className="size-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Head title="Sample content" sub="Start with realistic demo data so the console is alive, or start empty." />
              <div className="rounded-lg border border-border/60 p-4">
                {alreadySeeded ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-brand" /> Sample content is loaded.
                  </p>
                ) : (
                  <>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Fills your pipeline with sample ideas, posts, media, analytics, and an inbox so you can explore immediately.
                    </p>
                    <Button type="button" onClick={doSeed} disabled={busy} className="w-full">
                      {busy ? <Loader2 className="size-4 animate-spin" /> : "Load sample content"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <Head title="You're set." sub="" />
              <p className="text-sm text-muted-foreground">
                {siteName ? <><b>{siteName}</b> is ready. </> : null}
                Your brand profile powers the AI copilot — edit it anytime under <b>Brand Profile</b>. Add your API keys in <b>Admin Panel → Integrations</b> to switch on AI and live syncing.
              </p>
            </div>
          )}

          <div className="mt-7 flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)} disabled={busy}>
                <ArrowLeft className="size-4" /> Back
              </Button>
            ) : (
              <button type="button" onClick={() => finish(true)} disabled={busy} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Skip setup
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={busy}>
                Next <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button type="button" onClick={() => finish(false)} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : "Enter Cadence"} <Check className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {sub ? <p className="text-sm text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
