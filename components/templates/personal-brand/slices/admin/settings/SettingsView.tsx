"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { Save, Crown, Users2, Sparkles, Database } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { useAiConfig, useStore } from "@/components/templates/personal-brand/shared/store";
import type { AiConfig } from "@/components/templates/personal-brand/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SECTION_META: Record<string, { title: string; description: string }> = {
  site: { title: "Site settings", description: "Workspace name, branding, and theme." },
  team: { title: "Team", description: "Admins, roles, and access." },
  ai: { title: "AI Copilot", description: "Model, temperature, retrieval, and system overlay." },
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Site                                                                       */
/* -------------------------------------------------------------------------- */

function SiteSettings() {
  const settings = useQuery(api.settings.get, {});
  const upsert = useMutation(api.settings.upsert);

  const [siteName, setSiteName] = React.useState("");
  const [tagline, setTagline] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [themeDefault, setThemeDefault] = React.useState("system");

  React.useEffect(() => {
    if (settings === undefined) return;
    setSiteName((settings?.siteName as string) ?? "");
    setTagline((settings?.tagline as string) ?? "");
    setContactEmail((settings?.contactEmail as string) ?? "");
    setThemeDefault((settings?.themeDefault as string) ?? "system");
  }, [settings]);

  const save = async () => {
    try {
      await upsert({
        siteName: siteName.trim(),
        tagline: tagline.trim(),
        contactEmail: contactEmail.trim(),
        themeDefault,
      });
      toast.success("Workspace settings saved");
    } catch {
      toast.error("Couldn't save — are you signed in as an admin?");
    }
  };

  return (
    <SectionCard title="Workspace" description="Identity shown across your console and public site.">
      <div className="space-y-1.5">
        <Label htmlFor="siteName">Workspace name</Label>
        <Input
          id="siteName"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="Cadence"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Plan, create, and publish with rhythm."
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="hello@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="themeDefault">Default theme</Label>
          <Select value={themeDefault} onValueChange={setThemeDefault}>
            <SelectTrigger id="themeDefault">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end pt-1">
        <Button className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90" onClick={save}>
          <Save className="size-4" />
          Save settings
        </Button>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Team                                                                       */
/* -------------------------------------------------------------------------- */

function TeamSettings() {
  const admins = useQuery(api.users.listAdmins, {});
  const me = useQuery(api.users.currentUser, {});

  return (
    <SectionCard title="Admins" description="Everyone with access to this workspace.">
      <p className="text-xs text-muted-foreground">
        The first account is the <span className="font-medium text-foreground">owner</span>; everyone invited
        afterward is an <span className="font-medium text-foreground">editor</span>.
      </p>

      <div className="overflow-hidden rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins === undefined ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                  No admins found.
                </TableCell>
              </TableRow>
            ) : (
              admins.map((a) => {
                const isMe = me?._id === a._id;
                return (
                  <TableRow key={a._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7">
                          <AvatarFallback className="text-[10px]">{a.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {a.name ?? a.email ?? "Admin"}
                          {isMe ? <span className="ml-1.5 text-xs text-muted-foreground">(you)</span> : null}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.email ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {a.role === "owner" ? (
                        <Badge variant="outline" className="gap-1 font-normal text-brand">
                          <Crown className="size-3" />
                          Owner
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="font-normal">
                          Editor
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* AI                                                                         */
/* -------------------------------------------------------------------------- */

const MODELS: { value: string; label: string }[] = [
  { value: "claude-haiku-4-5", label: "Claude Haiku 4.5 (fast)" },
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (balanced)" },
  { value: "claude-opus-4-8", label: "Claude Opus 4.8 (deepest)" },
];

function AiSettings() {
  const cfg = useAiConfig();
  const { dispatch } = useStore();

  const [model, setModel] = React.useState<string>("claude-sonnet-4-6");
  const [temperature, setTemperature] = React.useState<number>(0.7);
  const [retrievalEnabled, setRetrievalEnabled] = React.useState<boolean>(true);
  const [systemOverlay, setSystemOverlay] = React.useState<string>("");

  React.useEffect(() => {
    setModel(cfg?.model ?? "claude-sonnet-4-6");
    setTemperature(cfg?.temperature ?? 0.7);
    setRetrievalEnabled(cfg?.retrievalEnabled ?? true);
    setSystemOverlay(cfg?.systemOverlay ?? "");
  }, [cfg]);

  const save = () => {
    const patch: Partial<AiConfig> = {
      model,
      temperature,
      retrievalEnabled,
      systemOverlay: systemOverlay.trim(),
    };
    dispatch({ type: "ai.upsert", patch });
    toast.success("Copilot config saved");
  };

  return (
    <SectionCard title="Copilot" description="Tune the model behind ideas, captions, and replies.">
      <div className="space-y-1.5">
        <Label htmlFor="model">Model</Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger id="model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="temperature">Temperature</Label>
          <span className="text-xs font-medium text-muted-foreground">{temperature.toFixed(2)}</span>
        </div>
        <Slider
          id="temperature"
          min={0}
          max={1}
          step={0.05}
          value={[temperature]}
          onValueChange={(v) => setTemperature(v[0] ?? 0)}
        />
        <p className="text-[11px] text-muted-foreground">
          Lower is precise and consistent; higher is more exploratory.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-3">
        <div className="flex items-start gap-2">
          <Database className="mt-0.5 size-4 text-brand" />
          <div className="space-y-0.5">
            <Label htmlFor="retrieval" className="text-sm">
              Retrieval (RAG)
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Ground responses in your brand profile and existing content.
            </p>
          </div>
        </div>
        <Switch id="retrieval" checked={retrievalEnabled} onCheckedChange={setRetrievalEnabled} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="systemOverlay">System overlay</Label>
        <Textarea
          id="systemOverlay"
          value={systemOverlay}
          onChange={(e) => setSystemOverlay(e.target.value)}
          placeholder="Extra system instructions layered on top of the brand profile…"
          rows={4}
        />
      </div>

      <div className="flex justify-end pt-1">
        <Button className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90" onClick={save}>
          <Sparkles className="size-4" />
          Save config
        </Button>
      </div>
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/* View                                                                       */
/* -------------------------------------------------------------------------- */

export function SettingsView({ section }: { section: "site" | "team" | "ai" }) {
  const meta = SECTION_META[section] ?? SECTION_META.site;
  const Icon = section === "team" ? Users2 : section === "ai" ? Sparkles : Save;

  return (
    <div className="reveal space-y-6">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-muted-foreground" />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
      </div>

      <div className="max-w-2xl">
        {section === "site" ? <SiteSettings /> : section === "team" ? <TeamSettings /> : <AiSettings />}
      </div>
    </div>
  );
}
