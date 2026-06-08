import { Bot, Sparkles, Check } from "lucide-react";
import { Section, Eyebrow } from "./Section";

const FEATURES = [
  {
    title: "Learns your voice",
    body: "It reads your published posts and brand profile, so drafts land in your register — not generic marketer-speak.",
  },
  {
    title: "Grounded in your library",
    body: "Retrieval over your own content means ideas reference what you've actually said, with no hallucinated claims.",
  },
  {
    title: "From spark to sketch",
    body: "Ask for angles, hooks, carousel outlines, or a thread draft — then push the good ones straight into Production.",
  },
];

export function Copilot() {
  return (
    <Section id="copilot" className="reveal">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <Eyebrow>The copilot</Eyebrow>
          <h2 className="mt-4 text-4xl sm:text-5xl">
            An AI partner that sounds like you, because it&apos;s read you.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Cadence builds a living profile of your brand voice and retrieves from
            your own posts, captions, and notes. Every suggestion is grounded in
            your library — useful on day one, sharper every week.
          </p>

          <ul className="mt-8 space-y-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Check className="size-3.5" />
                </span>
                <div>
                  <p className="font-medium">{f.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <ChatMock />
      </div>
    </Section>
  );
}

function ChatMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-[var(--shadow-lift)]">
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3 text-sm font-medium">
        <Bot className="size-4 text-brand" />
        Copilot
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="size-3 text-brand" />
          Brand voice on
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex justify-end">
          <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand px-4 py-2.5 text-sm text-brand-foreground">
            Give me 3 Threads angles on shipping in public this week.
          </p>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[88%] space-y-2.5 rounded-2xl rounded-bl-sm border border-border/60 bg-background px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Pulling from your last 40 posts — your saves spike on
              &ldquo;quiet progress&rdquo; takes. Three angles:
            </p>
            <ol className="space-y-2 text-foreground">
              <li>
                <span className="font-medium">1 · The boring commit.</span> The
                un-glamorous fix that unblocked everything.
              </li>
              <li>
                <span className="font-medium">2 · What I almost shipped.</span> A
                near-miss you caught in review.
              </li>
              <li>
                <span className="font-medium">3 · One week, in diffs.</span> A
                receipts-style recap thread.
              </li>
            </ol>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-md bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
                Send to Production
              </span>
              <span className="rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground">
                Draft #1
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
