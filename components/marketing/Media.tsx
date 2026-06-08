import { Upload, ImageIcon, HardDrive, Link2, Camera } from "lucide-react";
import { Section, Eyebrow } from "./Section";
import { Card } from "@/components/ui/card";

const SOURCES = [
  { icon: Upload, name: "Local upload", note: "Drag in files straight from your machine." },
  { icon: Camera, name: "Google Photos", note: "Pull from albums without re-downloading." },
  { icon: HardDrive, name: "Google Drive", note: "Link brand assets from shared drives." },
  { icon: Link2, name: "Paste a URL", note: "Grab any image on the web by link." },
  { icon: ImageIcon, name: "Unsplash", note: "Search free stock without leaving Cadence." },
];

export function Media() {
  return (
    <Section className="reveal">
      <div className="max-w-2xl">
        <Eyebrow>Media, from anywhere</Eyebrow>
        <h2 className="mt-4 text-4xl sm:text-5xl">Your assets, wherever they live.</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Stop the download-then-re-upload shuffle. Bring media in from any source
          and it lands in one searchable gallery, ready to attach to any post.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SOURCES.map(({ icon: Icon, name, note }, i) => (
          <Card
            key={name}
            className="reveal items-start gap-3 border-border/60 p-5 shadow-[var(--shadow-soft)]"
            style={{ ["--d" as string]: `${0.05 * i}s` }}
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Icon className="size-5" />
            </span>
            <h3 className="text-base font-medium">{name}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{note}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
