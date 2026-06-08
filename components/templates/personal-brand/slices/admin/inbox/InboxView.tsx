"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Inbox,
  MessageCircle,
  AtSign,
  CornerUpLeft,
  Mail,
  Archive,
  Trash2,
  Send,
  Instagram,
} from "lucide-react";

import {
  useInteractions,
  useStore,
  rel,
  fmtDate,
} from "@/components/templates/personal-brand/shared/store";
import type {
  Interaction,
  InteractionType,
  Platform,
  Sentiment,
} from "@/components/templates/personal-brand/shared/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

type Segment = "all" | "unread" | InteractionType;
type PlatformFilter = "all" | Platform;

const SEGMENTS: { key: Segment; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "all", label: "All", icon: Inbox },
  { key: "unread", label: "Unread", icon: Mail },
  { key: "comment", label: "Comments", icon: MessageCircle },
  { key: "mention", label: "Mentions", icon: AtSign },
  { key: "reply", label: "Replies", icon: CornerUpLeft },
  { key: "dm", label: "DMs", icon: Mail },
];

const typeLabel: Record<InteractionType, string> = {
  comment: "Comment",
  mention: "Mention",
  reply: "Reply",
  dm: "DM",
};

const platformMeta: Record<Platform, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  instagram: { label: "Instagram", icon: Instagram },
  threads: { label: "Threads", icon: AtSign },
};

const sentimentMeta: Record<Sentiment, { label: string; dot: string; text: string }> = {
  pos: { label: "Positive", dot: "bg-green-500 dark:bg-green-400", text: "text-green-600 dark:text-green-400" },
  neu: { label: "Neutral", dot: "bg-amber-500 dark:bg-amber-400", text: "text-amber-600 dark:text-amber-400" },
  neg: { label: "Negative", dot: "bg-red-500 dark:bg-red-400", text: "text-red-600 dark:text-red-400" },
};

function initials(name: string): string {
  const clean = name.replace(/^@/, "").replace(/[._-]+/g, " ").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}

/* -------------------------------------------------------------------------- */
/* Row                                                                        */
/* -------------------------------------------------------------------------- */

function PlatformBadge({ platform }: { platform: Platform }) {
  const { label, icon: Icon } = platformMeta[platform];
  return (
    <Badge variant="outline" className="gap-1 font-normal">
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}

function Row({
  it,
  onOpen,
  onReply,
  onArchive,
  onDelete,
}: {
  it: Interaction;
  onOpen: () => void;
  onReply: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [replying, setReplying] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const unread = it.status === "unread";
  const sentiment = it.sentiment ? sentimentMeta[it.sentiment] : null;

  return (
    <div
      className={cn(
        "group rounded-lg border border-border/60 bg-card p-3 transition hover:border-border",
        unread && "bg-accent/30",
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="size-9 shrink-0">
          {it.authorAvatar ? <AvatarImage src={it.authorAvatar} alt={it.author} /> : null}
          <AvatarFallback className="text-xs">{initials(it.author)}</AvatarFallback>
        </Avatar>

        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("truncate text-sm", unread ? "font-semibold" : "font-medium")}>
              {it.author}
            </span>
            {sentiment ? (
              <span className="flex items-center" title={sentiment.label}>
                <span className={cn("size-1.5 rounded-full", sentiment.dot)} />
              </span>
            ) : null}
            <PlatformBadge platform={it.platform} />
            <Badge variant="secondary" className="font-normal">
              {typeLabel[it.type]}
            </Badge>
            {it.status === "replied" ? (
              <Badge variant="outline" className="font-normal text-brand">
                Replied
              </Badge>
            ) : null}
            <span className="ml-auto text-xs text-muted-foreground">{rel(it.ts)}</span>
          </div>
          <p className={cn("mt-1 line-clamp-2 text-sm text-muted-foreground", unread && "text-foreground")}>
            {it.text}
          </p>
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1 pl-12">
        {!replying ? (
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setReplying(true)}>
            <CornerUpLeft className="size-3.5" />
            Reply
          </Button>
        ) : null}
        {it.status !== "archived" ? (
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={onArchive}>
            <Archive className="size-3.5" />
            Archive
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>

      {replying ? (
        <div className="mt-2 space-y-2 pl-12">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Reply to ${it.author}…`}
            rows={2}
            className="resize-none text-sm"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 gap-1.5 bg-brand text-brand-foreground text-xs hover:bg-brand/90"
              disabled={!draft.trim()}
              onClick={() => {
                onReply();
                setDraft("");
                setReplying(false);
              }}
            >
              <Send className="size-3.5" />
              Send
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setReplying(false);
                setDraft("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* View                                                                       */
/* -------------------------------------------------------------------------- */

export function InboxView() {
  const interactions = useInteractions();
  const { dispatch } = useStore();
  const [segment, setSegment] = React.useState<Segment>("all");
  const [platform, setPlatform] = React.useState<PlatformFilter>("all");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<string | null>(null);

  const byPlatform = React.useMemo(
    () => (platform === "all" ? interactions : interactions.filter((i) => i.platform === platform)),
    [interactions, platform],
  );

  const counts = React.useMemo<Record<Segment, number>>(
    () => ({
      all: byPlatform.length,
      unread: byPlatform.filter((i) => i.status === "unread").length,
      comment: byPlatform.filter((i) => i.type === "comment").length,
      mention: byPlatform.filter((i) => i.type === "mention").length,
      reply: byPlatform.filter((i) => i.type === "reply").length,
      dm: byPlatform.filter((i) => i.type === "dm").length,
    }),
    [byPlatform],
  );

  const filtered = React.useMemo(() => {
    const base =
      segment === "all"
        ? byPlatform
        : segment === "unread"
          ? byPlatform.filter((i) => i.status === "unread")
          : byPlatform.filter((i) => i.type === segment);
    return [...base].sort((a, b) => b.ts - a.ts);
  }, [byPlatform, segment]);

  const open = openId ? interactions.find((i) => i.id === openId) ?? null : null;

  const markReplied = (it: Interaction) => {
    dispatch({ type: "interaction.setStatus", id: it.id, status: "replied" });
    toast.success(`Replied to ${it.author}`);
  };
  const archive = (it: Interaction) => {
    dispatch({ type: "interaction.setStatus", id: it.id, status: "archived" });
    toast("Archived");
    if (openId === it.id) setOpenId(null);
  };
  const remove = (id: string) => {
    dispatch({ type: "interaction.delete", id });
    setPendingDelete(null);
    if (openId === id) setOpenId(null);
    toast("Deleted");
  };

  return (
    <div className="reveal space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Comments, mentions, replies, and DMs across your accounts — unified in one stream.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {SEGMENTS.map((s) => {
            const active = segment === s.key;
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSegment(s.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium transition",
                  active
                    ? "border-transparent bg-brand text-brand-foreground"
                    : "bg-card text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {s.label}
                <span className={cn("text-[11px]", active ? "text-brand-foreground/80" : "text-muted-foreground/70")}>
                  {counts[s.key]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          {(["all", "instagram", "threads"] as PlatformFilter[]).map((p) => {
            const active = platform === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={cn(
                  "rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium transition",
                  active
                    ? "border-transparent bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                {p === "all" ? "All platforms" : platformMeta[p as Platform].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-card/50 py-12 text-center">
          <Inbox className="size-8 text-muted-foreground/60" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Nothing here</p>
            <p className="text-xs text-muted-foreground">
              {segment === "unread"
                ? "You're all caught up — no unread interactions."
                : "No interactions match this filter yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((it) => (
            <Row
              key={it.id}
              it={it}
              onOpen={() => {
                setOpenId(it.id);
                if (it.status === "unread") {
                  dispatch({ type: "interaction.setStatus", id: it.id, status: "replied" });
                }
              }}
              onReply={() => markReplied(it)}
              onArchive={() => archive(it)}
              onDelete={() => setPendingDelete(it.id)}
            />
          ))}
        </div>
      )}

      {/* Detail sheet */}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {open ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Avatar className="size-7">
                    {open.authorAvatar ? <AvatarImage src={open.authorAvatar} alt={open.author} /> : null}
                    <AvatarFallback className="text-[10px]">{initials(open.author)}</AvatarFallback>
                  </Avatar>
                  {open.author}
                </SheetTitle>
                <SheetDescription>
                  {typeLabel[open.type]} · {platformMeta[open.platform].label} · {fmtDate(open.ts)}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4">
                {open.sentiment ? (
                  <Badge variant="outline" className={cn("gap-1.5", sentimentMeta[open.sentiment].text)}>
                    <span className={cn("size-1.5 rounded-full", sentimentMeta[open.sentiment].dot)} />
                    {sentimentMeta[open.sentiment].label}
                  </Badge>
                ) : null}
                <p className="text-sm leading-relaxed">{open.text}</p>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Quick replies</p>
                  <div className="flex flex-wrap gap-2">
                    {["Thank you! 🙏", "Appreciate it!", "Great question — DM sent.", "On it! ✨"].map((q) => (
                      <Button
                        key={q}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => markReplied(open)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter className="flex-row gap-2">
                <Button
                  className="flex-1 gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90"
                  onClick={() => markReplied(open)}
                >
                  <Send className="size-4" />
                  Mark replied
                </Button>
                <Button variant="outline" className="gap-1.5" onClick={() => archive(open)}>
                  <Archive className="size-4" />
                  Archive
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this interaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from your inbox permanently. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => pendingDelete && remove(pendingDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
