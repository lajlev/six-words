import { readFileSync } from "node:fs";
import {
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from "@firebase/rules-unit-testing";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setDoc, doc, deleteDoc, getDoc, runTransaction, updateDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

const PROJECT_ID = "six-words-rules-test";

const validStory = {
  text: "Jealous twin swapped the birthday candles.",
  word: "Jealous",
  family: "Anger",
  language: "en",
  authorId: "alice",
  authorHandle: "alice",
  createdAt: Date.now(),
  likeCount: 0,
  commentCount: 0,
  random: 0.42,
  textNormalized: "jealous twin swapped the birthday candles.",
  status: "published"
};

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080
    }
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

async function seedPublishedStory(storyId: string, overrides: Partial<typeof validStory> = {}) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "stories", storyId), { ...validStory, ...overrides });
  });
}

async function claimHandle(uid: string, handle: string) {
  const alice = testEnv.authenticatedContext(uid).firestore();
  await runTransaction(alice, async (tx) => {
    tx.set(doc(alice, "users", uid), { handle, displayName: "Alice", photoURL: null, createdAt: Date.now(), storyCount: 0 });
    tx.set(doc(alice, "handles", handle), { uid });
  });
}

describe("users & handles", () => {
  it("allows a paired users+handles transaction for the signed-in uid", async () => {
    await expect(claimHandle("alice", "alice")).resolves.not.toThrow();
  });

  it("denies creating a users doc without a matching handles doc", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "users", "alice"), {
      handle: "alice", displayName: "Alice", photoURL: null, createdAt: Date.now(), storyCount: 0
    }));
  });

  it("denies creating a handles doc without a matching users doc", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "handles", "alice"), { uid: "alice" }));
  });

  it("denies claiming a handle for a different uid", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(
      runTransaction(alice, async (tx) => {
        tx.set(doc(alice, "users", "alice"), { handle: "mallory", displayName: "A", photoURL: null, createdAt: Date.now(), storyCount: 0 });
        tx.set(doc(alice, "handles", "mallory"), { uid: "someone-else" });
      })
    );
  });

  it("rejects an invalid handle shape", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(
      runTransaction(alice, async (tx) => {
        tx.set(doc(alice, "users", "alice"), { handle: "AB", displayName: "A", photoURL: null, createdAt: Date.now(), storyCount: 0 });
        tx.set(doc(alice, "handles", "AB"), { uid: "alice" });
      })
    );
  });

  it("denies updating or deleting a users doc from the client", async () => {
    await claimHandle("alice", "alice");
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(updateDoc(doc(alice, "users", "alice"), { storyCount: 5 }));
    await assertFails(deleteDoc(doc(alice, "users", "alice")));
  });

  it("allows anyone, signed in or not, to read users and handles", async () => {
    await claimHandle("alice", "alice");
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anon, "users", "alice")));
    await assertSucceeds(getDoc(doc(anon, "handles", "alice")));
  });
});

describe("stories: read", () => {
  it("allows public read of a published story", async () => {
    await seedPublishedStory("s1");
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anon, "stories", "s1")));
  });

  it("denies read of a hidden story", async () => {
    await seedPublishedStory("s2", { status: "hidden" });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, "stories", "s2")));
  });
});

describe("stories: create", () => {
  it("allows a signed-in author to create a valid story", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(setDoc(doc(alice, "stories", "new1"), { ...validStory, authorId: "alice" }));
  });

  it("allows a valid Danish story against the Danish wheel", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(setDoc(doc(alice, "stories", "new-da1"), {
      ...validStory,
      authorId: "alice",
      text: "Glad hund fandt sin gamle bold.",
      word: "Glad",
      family: "Happy",
      language: "da",
      textNormalized: "glad hund fandt sin gamle bold."
    }));
  });

  it("denies an unrecognized language", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "stories", "new-badlang"), { ...validStory, authorId: "alice", language: "de" }));
  });

  it("denies a Danish word validated against the English map (family/language mismatch)", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "stories", "new-mismatch"), {
      ...validStory,
      authorId: "alice",
      word: "Glad",
      family: "Happy",
      language: "en"
    }));
  });

  it("denies creating a story while signed out", async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(anon, "stories", "new2"), validStory));
  });

  it("denies authorId not matching the signed-in uid", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "stories", "new3"), { ...validStory, authorId: "someone-else" }));
  });

  it("denies a word not on the wheel", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "stories", "new4"), { ...validStory, authorId: "alice", word: "NotAWord" }));
  });

  it("denies a family that doesn't match the word", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "stories", "new5"), { ...validStory, authorId: "alice", family: "Happy" }));
  });

  it("denies a status other than published on create", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "stories", "new6"), { ...validStory, authorId: "alice", status: "hidden" }));
  });

  it("denies non-zero counters on create", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "stories", "new7"), { ...validStory, authorId: "alice", likeCount: 1 }));
    await assertFails(setDoc(doc(alice, "stories", "new8"), { ...validStory, authorId: "alice", commentCount: 1 }));
  });

  it("denies text that isn't exactly 6 space-separated words", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "stories", "new9"), { ...validStory, authorId: "alice", text: "too few words" }));
  });

  it("denies text over 120 characters", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    const text = "a".repeat(115) + " b c d e f";
    await assertFails(setDoc(doc(alice, "stories", "new10"), { ...validStory, authorId: "alice", text }));
  });
});

describe("stories: update & delete", () => {
  it("denies any update, even by the author", async () => {
    await seedPublishedStory("s3", { authorId: "alice" });
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(updateDoc(doc(alice, "stories", "s3"), { text: "changed changed changed changed changed changed" }));
  });

  it("allows the author to delete their own story", async () => {
    await seedPublishedStory("s4", { authorId: "alice" });
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(deleteDoc(doc(alice, "stories", "s4")));
  });

  it("denies a non-author from deleting the story", async () => {
    await seedPublishedStory("s5", { authorId: "alice" });
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertFails(deleteDoc(doc(bob, "stories", "s5")));
  });
});

describe("story likes", () => {
  it("allows a user to like/unlike with their own uid as the doc id", async () => {
    await seedPublishedStory("s6", { authorId: "alice" });
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertSucceeds(setDoc(doc(bob, "stories", "s6", "likes", "bob"), { createdAt: Date.now() }));
    await assertSucceeds(deleteDoc(doc(bob, "stories", "s6", "likes", "bob")));
  });

  it("denies liking with a doc id other than the caller's uid", async () => {
    await seedPublishedStory("s7", { authorId: "alice" });
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertFails(setDoc(doc(bob, "stories", "s7", "likes", "carol"), { createdAt: Date.now() }));
  });

  it("denies liking while signed out", async () => {
    await seedPublishedStory("s8", { authorId: "alice" });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(anon, "stories", "s8", "likes", "anyone"), { createdAt: Date.now() }));
  });
});

describe("comments", () => {
  it("allows a signed-in user to comment with matching authorId and valid length", async () => {
    await seedPublishedStory("s9", { authorId: "alice" });
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertSucceeds(setDoc(doc(bob, "stories", "s9", "comments", "c1"), {
      text: "nice one", authorId: "bob", authorHandle: "bob", createdAt: Date.now(), likeCount: 0
    }));
  });

  it("denies a comment with mismatched authorId", async () => {
    await seedPublishedStory("s10", { authorId: "alice" });
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertFails(setDoc(doc(bob, "stories", "s10", "comments", "c2"), {
      text: "nice one", authorId: "carol", authorHandle: "bob", createdAt: Date.now(), likeCount: 0
    }));
  });

  it("denies an empty comment and one over 280 characters", async () => {
    await seedPublishedStory("s11", { authorId: "alice" });
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertFails(setDoc(doc(bob, "stories", "s11", "comments", "c3"), {
      text: "", authorId: "bob", authorHandle: "bob", createdAt: Date.now(), likeCount: 0
    }));
    await assertFails(setDoc(doc(bob, "stories", "s11", "comments", "c4"), {
      text: "x".repeat(281), authorId: "bob", authorHandle: "bob", createdAt: Date.now(), likeCount: 0
    }));
  });

  it("allows only the comment author to delete it", async () => {
    await seedPublishedStory("s12", { authorId: "alice" });
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "stories", "s12", "comments", "c5"), {
        text: "hi", authorId: "bob", authorHandle: "bob", createdAt: Date.now(), likeCount: 0
      });
    });
    const carol = testEnv.authenticatedContext("carol").firestore();
    await assertFails(deleteDoc(doc(carol, "stories", "s12", "comments", "c5")));
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertSucceeds(deleteDoc(doc(bob, "stories", "s12", "comments", "c5")));
  });
});

describe("reports", () => {
  it("allows a signed-in user to file a report", async () => {
    await seedPublishedStory("s13", { authorId: "alice" });
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertSucceeds(setDoc(doc(bob, "reports", "r1"), {
      storyId: "s13", reporterId: "bob", reason: "spam", createdAt: Date.now()
    }));
  });

  it("denies filing a report while signed out", async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(anon, "reports", "r2"), {
      storyId: "s13", reporterId: "anon", reason: "spam", createdAt: Date.now()
    }));
  });

  it("denies reading reports from the client", async () => {
    const bob = testEnv.authenticatedContext("bob").firestore();
    await assertSucceeds(setDoc(doc(bob, "reports", "r3"), {
      storyId: "s13", reporterId: "bob", reason: "spam", createdAt: Date.now()
    }));
    await assertFails(getDoc(doc(bob, "reports", "r3")));
  });
});

describe("rateLimits", () => {
  it("denies all client access", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "rateLimits", "alice"), { count: 1 }));
    await assertFails(getDoc(doc(alice, "rateLimits", "alice")));
  });
});

describe("processedEvents", () => {
  it("denies all client access", async () => {
    const alice = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(alice, "processedEvents", "evt1"), { processedAt: Date.now() }));
    await assertFails(getDoc(doc(alice, "processedEvents", "evt1")));
  });
});
