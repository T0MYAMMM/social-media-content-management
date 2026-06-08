"use client";

import * as React from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  ArrowUp,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Sparkles,
  Trash2,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SessionId = Id<"copilotSessions">;

export function CopilotView() {
  const sessions = useQuery(api.copilot.listSessions);
  const startSession = useMutation(api.copilot.startSession);
  const addMessage = useMutation(api.copilot.addMessage);
  const removeSession = useMutation(api.copilot.removeSession);
  const chat = useAction(api.features.copilot.chat.chat);
  const reindex = useAction(api.features.copilot.indexer.reindex);
  const generateIdeas = useAction(api.features.copilot.generate.generateIdeas);

  const [activeId, setActiveId] = React.useState<SessionId | null>(null);
  const [input, setInput] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [reindexing, setReindexing] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  const messages = useQuery(
    api.copilot.messages,
    activeId ? { sessionId: activeId } : "skip",
  );

  const scrollRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending]);

  // Auto-select the most recent session when none is active.
  React.useEffect(() => {
    if (!activeId && sessions && sessions.length > 0) {
      setActiveId(sessions[0]._id);
    }
  }, [sessions, activeId]);

  async function ensureSession(): Promise<SessionId> {
    if (activeId) return activeId;
    const id = (await startSession({ title: "New chat" })) as SessionId;
    setActiveId(id);
    return id;
  }

  async function handleNewChat() {
    const id = (await startSession({ title: "New chat" })) as SessionId;
    setActiveId(id);
    setInput("");
    setNotice(null);
  }

  async function handleDelete(id: SessionId) {
    await removeSession({ id });
    if (activeId === id) setActiveId(null);
    toast.success("Chat deleted");
  }

  async function handleSend() {
    const prompt = input.trim();
    if (!prompt || pending) return;

    setPending(true);
    setInput("");
    setNotice(null);

    try {
      const sessionId = await ensureSession();

      // History from the current thread (before this turn).
      const history = (messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Optimistically persist the user turn.
      await addMessage({ sessionId, role: "user", content: prompt });

      const res = await chat({ prompt, history });

      if (res.ok) {
        await addMessage({
          sessionId,
          role: "assistant",
          content: res.text,
          sources: res.sources,
        });
      } else {
        setNotice(res.notice);
        await addMessage({
          sessionId,
          role: "assistant",
          content: res.notice,
        });
        toast.error(res.notice);
      }
    } catch (err) {
      toast.error(`Something went wrong: ${String(err)}`);
    } finally {
      setPending(false);
    }
  }

  async function handleReindex() {
    setReindexing(true);
    try {
      const res = await reindex({});
      if (res.ok) {
        toast.success(`Indexed ${res.count} item${res.count === 1 ? "" : "s"}`);
        setNotice(null);
      } else {
        setNotice(res.notice);
        toast.error(res.notice);
      }
    } catch (err) {
      toast.error(`Reindex failed: ${String(err)}`);
    } finally {
      setReindexing(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await generateIdeas({});
      if (res.ok) {
        toast.success(
          `Created ${res.created} idea${res.created === 1 ? "" : "s"}`,
          {
            action: {
              label: "View ideas",
              onClick: () => {
                window.location.href = "/dashboard/admin/ideas";
              },
            },
          },
        );
        setNotice(null);
      } else {
        setNotice(res.notice);
        toast.error(res.notice);
      }
    } catch (err) {
      toast.error(`Generation failed: ${String(err)}`);
    } finally {
      setGenerating(false);
    }
  }

  function onComposerKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="reveal flex h-[calc(100vh-9rem)] flex-col gap-4">
      {/* Header + toolbar */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Copilot</h1>
          <p className="text-sm text-muted-foreground">
            A strategist that knows your brand and content — grounded in your
            workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReindex}
            disabled={reindexing}
          >
            {reindexing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw className="text-brand" />
            )}
            Reindex knowledge
          </Button>
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Sparkles />
            )}
            Generate ideas
          </Button>
        </div>
      </div>

      {notice ? (
        <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <Database className="mt-0.5 size-4 shrink-0 text-brand" />
          <span>{notice}</span>
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[16rem_1fr]">
        {/* Sessions sidebar */}
        <Card className="hidden min-h-0 flex-col p-2 md:flex">
          <Button
            variant="outline"
            className="mb-2 justify-start"
            onClick={handleNewChat}
          >
            <MessageSquarePlus />
            New chat
          </Button>
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-1 pr-1">
              {sessions === undefined ? (
                <>
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </>
              ) : sessions.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground/70">
                  No chats yet
                </p>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s._id}
                    className={cn(
                      "group flex items-center gap-1 rounded-md px-1",
                      activeId === s._id
                        ? "bg-brand/10 text-brand"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveId(s._id)}
                      className="flex-1 truncate px-2 py-2 text-left text-sm"
                    >
                      {s.title}
                    </button>
                    <button
                      type="button"
                      aria-label="Delete chat"
                      onClick={() => handleDelete(s._id)}
                      className="rounded p-1 text-muted-foreground/50 opacity-0 transition hover:text-destructive group-hover:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat thread */}
        <Card className="flex min-h-0 flex-col overflow-hidden">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
              {!activeId || (messages?.length ?? 0) === 0 ? (
                <EmptyState />
              ) : (
                messages?.map((m) => (
                  <MessageBubble
                    key={m._id}
                    role={m.role}
                    content={m.content}
                    sourceCount={m.sources?.length ?? 0}
                  />
                ))
              )}
              {pending ? (
                <div className="flex items-center gap-2 self-start rounded-2xl border border-border/60 bg-card px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Thinking…
                </div>
              ) : null}
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-border/60 p-3">
            <div className="mx-auto flex max-w-2xl items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onComposerKeyDown}
                placeholder="Ask for hooks, captions, a content plan…"
                rows={1}
                className="max-h-40 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand/60"
              />
              <Button
                size="icon"
                className="size-11 shrink-0 rounded-xl bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={handleSend}
                disabled={pending || !input.trim()}
                aria-label="Send"
              >
                {pending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ArrowUp />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Sparkles className="size-5" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">
        How can I help with your content?
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Ask for fresh hooks, rewrite a caption in your voice, or plan a week of
        posts. Reindex your knowledge first for grounded answers.
      </p>
    </div>
  );
}

function MessageBubble({
  role,
  content,
  sourceCount,
}: {
  role: "user" | "assistant";
  content: string;
  sourceCount: number;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-brand text-brand-foreground"
            : "border border-border/60 bg-card text-foreground",
        )}
      >
        {content}
      </div>
      {!isUser && sourceCount > 0 ? (
        <Badge
          variant="outline"
          className="mt-1.5 gap-1 border-border/60 text-[11px] font-normal text-muted-foreground"
        >
          <Database className="size-3 text-brand" />
          Grounded in {sourceCount} item{sourceCount === 1 ? "" : "s"}
        </Badge>
      ) : null}
    </div>
  );
}
