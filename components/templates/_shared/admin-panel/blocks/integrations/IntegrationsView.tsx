"use client";

import * as React from "react";
import { useAction, useQuery } from "convex/react";
import {
  Brain,
  Cable,
  HardDrive,
  Images,
  Instagram,
  Loader2,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlockHeader } from "../../ui/block-header";

/** Admin → Integrations. Editorial warm-paper card grid showing which external
 *  services are configured (from features.integrations.status.get) plus a
 *  Connect/Sync action per service. Everything is KEY-GUARDED server-side:
 *  actions return { ok, notice } and we toast the result so the UI degrades
 *  gracefully when keys are absent. */

type StatusKey =
  | "instagram"
  | "threads"
  | "googlePhotos"
  | "googleDrive"
  | "voyage"
  | "openai"
  | "anthropic";

type Status = Record<StatusKey, boolean>;

type CardDef = {
  key: StatusKey;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  envKeys: string[];
  action: "connect" | "sync" | "none";
};

const CARDS: CardDef[] = [
  {
    key: "instagram",
    name: "Instagram",
    icon: Instagram,
    description: "Sync followers, insights, posts & comments via the Meta Graph API.",
    envKeys: ["META_APP_ID", "META_APP_SECRET", "IG_ACCESS_TOKEN"],
    action: "sync",
  },
  {
    key: "threads",
    name: "Threads",
    icon: MessageCircle,
    description: "Sync threads, replies & insights via the Threads API.",
    envKeys: ["THREADS_APP_ID", "THREADS_APP_SECRET", "THREADS_ACCESS_TOKEN"],
    action: "sync",
  },
  {
    key: "googlePhotos",
    name: "Google Photos",
    icon: Images,
    description: "Browse your library inside the image picker (read-only).",
    envKeys: ["GOOGLE_PHOTOS_ACCESS_TOKEN"],
    action: "connect",
  },
  {
    key: "googleDrive",
    name: "Google Drive",
    icon: HardDrive,
    description: "Pull image files from Drive inside the image picker (read-only).",
    envKeys: ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"],
    action: "connect",
  },
  {
    key: "anthropic",
    name: "Anthropic",
    icon: Brain,
    description: "Powers the copilot — idea generation & caption drafting.",
    envKeys: ["ANTHROPIC_API_KEY"],
    action: "none",
  },
  {
    key: "openai",
    name: "OpenAI",
    icon: Sparkles,
    description: "Embeddings (text-embedding-3-small, 1024-dim) for RAG retrieval that grounds the copilot.",
    envKeys: ["OPENAI_API_KEY"],
    action: "none",
  },
  {
    key: "voyage",
    name: "Voyage",
    icon: Sparkles,
    description: "Alternative embeddings provider for RAG retrieval (used if OpenAI is unset).",
    envKeys: ["VOYAGE_API_KEY"],
    action: "none",
  },
];

export function IntegrationsView() {
  const [status, setStatus] = React.useState<Status | null>(null);
  const [busy, setBusy] = React.useState<StatusKey | null>(null);

  const getStatus = useAction(api.features.integrations.status.get);
  const syncInstagram = useAction(api.features.integrations.instagram.syncInstagram);
  const syncThreads = useAction(api.features.integrations.threads.syncThreads);
  const accounts = useQuery(api.accounts.list);

  React.useEffect(() => {
    let active = true;
    getStatus({})
      .then((s) => {
        if (active) setStatus(s as Status);
      })
      .catch(() => {
        if (active) setStatus(null);
      });
    return () => {
      active = false;
    };
  }, [getStatus]);

  const configuredCount = status
    ? Object.values(status).filter(Boolean).length
    : 0;

  const handle = async (card: CardDef) => {
    if (card.action === "none") return;
    setBusy(card.key);
    try {
      if (card.key === "instagram" || card.key === "threads") {
        const account = (accounts ?? []).find(
          (a) => a.platform === (card.key === "instagram" ? "instagram" : "threads"),
        );
        if (!account) {
          toast.error(`No ${card.name} account found to sync.`);
          return;
        }
        const fn = card.key === "instagram" ? syncInstagram : syncThreads;
        const res = await fn({ accountId: account._id });
        if (res.ok) toast.success(`${card.name} synced.`);
        else toast.message(res.notice);
      } else {
        // Google sources: connecting happens in the image picker; here we just
        // surface configuration state honestly.
        toast.message(
          status?.[card.key]
            ? `${card.name} is configured — browse it from the image picker.`
            : `${card.name} not connected — add ${card.envKeys.join(" / ")} on the Convex deployment.`,
        );
      }
    } catch (err) {
      toast.error(`${card.name} failed: ${String(err)}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="reveal space-y-6 p-6">
      <BlockHeader
        title="Integrations"
        meta={
          status
            ? `${configuredCount} of ${CARDS.length} services configured · keys live on the Convex deployment`
            : "Checking configuration…"
        }
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => {
          const configured = status?.[card.key] ?? false;
          const Icon = card.icon;
          return (
            <Card key={card.key} className="border-border/60 bg-card">
              <CardHeader className="gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-md bg-brand/10 text-brand">
                    <Icon className="size-4" />
                  </span>
                  <Badge variant={configured ? "default" : "outline"}>
                    {configured ? "Configured" : "Not connected"}
                  </Badge>
                </div>
                <CardTitle className="text-base">{card.name}</CardTitle>
                <CardDescription className="text-xs">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {card.envKeys.map((k) => (
                    <code
                      key={k}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {k}
                    </code>
                  ))}
                </div>
                {card.action !== "none" && (
                  <Button
                    size="sm"
                    variant={configured ? "default" : "outline"}
                    className={
                      configured ? "gap-1.5 bg-brand text-brand-foreground" : "gap-1.5"
                    }
                    disabled={busy === card.key}
                    onClick={() => handle(card)}
                  >
                    {busy === card.key ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Cable className="size-3.5" />
                    )}
                    {card.action === "sync" ? "Sync" : "Connect"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground">
        Every integration is key-guarded — unset keys degrade gracefully and the
        seeded sample data keeps the app fully usable. Set keys with{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
          npx convex env set &lt;KEY&gt; &lt;value&gt;
        </code>{" "}
        — never expose them as <code className="rounded bg-muted px-1 py-0.5 text-[10px]">NEXT_PUBLIC_</code>.
      </p>
    </div>
  );
}
