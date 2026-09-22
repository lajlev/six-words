export const HOUR_MS = 60 * 60 * 1000;
export const STORY_LIMIT_PER_HOUR = 10;
export const COMMENT_LIMIT_PER_HOUR = 60;

export interface RateLimitState {
  windowStart: number;
  storyCount: number;
  commentCount: number;
}

const EMPTY_STATE: RateLimitState = { windowStart: 0, storyCount: 0, commentCount: 0 };

/** Pure window/counter math, unit-testable without Firestore. */
export function nextRateLimitState(
  current: RateLimitState | undefined,
  now: number,
  kind: "story" | "comment",
  limit: number
): { state: RateLimitState; overLimit: boolean } {
  const base = current && now - current.windowStart < HOUR_MS ? current : { ...EMPTY_STATE, windowStart: now };
  const countKey = kind === "story" ? "storyCount" : "commentCount";
  const nextCount = base[countKey] + 1;
  const state: RateLimitState = { ...base, [countKey]: nextCount };
  return { state, overLimit: nextCount > limit };
}
