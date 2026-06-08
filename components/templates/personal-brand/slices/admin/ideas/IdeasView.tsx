"use client";

import * as React from "react";
import { Lightbulb, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { nid, useIdeas, useStore } from "@/components/templates/personal-brand/shared/store";
import type {
  ContentIdea,
  ContentItem,
  IdeaStatus,
} from "@/components/templates/personal-brand/shared/types";
import { Button } from "@/components/ui/button";
import { IdeaCard } from "./IdeaCard";
import { IdeaFormDialog } from "./IdeaFormDialog";

const COLUMNS: { status: IdeaStatus; label: string; hint: string }[] = [
  { status: "spark", label: "Spark", hint: "Raw, unfiltered ideas" },
  { status: "exploring", label: "Exploring", hint: "Worth developing" },
  { status: "approved", label: "Approved", hint: "Ready for Studio" },
  { status: "archived", label: "Archived", hint: "Parked for later" },
];

/** Ideation board — a Kanban of content ideas across four maturity columns. */
export function IdeasView() {
  const { dispatch } = useStore();
  const ideas = useIdeas();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ContentIdea | null>(null);

  const byStatus = React.useMemo(() => {
    const map: Record<IdeaStatus, ContentIdea[]> = {
      spark: [],
      exploring: [],
      approved: [],
      archived: [],
    };
    for (const idea of ideas) map[idea.status].push(idea);
    for (const key of Object.keys(map) as IdeaStatus[]) {
      map[key].sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);
    }
    return map;
  }, [ideas]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (idea: ContentIdea) => {
    setEditing(idea);
    setDialogOpen(true);
  };

  const handleSubmit = (idea: ContentIdea) => {
    const isNew = !ideas.some((i) => i.id === idea.id);
    dispatch({ type: "idea.upsert", idea });
    toast.success(isNew ? "Idea captured" : "Idea updated");
  };

  const handleMove = (id: string, status: IdeaStatus) => {
    dispatch({ type: "idea.setStatus", id, status });
    toast.success(`Moved to ${status}`);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: "idea.delete", id });
    toast.success("Idea deleted");
  };

  const handleSendToStudio = (idea: ContentIdea) => {
    const item: ContentItem = {
      id: nid("item"),
      title: idea.title,
      platform: idea.platform ?? "instagram",
      format: "post",
      caption: idea.hook,
      mediaAssetIds: [],
      ideaId: idea.id,
      stage: "production",
      createdAt: Date.now(),
    };
    dispatch({ type: "item.upsert", item });
    toast.success("Sent to Studio");
  };

  return (
    <div className="reveal space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Ideation</h1>
          <p className="text-sm text-muted-foreground">
            Capture sparks, explore hooks, and promote the best ideas into production.
            <span className="ml-2 tabular-nums text-muted-foreground/80">
              {ideas.length} {ideas.length === 1 ? "idea" : "ideas"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => toast("Connect Copilot to generate ideas")}
          >
            <Sparkles className="text-brand" />
            Generate with AI
          </Button>
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={openNew}>
            <Plus />
            New idea
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const list = byStatus[col.status];
          return (
            <section
              key={col.status}
              className="flex min-h-[12rem] flex-col rounded-lg border border-border/60 bg-muted/30 p-3"
            >
              <header className="mb-3 flex items-center justify-between px-0.5">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight">{col.label}</h2>
                  <p className="text-[11px] text-muted-foreground">{col.hint}</p>
                </div>
                <span className="rounded-full border border-border/60 bg-card px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                  {list.length}
                </span>
              </header>

              <div className="flex flex-1 flex-col gap-2.5">
                {list.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/50 py-8 text-center">
                    <Lightbulb className="size-5 text-muted-foreground/40" />
                    <p className="text-[11px] text-muted-foreground/60">No ideas here yet</p>
                  </div>
                ) : (
                  list.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onMove={handleMove}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      onSendToStudio={handleSendToStudio}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <IdeaFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
