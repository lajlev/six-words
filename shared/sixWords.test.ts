import { describe, expect, it } from "vitest";
import { normalizeText, tokenize, validateStory } from "./sixWords";
import { SEED_STORIES } from "../scripts/seedData";
import { SEED_STORIES_DA } from "../scripts/seedDataDanish";

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
    const result = validateStory("one two three four five six seven", "Jealous", "en");
    expect(result).toEqual({ ok: false, reason: "Your story has 7 words. Cut 1." });
  });

  it("rejects too few words with an Add N message", () => {
    const result = validateStory("Jealous one two three", "Jealous", "en");
    expect(result).toEqual({ ok: false, reason: "Your story has 4 words. Add 2." });
  });
});

describe("validateStory feeling word", () => {
  it("requires the chosen word to appear", () => {
    const result = validateStory("one two three four five six", "Jealous", "en");
    expect(result).toEqual({ ok: false, reason: "Use the word Jealous somewhere in your story." });
  });

  it("matches the word case-insensitively", () => {
    expect(validateStory("jealous one two three four five", "Jealous", "en")).toEqual({ ok: true });
  });

  it("matches after stripping trailing punctuation", () => {
    expect(validateStory("one two three four five Ridiculed,", "Ridiculed", "en")).toEqual({ ok: true });
  });

  it("matches after stripping a trailing possessive 's", () => {
    expect(validateStory("one two three four five Ridiculed's", "Ridiculed", "en")).toEqual({ ok: true });
  });

  it("accepts a related word form (word-forms override)", () => {
    expect(validateStory("one two three four five jealousy", "Jealous", "en")).toEqual({ ok: true });
    expect(validateStory("one two three four five enrages", "Enraged", "en")).toEqual({ ok: true });
  });

  it("rejects an unrelated word for the chosen family word", () => {
    expect(validateStory("one two three four five happiness", "Jealous", "en").ok).toBe(false);
  });

  it("validates a Danish word against the Danish wheel", () => {
    expect(validateStory("en to tre fire fem glad", "Glad", "da")).toEqual({ ok: true });
    expect(validateStory("en to tre fire fem glade", "Glad", "da")).toEqual({ ok: true });
  });

  it("does not accept an English word when validating against the Danish wheel", () => {
    const result = validateStory("one two three four five jealous", "Glad", "da");
    expect(result.ok).toBe(false);
  });
});

describe("validateStory length limit", () => {
  it("rejects text over 120 characters", () => {
    const long = "a".repeat(115) + " jealous";
    const result = validateStory(long, "Jealous", "en");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/120 characters/);
  });
});

describe("validateStory rejects junk tokens", () => {
  it("rejects a chunk made only of punctuation", () => {
    const result = validateStory("one two three four jealous .", "Jealous", "en");
    expect(result.ok).toBe(false);
  });

  it("rejects a URL", () => {
    const result = validateStory("one two three jealous see https://example.com", "Jealous", "en");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/links/);
  });

  it("rejects an @mention", () => {
    const result = validateStory("one two three jealous of @someone", "Jealous", "en");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/mentions/);
  });

  it("rejects an emoji-only word", () => {
    const result = validateStory("one two three jealous of 😀", "Jealous", "en");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/Emoji/);
  });
});

describe("validateStory against an unknown word", () => {
  it("rejects when the word isn't on the wheel", () => {
    const result = validateStory("one two three four five six", "NotAWord", "en");
    expect(result).toEqual({ ok: false, reason: "Choose a feeling word from the wheel." });
  });
});

describe("all 207 English seed stories pass validation", () => {
  for (const story of SEED_STORIES) {
    it(`"${story.text}" (${story.word})`, () => {
      const result = validateStory(story.text, story.word, "en");
      expect(result, `expected "${story.text}" to be valid for ${story.word}`).toEqual({ ok: true });
    });
  }
});

describe("all 207 Danish seed stories pass validation", () => {
  for (const story of SEED_STORIES_DA) {
    it(`"${story.text}" (${story.word})`, () => {
      const result = validateStory(story.text, story.word, "da");
      expect(result, `expected "${story.text}" to be valid for ${story.word}`).toEqual({ ok: true });
    });
  }

  it("has exactly 3 stories per Danish wheel word, one solution interpretation each", () => {
    const byWord = new Map<string, number>();
    for (const story of SEED_STORIES_DA) {
      byWord.set(story.word, (byWord.get(story.word) ?? 0) + 1);
      const solutions = story.interpretations.filter((i) => i.isSolution).length;
      expect(solutions, `"${story.text}" should have exactly 1 solution interpretation`).toBe(1);
      expect(story.interpretations, `"${story.text}" should have exactly 3 interpretations`).toHaveLength(3);
    }
    expect(SEED_STORIES_DA).toHaveLength(207);
    for (const [word, count] of byWord) {
      expect(count, `expected exactly 3 stories for ${word}`).toBe(3);
    }
  });
});
