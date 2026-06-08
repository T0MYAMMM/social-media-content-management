"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import {
  Layers,
  CalendarClock,
  Send,
  Lightbulb,
  MoreHorizontal,
  Trash2,
  ArrowRight,
  GripVertical,
} from "lucide-react";

import { useItems, useMedia, fmtDate } from "@/components/templates/personal-brand/shared/store";
import type { ContentItem, Platform, Stage } from "@/components/templates/personal-brand/shared/types";
import { useStore } from "@/components/templates/personal-brand/shared/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/templates/_shared/ui/stat-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { STAGES, stageLabel, platformMeta, formatTint } from "./shared";

const stageIcon: Record<Stage, React.ComponentType<{ className?: string }>> = {
  ideation: Lightbulb,
  production: Layers,
  scheduled: CalendarClock,
  published: Send,
};

type PlatformFilter = "all" | Platform;

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

function Thumb({ item }: { item: ContentItem }) {
  const media = useMedia();
  const firstId = item.mediaAssetIds[0];
  const asset = firstId ? media.find((m) => m.id === firstId) : undefined;

  if (asset) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset.thumbUrl || asset.url}
        alt={asset.alt || item.title}
        className="size-11 shrink-0 rounded-md border border-border/60 object-cover"
      />
    );
  }
  return (
    <div
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-md text-[10px] font-semibold uppercase tracking-wide",
        formatTint[item.format],
      )}
    >
      {item.format.slice(0, 3)}
    </div>
  );
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const { label, icon: Icon } = platformMeta(platform);
  return (
    <Badge variant="outline" className="gap-1 font-normal">
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}

function CardInner({
  item,
  onMove,
  onDelete,
  dragging,
  handleProps,
}: {
  item: ContentItem;
  onMove: (id: string, stage: Stage) => void;
  onDelete: (id: string) => void;
  dragging?: boolean;
  handleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  const when =
    item.stage === "scheduled" && item.scheduledAt
      ? `Scheduled ${fmtDate(item.scheduledAt)}`
      : item.stage === "published" && item.publishedAt
        ? `Published ${fmtDate(item.publishedAt)}`
        : null;

  return (
    <div
      className={cn(
        "group rounded-lg border border-border/60 bg-card p-3 shadow-sm transition",
        dragging ? "opacity-60" : "hover:border-border hover:shadow",
      )}
    >
      <div className="flex items-start gap-3">
        <Thumb item={item} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-snug">{item.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <PlatformBadge platform={item.platform} />
            <Badge variant="secondary" className="font-normal capitalize">
              {item.format}
            </Badge>
          </div>
          {when && (
            <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
              <CalendarClock className="size-3" />
              {when}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground opacity-60 transition group-hover:opacity-100"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Card actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Move to</DropdownMenuLabel>
              {STAGES.filter((s) => s.key !== item.stage).map((s) => (
                <DropdownMenuItem key={s.key} onSelect={() => onMove(item.id, s.key)}>
                  <ArrowRight className="size-4" />
                  {s.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(item.id)}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            aria-label="Drag to reorder"
            className="cursor-grab touch-none text-muted-foreground/50 opacity-0 transition hover:text-muted-foreground group-hover:opacity-100 active:cursor-grabbing"
            {...handleProps}
          >
            <GripVertical className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DraggableCard({
  item,
  onMove,
  onDelete,
}: {
  item: ContentItem;
  onMove: (id: string, stage: Stage) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { stage: item.stage },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(isDragging && "opacity-40")}
    >
      <CardInner
        item={item}
        onMove={onMove}
        onDelete={onDelete}
        handleProps={{ ...attributes, ...(listeners as React.HTMLAttributes<HTMLButtonElement>) }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Column                                                                     */
/* -------------------------------------------------------------------------- */

function Column({
  stage,
  items,
  onMove,
  onDelete,
}: {
  stage: Stage;
  items: ContentItem[];
  onMove: (id: string, stage: Stage) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const Icon = stageIcon[stage];

  return (
    <div className="flex min-w-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-brand" />
          <h2 className="text-sm font-semibold tracking-tight">{stageLabel(stage)}</h2>
        </div>
        <Badge variant="secondary" className="tabular-nums">
          {items.length}
        </Badge>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-40 flex-1 flex-col gap-2 rounded-xl border border-dashed border-border/60 bg-muted/30 p-2 transition",
          isOver && "border-brand/50 bg-brand/5",
        )}
      >
        {items.length === 0 ? (
          <p className="grid flex-1 place-items-center px-2 py-6 text-center text-xs text-muted-foreground">
            Drop items here
          </p>
        ) : (
          items.map((item) => (
            <DraggableCard key={item.id} item={item} onMove={onMove} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* View                                                                       */
/* -------------------------------------------------------------------------- */

export function PipelineView() {
  const items = useItems();
  const { dispatch, ready } = useStore();
  const [filter, setFilter] = React.useState<PlatformFilter>("all");
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const visible = React.useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.platform === filter)),
    [items, filter],
  );

  const byStage = React.useMemo(() => {
    const map: Record<Stage, ContentItem[]> = {
      ideation: [],
      production: [],
      scheduled: [],
      published: [],
    };
    for (const it of visible) map[it.stage].push(it);
    return map;
  }, [visible]);

  const move = React.useCallback(
    (id: string, stage: Stage) => {
      const item = items.find((i) => i.id === id);
      if (!item || item.stage === stage) return;
      dispatch({ type: "item.setStage", id, stage });
      toast.success(`Moved “${item.title}” to ${stageLabel(stage)}`);
    },
    [items, dispatch],
  );

  const remove = React.useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      dispatch({ type: "item.delete", id });
      toast.success(item ? `Deleted “${item.title}”` : "Item deleted");
    },
    [items, dispatch],
  );

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const target = over.id as Stage;
    if (STAGES.some((s) => s.key === target)) move(String(active.id), target);
  };

  const activeItem = activeId ? items.find((i) => i.id === activeId) ?? null : null;

  return (
    <div className="space-y-8">
      <section className="reveal space-y-6">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Workflow</p>
          <h1 className="text-3xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Drag content across stages — from first spark to published. Changes save instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STAGES.map((s) => (
              <StatCard
                key={s.key}
                icon={stageIcon[s.key]}
                label={s.label}
                value={byStage[s.key].length}
              />
            ))}
          </div>
          <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-card p-1">
            {(["all", "instagram", "threads"] as const).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={filter === p ? "default" : "ghost"}
                className={cn("h-7 px-3 capitalize", filter === p && "bg-brand text-brand-foreground hover:bg-brand/90")}
                onClick={() => setFilter(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {!ready ? (
        <div className="grid gap-4 lg:grid-cols-4">
          {STAGES.map((s) => (
            <div key={s.key} className="h-64 animate-pulse rounded-xl border border-border/60 bg-muted/40" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="grid gap-4 lg:grid-cols-4">
            {STAGES.map((s) => (
              <Column
                key={s.key}
                stage={s.key}
                items={byStage[s.key]}
                onMove={move}
                onDelete={remove}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={null}>
            {activeItem ? (
              <div className="w-72 rotate-1 cursor-grabbing">
                <CardInner item={activeItem} onMove={move} onDelete={remove} dragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
