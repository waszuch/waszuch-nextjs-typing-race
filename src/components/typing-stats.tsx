"use client";

import { Badge } from "@/components/ui/badge";
import { useTypingStore } from "@/stores/typing-store";

export function TypingStats() {
  const { wpm, accuracy } = useTypingStore();

  return (
    <div className="flex gap-3">
      <Badge variant="outline">{wpm} WPM</Badge>
      <Badge variant="outline">{Math.round(accuracy * 100)}% accuracy</Badge>
    </div>
  );
}
