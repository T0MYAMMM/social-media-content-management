"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Console section placeholder. Each console slice replaces this with its real
 * implementation; until then routes resolve and the shell stays navigable.
 */
export function ConsolePlaceholder({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 py-12 text-center">
          {icon}
          <p className="text-sm text-muted-foreground">
            This workspace is being assembled.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
