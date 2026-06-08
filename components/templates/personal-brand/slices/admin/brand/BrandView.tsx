"use client";

import * as React from "react";
import { toast } from "sonner";
import { Sparkles, Plus, X, Check, ThumbsUp, ThumbsDown } from "lucide-react";

import { useBrand, useStore } from "@/components/templates/personal-brand/shared/store";
import type { BrandProfile } from "@/components/templates/personal-brand/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Form = {
  brandName: string;
  voice: string;
  tone: string;
  audience: string;
  goals: string;
  pillars: string[];
  dos: string[];
  donts: string[];
};

const EMPTY: Form = {
  brandName: "",
  voice: "",
  tone: "",
  audience: "",
  goals: "",
  pillars: [],
  dos: [],
  donts: [],
};

function fromProfile(b: BrandProfile | null): Form {
  if (!b) return EMPTY;
  return {
    brandName: b.brandName ?? "",
    voice: b.voice ?? "",
    tone: b.tone ?? "",
    audience: b.audience ?? "",
    goals: b.goals ?? "",
    pillars: b.pillars ?? [],
    dos: b.dos ?? [],
    donts: b.donts ?? [],
  };
}

/* -------------------------------------------------------------------------- */
/* Chip / list editors                                                        */
/* -------------------------------------------------------------------------- */

function ChipEditor({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = React.useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <Badge key={v} variant="secondary" className="gap-1 font-normal">
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${v}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" size="icon" onClick={add} aria-label="Add">
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function ListEditor({
  values,
  onChange,
  placeholder,
  tone,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  tone: "do" | "dont";
}) {
  const [draft, setDraft] = React.useState("");
  const Icon = tone === "do" ? ThumbsUp : ThumbsDown;
  const accent = tone === "do" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      {values.length > 0 ? (
        <ul className="space-y-1.5">
          {values.map((v, i) => (
            <li
              key={`${v}-${i}`}
              className="flex items-center gap-2 rounded-md border border-border/60 bg-card px-2.5 py-1.5 text-sm"
            >
              <Icon className={cn("size-3.5 shrink-0", accent)} />
              <span className="min-w-0 flex-1 truncate">{v}</span>
              <button
                type="button"
                onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" size="icon" onClick={add} aria-label="Add">
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* View                                                                       */
/* -------------------------------------------------------------------------- */

export function BrandView() {
  const brand = useBrand();
  const { dispatch } = useStore();
  const [form, setForm] = React.useState<Form>(() => fromProfile(brand));

  // Initialize local state once the profile loads / changes identity.
  React.useEffect(() => {
    setForm(fromProfile(brand));
  }, [brand]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const fields: { filled: boolean }[] = [
    { filled: !!form.brandName.trim() },
    { filled: !!form.voice.trim() },
    { filled: !!form.tone.trim() },
    { filled: !!form.audience.trim() },
    { filled: !!form.goals.trim() },
    { filled: form.pillars.length > 0 },
    { filled: form.dos.length > 0 },
    { filled: form.donts.length > 0 },
  ];
  const filledCount = fields.filter((f) => f.filled).length;
  const completeness = Math.round((filledCount / fields.length) * 100);

  const save = () => {
    dispatch({
      type: "brand.upsert",
      patch: {
        brandName: form.brandName.trim(),
        voice: form.voice.trim(),
        tone: form.tone.trim(),
        audience: form.audience.trim(),
        goals: form.goals.trim(),
        pillars: form.pillars,
        dos: form.dos,
        donts: form.donts,
        ...(brand?.onboardedAt ? {} : { markOnboarded: true }),
      },
    });
    toast.success("Brand profile saved");
  };

  return (
    <div className="reveal space-y-6 pb-24">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Brand Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your voice, pillars, audience, and goals — the spine of the AI copilot.
        </p>
      </div>

      <Card className="border-border/60 bg-accent/30">
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-brand" />
            <p className="text-xs text-muted-foreground">
              Cadence&apos;s copilot uses this profile to understand your voice and generate on-brand ideas &amp;
              captions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
              {completeness}% complete
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identity &amp; voice</CardTitle>
            <CardDescription>How your brand introduces and sounds like itself.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="brandName">Brand name</Label>
              <Input
                id="brandName"
                value={form.brandName}
                onChange={(e) => set("brandName", e.target.value)}
                placeholder="e.g. Atelier Nord"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tone">Tone</Label>
              <Input
                id="tone"
                value={form.tone}
                onChange={(e) => set("tone", e.target.value)}
                placeholder="e.g. Warm, considered, a little playful"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="voice">Voice</Label>
              <Textarea
                id="voice"
                value={form.voice}
                onChange={(e) => set("voice", e.target.value)}
                placeholder="How we sound — sentence rhythm, vocabulary, attitude…"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audience &amp; goals</CardTitle>
            <CardDescription>Who you talk to and what you&apos;re working toward.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="audience">Audience</Label>
              <Textarea
                id="audience"
                value={form.audience}
                onChange={(e) => set("audience", e.target.value)}
                placeholder="Who we talk to — their context, what they care about…"
                rows={4}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goals">Goals</Label>
              <Textarea
                id="goals"
                value={form.goals}
                onChange={(e) => set("goals", e.target.value)}
                placeholder="What success looks like — growth, depth, conversions…"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content pillars</CardTitle>
            <CardDescription>The recurring themes you return to.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChipEditor
              values={form.pillars}
              onChange={(v) => set("pillars", v)}
              placeholder="Add a pillar and press Enter"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Do&apos;s &amp; don&apos;ts</CardTitle>
            <CardDescription>Guardrails that keep every draft on-brand.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Do</Label>
              <ListEditor
                values={form.dos}
                onChange={(v) => set("dos", v)}
                placeholder="Add a do…"
                tone="do"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Don&apos;t</Label>
              <ListEditor
                values={form.donts}
                onChange={(v) => set("donts", v)}
                placeholder="Add a don't…"
                tone="dont"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/95 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <span className="text-xs text-muted-foreground">
          {filledCount} of {fields.length} fields complete
        </span>
        <Button className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90" onClick={save}>
          <Check className="size-4" />
          Save profile
        </Button>
      </div>
    </div>
  );
}
