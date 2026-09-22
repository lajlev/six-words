import { describe, expect, it } from "vitest";
import { FAMILIES, LANGUAGES, allWords, familyColor, findWord, randomWord, shuffledWords } from "./wheel";

describe("wheel data", () => {
  it("has 6 families and 2 languages", () => {
    expect(FAMILIES).toHaveLength(6);
    expect(LANGUAGES).toEqual(["en", "da"]);
  });

  for (const language of LANGUAGES) {
    describe(`language: ${language}`, () => {
      it("has 69 words total across the wheel", () => {
        expect(allWords(language)).toHaveLength(69);
      });

      it("gives every word at least one form including itself, lowercase", () => {
        for (const w of allWords(language)) {
          expect(w.forms.length).toBeGreaterThan(0);
          expect(w.forms).toContain(w.word.toLowerCase());
          for (const f of w.forms) expect(f).toBe(f.toLowerCase());
        }
      });

      it("has no duplicate words on the wheel", () => {
        const words = allWords(language).map((w) => w.word.toLowerCase());
        expect(new Set(words).size).toBe(words.length);
      });

      it("findWord is case-insensitive and returns family", () => {
        const first = allWords(language)[0];
        expect(findWord(first.word.toLowerCase(), language)?.family).toBe(first.family);
        expect(findWord(first.word.toUpperCase(), language)?.family).toBe(first.family);
        expect(findWord("not-a-real-word-xyz", language)).toBeUndefined();
      });

      it("randomWord never returns the excluded word and always exists on the wheel", () => {
        for (let i = 0; i < 100; i++) {
          const excluded = allWords(language)[0].word;
          const pick = randomWord(language, excluded);
          expect(pick.word).not.toBe(excluded);
          expect(findWord(pick.word, language)).toBeDefined();
        }
      });

      it("shuffledWords returns all 69 words exactly once", () => {
        const shuffled = shuffledWords(language);
        expect(shuffled).toHaveLength(69);
        expect(new Set(shuffled.map((w) => w.word)).size).toBe(69);
      });
    });
  }

  it("every family has a color, shared across languages", () => {
    for (const family of FAMILIES) {
      expect(familyColor(family)).toMatch(/^var\(--/);
    }
  });

  it("English and Danish wheels don't share word text", () => {
    const en = new Set(allWords("en").map((w) => w.word.toLowerCase()));
    const da = allWords("da").map((w) => w.word.toLowerCase());
    for (const w of da) expect(en.has(w)).toBe(false);
  });
});
