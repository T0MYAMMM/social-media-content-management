"use client";

import * as React from "react";
import { ImageIcon, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  useMedia,
  useStore,
  nid,
  fmtDate,
  rel,
} from "@/components/templates/personal-brand/shared/store";
import type { MediaAsset, MediaSource } from "@/components/templates/personal-brand/shared/types";
import { ImageField } from "@/components/image-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";

const SOURCE_LABELS: Record<MediaSource, string> = {
  upload: "Upload",
  "google-photos": "Google Photos",
  gdrive: "Drive",
  url: "URL",
  unsplash: "Unsplash",
};

const SOURCES: MediaSource[] = ["upload", "google-photos", "gdrive", "url", "unsplash"];

export function GalleryView() {
  const { ready, dispatch } = useStore();
  const media = useMedia();

  const [query, setQuery] = React.useState("");
  const [source, setSource] = React.useState<"all" | MediaSource>("all");
  const [active, setActive] = React.useState<MediaAsset | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<MediaAsset | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return media
      .filter((m) => (source === "all" ? true : m.source === source))
      .filter((m) => {
        if (!q) return true;
        const hay = `${m.alt} ${m.tags.join(" ")}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [media, query, source]);

  const handleAdd = React.useCallback(
    (url: string) => {
      const asset: MediaAsset = {
        id: nid("media"),
        source: "upload",
        url,
        thumbUrl: url,
        width: 1080,
        height: 1080,
        alt: "",
        tags: [],
        createdAt: Date.now(),
      };
      dispatch({ type: "media.create", asset });
      toast.success("Media added to gallery");
    },
    [dispatch],
  );

  const confirmDelete = React.useCallback(() => {
    if (!pendingDelete) return;
    dispatch({ type: "media.delete", id: pendingDelete.id });
    toast.success("Media deleted");
    if (active?.id === pendingDelete.id) setActive(null);
    setPendingDelete(null);
  }, [pendingDelete, dispatch, active]);

  return (
    <div className="reveal space-y-6">
      {/* Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {ready ? `${media.length} asset${media.length === 1 ? "" : "s"}` : "Loading media…"}
            </p>
          </div>
          <div className="w-full max-w-[180px] sm:w-auto">
            <ImageField label="Add media" onUploaded={handleAdd} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by alt text or tag…"
              className="pl-9"
            />
          </div>
          <Select value={source} onValueChange={(v) => setSource(v as typeof source)}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          Google Photos &amp; Drive sources connect in Integrations.
        </p>
      </div>

      {/* Grid */}
      {!ready ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasMedia={media.length > 0} onAdd={handleAdd} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActive(m)}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-card text-left transition hover:border-brand/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.thumbUrl || m.url}
                alt={m.alt || "Media asset"}
                loading="lazy"
                className="size-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-black/10 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                <div className="flex items-start justify-between gap-1">
                  <Badge variant="secondary" className="pointer-events-auto text-[10px]">
                    {SOURCE_LABELS[m.source]}
                  </Badge>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDelete(m);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        setPendingDelete(m);
                      }
                    }}
                    className="pointer-events-auto inline-flex size-7 items-center justify-center rounded-md bg-background/80 text-destructive backdrop-blur transition hover:bg-background"
                  >
                    <Trash2 className="size-3.5" />
                  </span>
                </div>
                {m.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {m.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-foreground backdrop-blur"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
          {active && (
            <div className="grid sm:grid-cols-[1.4fr_1fr]">
              <div className="bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.url}
                  alt={active.alt || "Media asset"}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{SOURCE_LABELS[active.source]}</Badge>
                  <button
                    type="button"
                    onClick={() => setActive(null)}
                    className="text-muted-foreground transition hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <Meta label="Alt text" value={active.alt || "—"} />
                <Meta label="Dimensions" value={`${active.width} × ${active.height}`} />
                <Meta label="Added" value={`${rel(active.createdAt)} · ${fmtDate(active.createdAt)}`} />
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Tags</p>
                  {active.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {active.tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-[11px]">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete(active)}
                >
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this media?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the asset from your gallery. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

function EmptyState({
  hasMedia,
  onAdd,
}: {
  hasMedia: boolean;
  onAdd: (url: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/60 bg-card/50 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
        <ImageIcon className="size-6" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{hasMedia ? "No matching media" : "Your gallery is empty"}</p>
        <p className="text-sm text-muted-foreground">
          {hasMedia
            ? "Try a different search or source filter."
            : "Add your first image to get started."}
        </p>
      </div>
      {!hasMedia && (
        <div className="w-[180px]">
          <ImageField label="Add media" onUploaded={onAdd} />
        </div>
      )}
    </div>
  );
}
