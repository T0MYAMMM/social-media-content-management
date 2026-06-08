import { cn } from "@/lib/utils";

/** Shared section wrapper — consistent vertical rhythm + max width. */
export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "mx-auto w-full max-w-6xl px-6 py-20 sm:py-28 scroll-mt-20",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Small eyebrow label above a section heading. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-brand">
      <span className="h-px w-6 bg-brand/50" aria-hidden />
      {children}
    </span>
  );
}
