import { describe, expect, it } from "vitest";
import { ALL_WORDS, FAMILIES, WHEEL, findWord, randomWord, shuffledWords } from "./wheel";

describe("wheel data", () => {
  it("has 6 families", () => {
    expect(FAMILIES).toHaveLength(6);
  });

  it("has 69 words total across the wheel", () => {
    expect(ALL_WORDS).toHaveLength(69);
  });

  it("gives every word at least one form including itself, lowercase", () => {
    for (const w of ALL_WORDS) {
      expect(w.forms.length).toBeGreaterThan(0);
      expect(w.forms).toContain(w.word.toLowerCase());
      for (const f of w.forms) expect(f).toBe(f.toLowerCase());
    }
  });

  it("has no duplicate words on the wheel", () => {
    const words = ALL_WORDS.map((w) => w.word.toLowerCase());
    expect(new Set(words).size).toBe(words.length);
  });

  it("every family entry has a color", () => {
    for (const family of FAMILIES) {
      expect(WHEEL[family].color).toMatch(/^var\(--/);
    }
  });

  it("findWord is case-insensitive and returns family", () => {
    expect(findWord("jealous")?.family).toBe("Anger");
    expect(findWord("JEALOUS")?.family).toBe("Anger");
    expect(findWord("not-a-word")).toBeUndefined();
  });
});

describe("randomWord", () => {
  it("never returns the excluded word", () => {
    for (let i = 0; i < 200; i++) {
      const pick = randomWord("Jealous");
      expect(pick.word).not.toBe("Jealous");
    }
  });

  it("returns a word that exists on the wheel", () => {
    const pick = randomWord();
    expect(findWord(pick.word)).toBeDefined();
  });
});

describe("shuffledWords", () => {
  it("returns all 69 words exactly once", () => {
    const shuffled = shuffledWords();
    expect(shuffled).toHaveLength(69);
    expect(new Set(shuffled.map((w) => w.word)).size).toBe(69);
  });
});
