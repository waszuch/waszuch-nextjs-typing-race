import { create } from "zustand";

interface TypingState {
  sentence: string;
  typedText: string;
  startedAt: number | null;
  wpm: number;
  accuracy: number;

  setSentence: (sentence: string) => void;
  onType: (text: string) => void;
  reset: () => void;
}

function calculateAccuracy(sentence: string, typed: string): number {
  if (typed.length === 0) return 1;
  let correct = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === sentence[i]) correct++;
  }
  return correct / typed.length;
}

function calculateWpm(
  sentence: string,
  typed: string,
  startedAt: number,
): number {
  const elapsedMinutes = (Date.now() - startedAt) / 60_000;
  if (elapsedMinutes < 0.01) return 0;

  let correctChars = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === sentence[i]) correctChars++;
  }

  return Math.round(correctChars / 5 / elapsedMinutes);
}

export const useTypingStore = create<TypingState>((set, get) => ({
  sentence: "",
  typedText: "",
  startedAt: null,
  wpm: 0,
  accuracy: 1,

  setSentence: (sentence) => set({ sentence, typedText: "", startedAt: null, wpm: 0, accuracy: 1 }),

  onType: (text) => {
    const { sentence, startedAt } = get();
    const now = startedAt ?? Date.now();

    set({
      typedText: text,
      startedAt: now,
      accuracy: calculateAccuracy(sentence, text),
      wpm: calculateWpm(sentence, text, now),
    });
  },

  reset: () => set({ typedText: "", startedAt: null, wpm: 0, accuracy: 1 }),
}));
