import { describe, it, expect, beforeEach } from "vitest";
import { useTypingStore } from "@/stores/typing-store";

describe("useTypingStore", () => {
  beforeEach(() => {
    useTypingStore.getState().reset();
    useTypingStore.getState().setSentence("");
  });

  it("initializes with default values", () => {
    const state = useTypingStore.getState();
    expect(state.typedText).toBe("");
    expect(state.wpm).toBe(0);
    expect(state.accuracy).toBe(1);
    expect(state.startedAt).toBeNull();
  });

  it("sets sentence and resets state", () => {
    useTypingStore.getState().setSentence("hello world");
    const state = useTypingStore.getState();
    expect(state.sentence).toBe("hello world");
    expect(state.typedText).toBe("");
    expect(state.startedAt).toBeNull();
  });

  it("updates typedText on type", () => {
    useTypingStore.getState().setSentence("hello");
    useTypingStore.getState().onType("hel");
    expect(useTypingStore.getState().typedText).toBe("hel");
  });

  it("sets startedAt on first keystroke", () => {
    useTypingStore.getState().setSentence("hello");
    expect(useTypingStore.getState().startedAt).toBeNull();
    useTypingStore.getState().onType("h");
    expect(useTypingStore.getState().startedAt).not.toBeNull();
  });

  it("keeps startedAt on subsequent keystrokes", () => {
    useTypingStore.getState().setSentence("hello");
    useTypingStore.getState().onType("h");
    const firstStart = useTypingStore.getState().startedAt;
    useTypingStore.getState().onType("he");
    expect(useTypingStore.getState().startedAt).toBe(firstStart);
  });

  it("resets all values", () => {
    useTypingStore.getState().setSentence("hello");
    useTypingStore.getState().onType("hel");
    useTypingStore.getState().reset();
    const state = useTypingStore.getState();
    expect(state.typedText).toBe("");
    expect(state.wpm).toBe(0);
    expect(state.accuracy).toBe(1);
    expect(state.startedAt).toBeNull();
  });
});
