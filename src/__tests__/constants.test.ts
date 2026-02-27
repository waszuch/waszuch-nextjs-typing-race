import { describe, it, expect } from "vitest";
import { getRandomSentence, generatePlayerName } from "@/server/constants";

describe("getRandomSentence", () => {
  it("returns a non-empty string", () => {
    const sentence = getRandomSentence();
    expect(sentence).toBeTruthy();
    expect(typeof sentence).toBe("string");
    expect(sentence.length).toBeGreaterThan(0);
  });

  it("returns different sentences over multiple calls", () => {
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(getRandomSentence());
    }
    expect(results.size).toBeGreaterThan(1);
  });
});

describe("generatePlayerName", () => {
  it("returns a name with two words", () => {
    const name = generatePlayerName();
    const parts = name.split(" ");
    expect(parts).toHaveLength(2);
  });

  it("returns capitalized words", () => {
    const name = generatePlayerName();
    const [adj, noun] = name.split(" ");
    expect(adj![0]).toBe(adj![0]!.toUpperCase());
    expect(noun![0]).toBe(noun![0]!.toUpperCase());
  });

  it("generates different names over multiple calls", () => {
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(generatePlayerName());
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
