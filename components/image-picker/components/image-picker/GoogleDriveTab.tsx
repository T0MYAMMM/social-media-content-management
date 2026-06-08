"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { GoogleImage, GoogleSearchFn, ImageValue } from "../../types";

/** Google Drive source tab. Mirrors UnsplashTab: search box + results grid →
 *  onSelect(ImageValue) with type "gdrive". The searcher is INJECTED; when
 *  absent the tab shows a friendly connect empty-state and calls nothing. */
export function GoogleDriveTab({
  onSelect,
  searchGoogleDrive,
}: {
  onSelect: (c: ImageValue) => void;
  searchGoogleDrive?: GoogleSearchFn;
}) {
  const [q, setQ] = React.useState("");
  const [photos, setPhotos] = React.useState<GoogleImage[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  const run = async () => {
    if (!searchGoogleDrive) return;
    setBusy(true);
    setNotice(null);
    const res = await searchGoogleDrive(q.trim());
    setBusy(false);
    setPhotos(res.photos);
    if (res.notice) setNotice(res.notice);
  };

  const pick = (p: GoogleImage) =>
    onSelect({
      type: "gdrive",
      value: p.full,
      positionY: 50,
      metadata: { id: p.id, thumb: p.thumb, full: p.full, source: "gdrive" },
    });

  if (!searchGoogleDrive) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 p-8 text-center">
        <p className="text-sm font-medium text-foreground">Google Drive not connected</p>
        <p className="text-xs text-muted-foreground">
          Connect Google Drive in Integrations to browse here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search Drive images by name…"
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
          Search image files in your Drive by name.
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
