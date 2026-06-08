"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Slide } from "./bodyBlocks";

/** Ordered editor for Story slides — add, remove, reorder, and edit each slide. */
export function SlidesEditor({
  slides,
  onChange,
}: {
  slides: Slide[];
  onChange: (slides: Slide[]) => void;
}) {
  const update = (i: number, patch: Partial<Slide>) => {
    onChange(slides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };
  const add = () => onChange([...slides, { heading: "", body: "" }]);
  const remove = (i: number) => onChange(slides.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {slides.length === 0 && (
        <div className="rounded-md border border-dashed border-border/60 px-4 py-6 text-center text-xs text-muted-foreground">
          No slides yet. Add your first slide to build the story.
        </div>
      )}

      {slides.map((slide, i) => (
        <div key={i} className="rounded-lg border border-border/60 bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-brand">
              Slide {i + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="icon-xs"
                variant="ghost"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                aria-label="Move slide up"
              >
                <ChevronUp />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                disabled={i === slides.length - 1}
                onClick={() => move(i, 1)}
                aria-label="Move slide down"
              >
                <ChevronDown />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => remove(i)}
                aria-label="Remove slide"
              >
                <Trash2 />
              </Button>
            </div>
          </div>
          <Input
            value={slide.heading}
            onChange={(e) => update(i, { heading: e.target.value })}
            placeholder="Slide heading"
            className="mb-2"
          />
          <Textarea
            value={slide.body}
            onChange={(e) => update(i, { body: e.target.value })}
            placeholder="Slide body…"
            rows={2}
          />
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={add} className="w-full">
        <Plus />
        Add slide
      </Button>
    </div>
  );
}
