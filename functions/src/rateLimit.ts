import { db } from "./admin.js";
import {
  COMMENT_LIMIT_PER_HOUR,
  STORY_LIMIT_PER_HOUR,
  nextRateLimitState,
  type RateLimitState
} from "./rateLimitMath.js";

export async function checkAndRecordRateLimit(uid: string, kind: "story" | "comment"): Promise<boolean> {
  const ref = db.collection("rateLimits").doc(uid);
  const limit = kind === "story" ? STORY_LIMIT_PER_HOUR : COMMENT_LIMIT_PER_HOUR;
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists ? (snap.data() as RateLimitState) : undefined;
    const { state, overLimit } = nextRateLimitState(current, Date.now(), kind, limit);
    tx.set(ref, state);
    return overLimit;
  });
}
