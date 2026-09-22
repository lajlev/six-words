import { describe, expect, it } from "vitest";
import { normalizeText, tokenize, validateStory } from "./sixWords";
import { SEED_STORIES } from "../scripts/seedData";

describe("normalizeText", () => {
  it("trims and collapses whitespace runs", () => {
    expect(normalizeText("  hello   world  ")).toBe("hello world");
    expect(normalizeText("a\t\tb\n c")).toBe("a b c");
  });
});

describe("tokenize", () => {
  it("splits on spaces", () => {
    expect(tokenize("one two three")).toEqual(["one", "two", "three"]);
  });

  it("counts a hyphenated chunk as one word", () => {
    expect(tokenize("Inquisitive tenant knocked on painted-over door.")).toHaveLength(6);
  });

  it("counts a contraction as one word", () => {
    expect(tokenize("Confident, she bet the house. Twice.")).toHaveLength(6);
    expect(tokenize("didn't who's are contractions here today")).toHaveLength(6);
  });

  it("counts a number or time as one word", () => {
    expect(tokenize("Grandpa's worthless stock: 1976, Apple Computer.")).toHaveLength(6);
    expect(tokenize("Hopeful dog still meets the 5:15.")).toHaveLength(6);
    expect(tokenize("night shift starts around 3am today")).toHaveLength(6);
  });
});

describe("validateStory word count", () => {
  it("rejects too many words with a Cut N message", () => {
    const result = validateStory("one two three four five six seven", "Jealous");
    expect(result).toEqual({ ok: false, reason: "Your story has 7 words. Cut 1." });
  });

  it("rejects too few words with an Add N message", () => {
    const result = validateStory("Jealous one two three", "Jealous");
    expect(result).toEqual({ ok: false, reason: "Your story has 4 words. Add 2." });
  });
});

describe("validateStory feeling word", () => {
  it("requires the chosen word to appear", () => {
    const result = validateStory("one two three four five six", "Jealous");
    expect(result).toEqual({ ok: false, reason: "Use the word Jealous somewhere in your story." });
  });

  it("matches the word case-insensitively", () => {
    expect(validateStory("jealous one two three four five", "Jealous")).toEqual({ ok: true });
  });

  it("matches after stripping trailing punctuation", () => {
    expect(validateStory("one two three four five Ridiculed,", "Ridiculed")).toEqual({ ok: true });
  });

  it("matches after stripping a trailing possessive 's", () => {
    expect(validateStory("one two three four five Ridiculed's", "Ridiculed")).toEqual({ ok: true });
  });

  it("accepts a related word form (word-forms override)", () => {
    expect(validateStory("one two three four five jealousy", "Jealous")).toEqual({ ok: true });
    expect(validateStory("one two three four five enrages", "Enraged")).toEqual({ ok: true });
  });

  it("rejects an unrelated word for the chosen family word", () => {
    expect(validateStory("one two three four five happiness", "Jealous").ok).toBe(false);
  });
});

describe("validateStory length limit", () => {
  it("rejects text over 120 characters", () => {
    const long = "a".repeat(115) + " jealous";
    const result = validateStory(long, "Jealous");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/120 characters/);
  });
});

describe("validateStory rejects junk tokens", () => {
  it("rejects a chunk made only of punctuation", () => {
    const result = validateStory("one two three four jealous .", "Jealous");
    expect(result.ok).toBe(false);
  });

  it("rejects a URL", () => {
    const result = validateStory("one two three jealous see https://example.com", "Jealous");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/links/);
  });

  it("rejects an @mention", () => {
    const result = validateStory("one two three jealous of @someone", "Jealous");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/mentions/);
  });

  it("rejects an emoji-only word", () => {
    const result = validateStory("one two three jealous of 😀", "Jealous");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/Emoji/);
  });
});

describe("validateStory against an unknown word", () => {
  it("rejects when the word isn't on the wheel", () => {
    const result = validateStory("one two three four five six", "NotAWord");
    expect(result).toEqual({ ok: false, reason: "Choose a feeling word from the wheel." });
  });
});

describe("all 207 seed stories pass validation", () => {
  for (const story of SEED_STORIES) {
    it(`"${story.text}" (${story.word})`, () => {
      const result = validateStory(story.text, story.word);
      expect(result, `expected "${story.text}" to be valid for ${story.word}`).toEqual({ ok: true });
    });
  }
});
