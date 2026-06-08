"use client";

import * as React from "react";
import {
  CalendarClock,
  FileText,
  ImagePlus,
  PenLine,
  Plus,
  Save,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  fmtDate,
  nid,
  useItems,
  useMedia,
  useStore,
} from "@/components/templates/personal-brand/shared/store";
import type {
  ContentItem,
  Format,
  Platform,
} from "@/components/templates/personal-brand/shared/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  type EditorMode,
  type Slide,
  parseBodyBlocks,
} from "./bodyBlocks";
import { MediaPickerDialog } from "./MediaPickerDialog";
import { SlidesEditor } from "./SlidesEditor";

const FORMATS: Format[] = ["post", "reel", "carousel", "story", "thread"];
const STORY_FORMATS = new Set<Format>(["carousel", "story", "thread"]);
const CAPTION_LIMIT = 2200;

type Draft = {
  title: string;
  platform: Platform;
  format: Format;
  caption: string;
  mode: EditorMode;
  outline: string;
  slides: Slide[];
  mediaAssetIds: string[];
};

function draftFromItem(item: ContentItem): Draft {
  const blocks = parseBodyBlocks(item.bodyBlocks);
  const forceStory = STORY_FORMATS.has(item.format);
  const mode: EditorMode = blocks?.mode ?? (forceStory ? "story" : "sketch");
  return {
    title: item.title,
    platform: item.platform,
    format: item.format,
    caption: item.caption,
    mode,
    outline: blocks?.mode === "sketch" ? blocks.outline : "",
    slides: blocks?.mode === "story" ? blocks.slides : [],
    mediaAssetIds: item.mediaAssetIds,
  };
}

/** Studio — a two-pane composer for turning drafts into platform-ready content. */
export function StudioView() {
  const { dispatch } = useStore();
  const items = useItems();
  const media = useMedia();

  const drafts = React.useMemo(
    () =>
      items
        .filter((i) => i.stage === "ideation" || i.stage === "production")
        .sort((a, b) => b.createdAt - a.createdAt),
    [items],
  );

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = React.useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId],
  );

  // Auto-select the first draft when nothing is selected.
  React.useEffect(() => {
    if (!selectedId && drafts.length > 0) setSelectedId(drafts[0].id);
    if (selectedId && !items.some((i) => i.id === selectedId)) {
      setSelectedId(drafts[0]?.id ?? null);
    }
  }, [drafts, items, selectedId]);

  const mediaById = React.useMemo(
    () => new Map(media.map((m) => [m.id, m])),
    [media],
  );

  return (
    <div className="reveal space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Studio</h1>
          <p className="text-sm text-muted-foreground">
            Turn an idea into a sketch or a full story — caption, media, platform, format.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <DraftRail
          drafts={drafts}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onNew={() => {
            const id = nid("item");
            dispatch({
              type: "item.upsert",
              item: {
                id,
                title: "Untitled draft",
                platform: "instagram",
                format: "post",
                caption: "",
                bodyBlocks: { mode: "sketch", outline: "" },
                mediaAssetIds: [],
                stage: "production",
                createdAt: Date.now(),
              },
            });
            setSelectedId(id);
            toast.success("Draft created");
          }}
        />

        {selected ? (
          <Editor
            key={selected.id}
            item={selected}
            mediaById={mediaById}
            onSave={(item, msg) => {
              dispatch({ type: "item.upsert", item });
              toast.success(msg);
            }}
            onSetStage={(id, stage, msg) => {
              dispatch({ type: "item.setStage", id, stage });
              toast.success(msg);
            }}
          />
        ) : (
          <div className="flex min-h-[24rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-card/40 text-center">
            <PenLine className="size-7 text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Nothing selected</p>
              <p className="text-xs text-muted-foreground">
                Pick a draft on the left, or create a new one to start composing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DraftRail({
  drafts,
  selectedId,
  onSelect,
  onNew,
}: {
  drafts: ContentItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <aside className="flex flex-col rounded-lg border border-border/60 bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 p-3">
        <h2 className="text-sm font-semibold tracking-tight">Drafts</h2>
        <Button size="sm" className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={onNew}>
          <Plus />
          New
        </Button>
      </div>
      <ScrollArea className="max-h-[28rem]">
        <div className="space-y-1.5 p-2">
          {drafts.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-muted-foreground/70">
              No drafts yet. Create one or send an idea from Ideation.
            </p>
          ) : (
            drafts.map((d) => {
              const active = d.id === selectedId;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onSelect(d.id)}
                  className={`w-full rounded-md border px-3 py-2 text-left transition ${
                    active
                      ? "border-brand/40 bg-brand/5"
                      : "border-transparent hover:border-border/60 hover:bg-accent/40"
                  }`}
                >
                  <p className="truncate text-sm font-medium">{d.title || "Untitled draft"}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {d.platform}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {d.format}
                    </Badge>
                    <span className="text-[10px] capitalize text-muted-foreground">{d.stage}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

function Editor({
  item,
  mediaById,
  onSave,
  onSetStage,
}: {
  item: ContentItem;
  mediaById: Map<string, ReturnType<typeof useMedia>[number]>;
  onSave: (item: ContentItem, msg: string) => void;
  onSetStage: (id: string, stage: ContentItem["stage"], msg: string) => void;
}) {
  const [draft, setDraft] = React.useState<Draft>(() => draftFromItem(item));
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [scheduleAt, setScheduleAt] = React.useState("");
  const [schedOpen, setSchedOpen] = React.useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  // When format flips to a story-only format, force Story mode.
  const onFormatChange = (format: Format) => {
    setDraft((d) => ({
      ...d,
      format,
      mode: STORY_FORMATS.has(format) ? "story" : d.mode,
    }));
  };

  const storyLocked = STORY_FORMATS.has(draft.format);
  const showSlides = draft.mode === "story" || storyLocked;

  const buildItem = (overrides?: Partial<ContentItem>): ContentItem => ({
    ...item,
    title: draft.title,
    platform: draft.platform,
    format: draft.format,
    caption: draft.caption,
    bodyBlocks: showSlides
      ? { mode: "story", slides: draft.slides }
      : { mode: "sketch", outline: draft.outline },
    mediaAssetIds: draft.mediaAssetIds,
    ...overrides,
  });

  const overLimit = draft.caption.length > CAPTION_LIMIT;

  return (
    <div className="rounded-lg border border-border/60 bg-card">
      <div className="space-y-5 p-4 sm:p-5">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="studio-title">Title</Label>
          <Input
            id="studio-title"
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Give this content a working title"
            className="text-base font-medium"
          />
        </div>

        {/* Platform + Format */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Platform</Label>
            <Select value={draft.platform} onValueChange={(v) => set("platform", v as Platform)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="threads">Threads</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Format</Label>
            <Select value={draft.format} onValueChange={(v) => onFormatChange(v as Format)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map((f) => (
                  <SelectItem key={f} value={f} className="capitalize">
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mode segmented control */}
        <div className="space-y-2">
          <Label>Mode</Label>
          <div className="inline-flex rounded-md border border-border/60 bg-muted/40 p-0.5">
            {(["sketch", "story"] as const).map((m) => {
              const active = (draft.mode === m && !storyLocked) || (storyLocked && m === "story");
              const disabled = storyLocked && m === "sketch";
              return (
                <button
                  key={m}
                  type="button"
                  disabled={disabled}
                  onClick={() => set("mode", m)}
                  className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium capitalize transition ${
                    active
                      ? "bg-brand text-brand-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  {m === "sketch" ? <PenLine className="size-3" /> : <FileText className="size-3" />}
                  {m}
                </button>
              );
            })}
          </div>
          {storyLocked && (
            <p className="text-[11px] text-muted-foreground">
              {draft.format} content uses multi-slide Story mode.
            </p>
          )}
        </div>

        {/* Mode body */}
        {showSlides ? (
          <div className="space-y-2">
            <Label>Slides</Label>
            <SlidesEditor slides={draft.slides} onChange={(s) => set("slides", s)} />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="studio-outline">Outline</Label>
            <Textarea
              id="studio-outline"
              value={draft.outline}
              onChange={(e) => set("outline", e.target.value)}
              placeholder="A short outline of the beats for this piece…"
              rows={3}
            />
          </div>
        )}

        {/* Caption */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="studio-caption">Caption</Label>
            <span
              className={`text-[11px] tabular-nums ${
                overLimit ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {draft.caption.length}/{CAPTION_LIMIT}
            </span>
          </div>
          <Textarea
            id="studio-caption"
            value={draft.caption}
            onChange={(e) => set("caption", e.target.value)}
            placeholder="Write the caption your audience will read…"
            rows={5}
          />
        </div>

        {/* Media */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Media</Label>
            <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
              <ImagePlus />
              Attach media
            </Button>
          </div>
          {draft.mediaAssetIds.length === 0 ? (
            <p className="rounded-md border border-dashed border-border/60 px-3 py-4 text-center text-xs text-muted-foreground">
              No media attached.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {draft.mediaAssetIds.map((id) => {
                const asset = mediaById.get(id);
                return (
                  <div
                    key={id}
                    className="group relative size-16 overflow-hidden rounded-md border border-border/60"
                  >
                    {asset ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.thumbUrl || asset.url}
                        alt={asset.alt}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-muted text-[9px] text-muted-foreground">
                        missing
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "mediaAssetIds",
                          draft.mediaAssetIds.filter((x) => x !== id),
                        )
                      }
                      className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-background/80 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                      aria-label="Remove media"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-[11px] text-muted-foreground">
          {item.scheduledAt
            ? `Scheduled for ${fmtDate(item.scheduledAt)}`
            : `Stage: ${item.stage}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => onSave(buildItem(), "Draft saved")}>
            <Save />
            Save draft
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onSave(buildItem({ stage: "production" }), "Moved to Production");
            }}
          >
            <Send />
            Move to Production
          </Button>

          <Popover open={schedOpen} onOpenChange={setSchedOpen}>
            <PopoverTrigger asChild>
              <Button className="bg-brand text-brand-foreground hover:bg-brand/90">
                <CalendarClock />
                Schedule…
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="studio-schedule">Publish at</Label>
                <Input
                  id="studio-schedule"
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={!scheduleAt}
                onClick={() => {
                  const ts = new Date(scheduleAt).getTime();
                  if (Number.isNaN(ts)) {
                    toast.error("Pick a valid date and time");
                    return;
                  }
                  onSave(buildItem({ stage: "scheduled", scheduledAt: ts }), "Scheduled");
                  setSchedOpen(false);
                }}
              >
                Confirm schedule
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedIds={draft.mediaAssetIds}
        onConfirm={(ids) => set("mediaAssetIds", ids)}
      />
    </div>
  );
}
