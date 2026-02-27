"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useTypingStore } from "@/stores/typing-store";

export function TypingInput() {
  const { sentence, typedText, onType } = useTypingStore();
  const isComplete = typedText.length >= sentence.length && sentence.length > 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isComplete) return;
      onType(e.target.value);
    },
    [isComplete, onType],
  );

  return (
    <Input
      value={typedText}
      onChange={handleChange}
      disabled={isComplete}
      placeholder="Start typing..."
      autoFocus
      className="font-mono text-lg"
    />
  );
}
