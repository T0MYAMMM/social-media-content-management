"use client";

/** ImagePickerDialog — the 4-tab image chooser (Gallery · Upload · Link ·
 *  Unsplash). Upload tab appears only when `onUpload` is wired; Unsplash
 *  live-search only when `searchUnsplash` is wired (else it browses the curated
 *  set). Usually you don't render this directly — use ImagePickerButton, which
 *  owns the trigger + open state. */

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ImageValue, ImageSourceProps } from "../types";
import { GalleryTab } from "./image-picker/GalleryTab";
import { UploadTab } from "./image-picker/UploadTab";
import { LinkTab } from "./image-picker/LinkTab";
import { UnsplashTab } from "./image-picker/UnsplashTab";
import { GooglePhotosTab } from "./image-picker/GooglePhotosTab";
import { GoogleDriveTab } from "./image-picker/GoogleDriveTab";

type Tab = "gallery" | "upload" | "link" | "unsplash" | "google-photos" | "gdrive";

interface Props extends ImageSourceProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSelect: (c: ImageValue) => void;
  title?: string;
}

export function ImagePickerDialog({
  open, onOpenChange, onSelect, onUpload, searchUnsplash,
  searchGooglePhotos, searchGoogleDrive, title = "Choose image",
}: Props) {
  const [tab, setTab] = React.useState<Tab>("gallery");
  const tabs: { id: Tab; label: string }[] = [
    { id: "gallery", label: "Gallery" },
    ...(onUpload ? [{ id: "upload" as const, label: "Upload" }] : []),
    { id: "link", label: "Link" },
    { id: "unsplash", label: "Unsplash" },
    // Google tabs always show; each renders a connect empty-state when its
    // searcher isn't injected (keeps callers fully backward compatible).
    { id: "google-photos", label: "Google Photos" },
    { id: "gdrive", label: "Drive" },
  ];
  const handle = (c: ImageValue) => { onSelect(c); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="border-b border-border px-4 py-3">
          <DialogTitle className="text-sm">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
          {tabs.map((t) => (
            <Button
              key={t.id} type="button" variant="ghost" onClick={() => setTab(t.id)}
              className={cn(
                "h-auto rounded-md px-3 py-1 text-xs font-medium transition",
                tab === t.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50",
              )}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="h-[440px] overflow-y-auto">
          {tab === "gallery" && <GalleryTab onSelect={handle} />}
          {tab === "upload" && onUpload && <UploadTab onSelect={handle} onUpload={onUpload} />}
          {tab === "link" && <LinkTab onSelect={handle} />}
          {tab === "unsplash" && <UnsplashTab onSelect={handle} searchUnsplash={searchUnsplash} />}
          {tab === "google-photos" && <GooglePhotosTab onSelect={handle} searchGooglePhotos={searchGooglePhotos} />}
          {tab === "gdrive" && <GoogleDriveTab onSelect={handle} searchGoogleDrive={searchGoogleDrive} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
