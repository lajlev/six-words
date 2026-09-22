// Imports the 207 prototype stories (scripts/seedData.ts, generated from
// six-word-feed.html) as the system account @sixwords, with each story's
// three interpretations imported as comments from generated handles.
//
// Run against the emulator (default) or production with --prod. Writes
// counts (likeCount/commentCount) directly rather than relying on the
// onStoryCreate/onCommentWrite Cloud Functions triggers, so this script
// must be run with ONLY the firestore+auth emulators active (see
// package.json's "seed" script / README) -- if the functions emulator is
// also listening, its rate limiter would hide most of a 207-story burst
// from a single system account, and its counters would double-count the
// comments this script already accounts for.
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { SEED_NAMES, SEED_STORIES } from "./seedData.js";

const PROD = process.argv.includes("--prod");
const PROJECT_ID = "lillefar-com";
const SYSTEM_UID = "sixwords-system";
const SYSTEM_HANDLE = "sixwords";

if (!PROD) {
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
}

function hash(s: string): number {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

async function confirmProd(): Promise<void> {
  const { createInterface } = await import("node:readline/promises");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `This writes seed data to the LIVE Firestore project "${PROJECT_ID}". Type "yes" to continue: `
  );
  rl.close();
  if (answer.trim().toLowerCase() !== "yes") {
    console.log("Aborted.");
    process.exit(1);
  }
}

async function seedUsers(db: FirebaseFirestore.Firestore): Promise<void> {
  const batch = db.batch();
  batch.set(db.doc(`users/${SYSTEM_UID}`), {
    handle: SYSTEM_HANDLE,
    displayName: "Six Words",
    photoURL: null,
    createdAt: Date.now(),
    storyCount: SEED_STORIES.length
  });
  batch.set(db.doc(`handles/${SYSTEM_HANDLE}`), { uid: SYSTEM_UID });

  for (const name of SEED_NAMES) {
    const uid = `seed-${name}`;
    batch.set(db.doc(`users/${uid}`), {
      handle: name,
      displayName: name,
      photoURL: null,
      createdAt: Date.now(),
      storyCount: 0
    });
    batch.set(db.doc(`handles/${name}`), { uid });
  }
  await batch.commit();
}

async function seedStories(db: FirebaseFirestore.Firestore): Promise<void> {
  const now = Date.now();
  let batch = db.batch();
  let ops = 0;

  for (const [i, story] of SEED_STORIES.entries()) {
    const h = hash(story.id);
    const createdAt = now - (SEED_STORIES.length - i) * 3_600_000;
    const storyRef = db.doc(`stories/${story.id}`);
    batch.set(storyRef, {
      text: story.text,
      word: story.word,
      family: story.family,
      authorId: SYSTEM_UID,
      authorHandle: SYSTEM_HANDLE,
      createdAt,
      likeCount: 500 + (h % 48_000),
      commentCount: story.interpretations.length,
      random: Math.random(),
      textNormalized: story.text.trim().toLowerCase(),
      status: "published"
    });
    ops++;

    story.interpretations.forEach((interp, ci) => {
      const name = SEED_NAMES[(h + ci * 7) % SEED_NAMES.length];
      batch.set(storyRef.collection("comments").doc(), {
        text: interp.text,
        authorId: `seed-${name}`,
        authorHandle: name,
        createdAt: createdAt + ci * 60_000,
        likeCount: 40 + ((h >>> (ci * 5)) % 2600)
      });
      ops++;
    });

    if (ops > 400) {
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) await batch.commit();
}

async function main() {
  if (PROD) await confirmProd();

  initializeApp({ projectId: PROJECT_ID });
  const db = getFirestore();

  console.log(`Seeding ${PROD ? "PRODUCTION" : "the emulator"} (${PROJECT_ID})...`);
  await seedUsers(db);
  await seedStories(db);
  console.log(`Seeded ${SEED_STORIES.length} stories and ${SEED_NAMES.length + 1} users.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
