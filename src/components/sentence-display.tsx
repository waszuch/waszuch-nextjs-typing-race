"use client";

import { useTypingStore } from "@/stores/typing-store";

export function SentenceDisplay() {
  const { sentence, typedText } = useTypingStore();

  return (
    <p className="font-mono text-lg leading-relaxed select-none">
      {sentence.split("").map((char, i) => {
        let className = "text-muted-foreground";
        if (i < typedText.length) {
          className =
            typedText[i] === char ? "text-green-600" : "text-red-500 bg-red-100";
        }
        return (
          <span key={i} className={className}>
            {char}
          </span>
        );
      })}
    </p>
  );
}
