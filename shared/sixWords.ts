import { findWord, type Language } from "./wheel.js";

export type ValidateResult = { ok: true } | { ok: false; reason: string };

const MAX_CHARS = 120;
const REQUIRED_WORDS = 6;

const URL_RE = /^(https?:\/\/|www\.)/i;
const MENTION_RE = /^@/;
// Extended_Pictographic covers the vast majority of emoji; VS16/ZWJ are joiners, not letters.
const EMOJI_ONLY_RE = /^[\p{Extended_Pictographic}‍️]+$/u;
const EDGE_PUNCT_RE = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;
const TRAILING_POSSESSIVE_RE = /['’]s$/i;

/** Collapses whitespace and trims, per spec rule 1. */
export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

/** Splits normalized text into raw word chunks (spec rules 2-6). */
export function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  if (normalized === "") return [];
  return normalized.split(" ");
}

/** Strips leading/trailing punctuation and a trailing possessive 's, for word-match comparison. */
function coreWord(token: string): string {
  const stripped = token.replace(EDGE_PUNCT_RE, "");
  return stripped.replace(TRAILING_POSSESSIVE_RE, "");
}

function isJunkToken(token: string): string | null {
  if (URL_RE.test(token) || token.includes("://")) return "Remove links from your story.";
  if (MENTION_RE.test(token)) return "Remove @mentions from your story.";
  if (EMOJI_ONLY_RE.test(token)) return "Emoji don't count as words — use words instead.";
  if (coreWord(token) === "") return "One of your words is just punctuation — remove it.";
  return null;
}

export function validateStory(text: string, word: string, language: Language): ValidateResult {
  const normalized = normalizeText(text);

  if (normalized.length > MAX_CHARS) {
    return { ok: false, reason: `Keep it to ${MAX_CHARS} characters or fewer.` };
  }

  const tokens = tokenize(text);

  for (const token of tokens) {
    const junk = isJunkToken(token);
    if (junk) return { ok: false, reason: junk };
  }

  if (tokens.length !== REQUIRED_WORDS) {
    const diff = REQUIRED_WORDS - tokens.length;
    if (diff > 0) {
      return { ok: false, reason: `Your story has ${tokens.length} word${tokens.length === 1 ? "" : "s"}. Add ${diff}.` };
    }
    return { ok: false, reason: `Your story has ${tokens.length} words. Cut ${-diff}.` };
  }

  const wheelWord = findWord(word, language);
  if (!wheelWord) {
    return { ok: false, reason: "Choose a feeling word from the wheel." };
  }

  const forms = new Set(wheelWord.forms.map((f) => f.toLowerCase()));
  const usesWord = tokens.some((token) => forms.has(coreWord(token).toLowerCase()));
  if (!usesWord) {
    return { ok: false, reason: `Use the word ${wheelWord.word} somewhere in your story.` };
  }

  return { ok: true };
}
