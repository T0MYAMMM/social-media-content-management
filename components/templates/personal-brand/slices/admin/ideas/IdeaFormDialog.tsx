"use client";

import * as React from "react";
import { nid } from "@/components/templates/personal-brand/shared/store";
import type { ContentIdea, IdeaStatus, Platform } from "@/components/templates/personal-brand/shared/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

const STATUSES: IdeaStatus[] = ["spark", "exploring", "approved", "archived"];

/**
 * Dialog form to create or edit a ContentIdea. On submit it builds a fully
 * formed ContentIdea and hands it to `onSubmit` (which dispatches idea.upsert).
 */
export function IdeaFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ContentIdea | null;
  onSubmit: (idea: ContentIdea) => void;
}) {
  const isEdit = Boolean(initial);
  const [title, setTitle] = React.useState("");
  const [hook, setHook] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [platform, setPlatform] = React.useState<Platform | "none">("none");
  const [tags, setTags] = React.useState("");
  const [score, setScore] = React.useState(50);
  const [status, setStatus] = React.useState<IdeaStatus>("spark");

  // Re-seed local state whenever the dialog opens (or the target idea changes).
  React.useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setHook(initial?.hook ?? "");
    setNotes(initial?.notes ?? "");
    setPlatform(initial?.platform ?? "none");
    setTags((initial?.tags ?? []).join(", "));
    setScore(initial?.score ?? 50);
    setStatus(initial?.status ?? "spark");
  }, [open, initial]);

  const submit = () => {
    if (!title.trim()) return;
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const idea: ContentIdea = {
      id: initial?.id ?? nid("idea"),
      title: title.trim(),
      hook: hook.trim(),
      notes: notes.trim(),
      status,
      source: initial?.source ?? "manual",
      platform: platform === "none" ? undefined : platform,
      tags: tagList,
      score,
      createdAt: initial?.createdAt ?? Date.now(),
    };
    onSubmit(idea);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit idea" : "New idea"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Refine this spark." : "Capture a spark before it slips away."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="idea-title">Title</Label>
            <Input
              id="idea-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A bold, scannable idea title"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="idea-hook">Hook</Label>
            <Input
              id="idea-hook"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="The one-line angle that grabs attention"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="idea-notes">Notes</Label>
            <Textarea
              id="idea-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Supporting thoughts, references, structure…"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as Platform | "none")}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any platform</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="threads">Threads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as IdeaStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="idea-tags">Tags</Label>
            <Input
              id="idea-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="growth, hooks, behind-the-scenes"
            />
            <p className="text-[11px] text-muted-foreground">Comma-separated.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Score</Label>
              <span className="text-sm font-medium text-brand">{score}</span>
            </div>
            <Slider
              value={[score]}
              min={0}
              max={100}
              step={1}
              onValueChange={(v) => setScore(v[0] ?? 0)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={submit}
            disabled={!title.trim()}
          >
            {isEdit ? "Save changes" : "Create idea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
