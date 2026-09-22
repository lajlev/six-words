import { describe, expect, it } from "vitest";
import { HOUR_MS, nextRateLimitState } from "./rateLimitMath.js";

describe("nextRateLimitState", () => {
  it("starts a fresh window when there's no prior state", () => {
    const { state, overLimit } = nextRateLimitState(undefined, 1000, "story", 10);
    expect(state).toEqual({ windowStart: 1000, storyCount: 1, commentCount: 0 });
    expect(overLimit).toBe(false);
  });

  it("accumulates counts within the same hour window", () => {
    let state = nextRateLimitState(undefined, 0, "story", 10).state;
    for (let i = 1; i < 10; i++) {
      state = nextRateLimitState(state, i * 1000, "story", 10).state;
    }
    expect(state.storyCount).toBe(10);
  });

  it("flags over-limit once the count exceeds the limit within the window", () => {
    let state = nextRateLimitState(undefined, 0, "story", 3).state;
    state = nextRateLimitState(state, 10, "story", 3).state;
    state = nextRateLimitState(state, 20, "story", 3).state;
    const result = nextRateLimitState(state, 30, "story", 3);
    expect(result.overLimit).toBe(true);
    expect(result.state.storyCount).toBe(4);
  });

  it("resets the window once an hour has elapsed", () => {
    const first = nextRateLimitState(undefined, 0, "story", 3).state;
    const result = nextRateLimitState(first, HOUR_MS + 1, "story", 3);
    expect(result.state.storyCount).toBe(1);
    expect(result.state.windowStart).toBe(HOUR_MS + 1);
    expect(result.overLimit).toBe(false);
  });

  it("tracks story and comment counts independently", () => {
    let state = nextRateLimitState(undefined, 0, "story", 10).state;
    state = nextRateLimitState(state, 1, "comment", 60).state;
    state = nextRateLimitState(state, 2, "comment", 60).state;
    expect(state).toEqual({ windowStart: 0, storyCount: 1, commentCount: 2 });
  });
});
