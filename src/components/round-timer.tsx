"use client";

import { Badge } from "@/components/ui/badge";

export function RoundTimer({ secondsLeft }: { secondsLeft: number | null }) {
  if (secondsLeft === null) return null;

  const isLow = secondsLeft <= 10;

  return (
    <Badge variant={isLow ? "destructive" : "outline"} className="tabular-nums">
      {secondsLeft}s
    </Badge>
  );
}
