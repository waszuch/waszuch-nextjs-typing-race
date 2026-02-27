import { describe, it, expect, vi } from "vitest";
import { calculateAccuracy, calculateWpm } from "@/stores/typing-store";

describe("calculateAccuracy", () => {
  it("returns 1 for empty typed text", () => {
    expect(calculateAccuracy("hello", "")).toBe(1);
  });

  it("returns 1 for perfectly typed text", () => {
    expect(calculateAccuracy("hello world", "hello world")).toBe(1);
  });

  it("returns 0 when every character is wrong", () => {
    expect(calculateAccuracy("abc", "xyz")).toBe(0);
  });

  it("calculates partial accuracy correctly", () => {
    expect(calculateAccuracy("hello", "hxllo")).toBe(0.8);
  });

  it("handles typed text longer than sentence", () => {
    const result = calculateAccuracy("hi", "hix");
    expect(result).toBeCloseTo(2 / 3);
  });

  it("handles single character match", () => {
    expect(calculateAccuracy("a", "a")).toBe(1);
  });

  it("handles single character mismatch", () => {
    expect(calculateAccuracy("a", "b")).toBe(0);
  });
});

describe("calculateWpm", () => {
  it("returns 0 when elapsed time is too short", () => {
    const now = Date.now();
    expect(calculateWpm("hello", "hello", now)).toBe(0);
  });

  it("calculates WPM based on correct characters", () => {
    vi.useFakeTimers();
    const start = Date.now();
    vi.advanceTimersByTime(60_000);

    const result = calculateWpm("hello world", "hello world", start);
    // 11 correct chars / 5 = 2.2 words, / 1 minute = 2.2, rounded = 2
    expect(result).toBe(2);

    vi.useRealTimers();
  });

  it("only counts correct characters for WPM", () => {
    vi.useFakeTimers();
    const start = Date.now();
    vi.advanceTimersByTime(60_000);

    const result = calculateWpm("hello", "hxllx", start);
    // 3 correct chars (h, l, l) / 5 = 0.6 words / 1 min = 0.6, rounded = 1
    expect(result).toBe(1);

    vi.useRealTimers();
  });

  it("scales WPM with time correctly", () => {
    vi.useFakeTimers();
    const start = Date.now();
    vi.advanceTimersByTime(30_000);

    const result = calculateWpm("hello world", "hello world", start);
    // 11 correct chars / 5 = 2.2, / 0.5 min = 4.4, rounded = 4
    expect(result).toBe(4);

    vi.useRealTimers();
  });

  it("returns 0 for no correct characters", () => {
    vi.useFakeTimers();
    const start = Date.now();
    vi.advanceTimersByTime(60_000);

    expect(calculateWpm("abc", "xyz", start)).toBe(0);

    vi.useRealTimers();
  });
});
