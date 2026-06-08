"use client";

import * as React from "react";
import { Check, ImageOff } from "lucide-react";
import { useMedia } from "@/components/templates/personal-brand/shared/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Media picker — multi-select toggles over the existing gallery. Selection is
 * staged locally and committed on "Done"; uploads are handled by the Gallery.
 */
export function MediaPickerDialog({
  open,
  onOpenChange,
  selectedIds,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onConfirm: (ids: string[]) => void;
}) {
  const media = useMedia();
  const [draft, setDraft] = React.useState<string[]>(selectedIds);

  React.useEffect(() => {
    if (open) setDraft(selectedIds);
  }, [open, selectedIds]);

  const toggle = (id: string) => {
    setDraft((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attach media</DialogTitle>
          <DialogDescription>
            Select from your gallery. {draft.length} selected.
          </DialogDescription>
        </DialogHeader>

        {media.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 text-center">
            <ImageOff className="size-6 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Your gallery is empty.</p>
            <p className="text-[11px] text-muted-foreground/70">
              Upload media in the Gallery first.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[55vh] pr-3">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {media.map((asset) => {
                const active = draft.includes(asset.id);
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => toggle(asset.id)}
                    className={`group relative aspect-square overflow-hidden rounded-md border transition ${
                      active
                        ? "border-brand ring-2 ring-brand/40"
                        : "border-border/60 hover:border-brand/40"
                    }`}
                    aria-pressed={active}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.thumbUrl || asset.url}
                      alt={asset.alt}
                      className="h-full w-full object-cover"
                    />
                    {active && (
                      <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-brand text-brand-foreground">
                        <Check className="size-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-brand text-brand-foreground hover:bg-brand/90"
            onClick={() => {
              onConfirm(draft);
              onOpenChange(false);
            }}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
