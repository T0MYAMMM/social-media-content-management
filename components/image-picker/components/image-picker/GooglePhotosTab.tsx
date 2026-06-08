"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GoogleImage, GoogleSearchFn, ImageValue } from "../../types";

/** Google Photos source tab. Mirrors UnsplashTab: search box + results grid →
 *  onSelect(ImageValue) with type "google-photos". The searcher is INJECTED;
 *  when absent the tab shows a friendly connect empty-state and calls nothing. */
export function GooglePhotosTab({
  onSelect,
  searchGooglePhotos,
}: {
  onSelect: (c: ImageValue) => void;
  searchGooglePhotos?: GoogleSearchFn;
}) {
  const [q, setQ] = React.useState("");
  const [photos, setPhotos] = React.useState<GoogleImage[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  const run = async () => {
    if (!searchGooglePhotos) return;
    setBusy(true);
    setNotice(null);
    const res = await searchGooglePhotos(q.trim());
    setBusy(false);
    setPhotos(res.photos);
    if (res.notice) setNotice(res.notice);
  };

  const pick = (p: GoogleImage) =>
    onSelect({
      type: "google-photos",
      value: p.full,
      positionY: 50,
      metadata: { id: p.id, thumb: p.thumb, full: p.full, source: "google-photos" },
    });

  if (!searchGooglePhotos) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 p-8 text-center">
        <p className="text-sm font-medium text-foreground">Google Photos not connected</p>
        <p className="text-xs text-muted-foreground">
          Connect Google Photos in Integrations to browse here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search Google Photos…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
        />
        <Button onClick={run} disabled={busy} size="icon" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {notice && <p className="text-xs text-muted-foreground">{notice}</p>}
      {!notice && photos.length === 0 && !busy && (
        <p className="text-[11px] text-muted-foreground">
          Search your library by category (people, food, travel, nature…).
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant="ghost"
            onClick={() => pick(p)}
            className="group relative h-20 overflow-hidden rounded-md p-0 ring-1 ring-border transition hover:ring-2 hover:ring-primary"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumb} alt={p.alt} loading="lazy" className="h-full w-full object-cover" />
          </Button>
        ))}
      </div>
    </div>
  );
}
