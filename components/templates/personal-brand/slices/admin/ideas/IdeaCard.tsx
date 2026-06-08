"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ContentIdea, IdeaStatus } from "@/components/templates/personal-brand/shared/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ORDER: IdeaStatus[] = ["spark", "exploring", "approved", "archived"];

/** Pick a subtle chip tint for the idea score band. */
function scoreChipClass(score: number): string {
  if (score >= 75) return "border-brand/40 bg-brand/10 text-brand";
  if (score >= 50) return "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  if (score >= 25) return "border-border/60 bg-muted text-muted-foreground";
  return "border-border/60 bg-muted/60 text-muted-foreground";
}

/** A single idea card with title, hook, score, badges, tags and an actions menu. */
export function IdeaCard({
  idea,
  onMove,
  onEdit,
  onDelete,
  onSendToStudio,
}: {
  idea: ContentIdea;
  onMove: (id: string, status: IdeaStatus) => void;
  onEdit: (idea: ContentIdea) => void;
  onDelete: (id: string) => void;
  onSendToStudio: (idea: ContentIdea) => void;
}) {
  const idx = ORDER.indexOf(idea.status);
  const prev = idx > 0 ? ORDER[idx - 1] : null;
  const next = idx < ORDER.length - 1 ? ORDER[idx + 1] : null;

  return (
    <div className="group rounded-lg border border-border/60 bg-card p-3 shadow-xs transition hover:border-brand/40 hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${scoreChipClass(
            idea.score,
          )}`}
          title={`Score ${idea.score}/100`}
        >
          {idea.score}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-xs"
              variant="ghost"
              className="opacity-60 transition group-hover:opacity-100"
              aria-label="Idea actions"
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {next && (
              <DropdownMenuItem onClick={() => onMove(idea.id, next)} className="capitalize">
                <ArrowRight /> Move to {next}
              </DropdownMenuItem>
            )}
            {prev && (
              <DropdownMenuItem onClick={() => onMove(idea.id, prev)} className="capitalize">
                <ArrowLeft /> Move to {prev}
              </DropdownMenuItem>
            )}
            {idea.status === "approved" && (
              <DropdownMenuItem onClick={() => onSendToStudio(idea)}>
                <Send /> Send to Studio
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(idea)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(idea.id)}
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="mt-1.5 text-sm font-semibold leading-snug">{idea.title}</h3>
      {idea.hook && (
        <p className="mt-1 line-clamp-2 text-xs italic text-muted-foreground">{idea.hook}</p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="gap-1 text-[10px]">
          {idea.source === "ai" ? (
            <>
              <Sparkles className="size-2.5" /> AI
            </>
          ) : (
            "Manual"
          )}
        </Badge>
        {idea.platform && (
          <Badge variant="secondary" className="text-[10px] capitalize">
            {idea.platform}
          </Badge>
        )}
        {idea.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-[10px] text-muted-foreground">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
