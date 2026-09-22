// Imports the 207 English prototype stories (scripts/seedData.ts, generated
// from six-word-feed.html) and 207 original Danish stories
// (scripts/seedDataDanish.ts) as the system account @sixwords, with each
// story's three interpretations imported as comments from generated
// per-language handles.
//
// Run against the emulator (default) or production with --prod. Writes an
// initial guess at commentCount/storyCount directly, then always finishes
// with reconcileCounts() to correct them from actual data -- deployed
// functions are always live in production (onStoryCreate/onCommentWrite
// will react to every doc this script creates and increment those same
// counters again), so a precomputed value alone drifts. Reconciliation
// makes the result correct regardless of whether/how many times functions
// fired, rather than depending on running with functions turned off.
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { SEED_NAMES, SEED_STORIES, type SeedStory } from "./seedData.js";
import { SEED_STORIES_DA } from "./seedDataDanish.js";

const SEED_NAMES_DA = [
  "mette.k", "anders_skriver", "sofie89", "lars.tvivler", "freja_ser", "mikkel.gaetter",
  "ida.dagbog", "storm_nord", "clara.detektiv", "rasmus77", "nanna_hygge", "viggo.mistanke",
  "agnete.k", "oscar_nat", "tekla.spor", "bjorn.ryger", "saga89", "kasper.gemmer"
];

const PROD = process.argv.includes("--prod");
const langArg = process.argv.find((a) => a.startsWith("--lang="));
const LANG: "en" | "da" | "all" = (langArg?.split("=")[1] as "en" | "da" | "all" | undefined) ?? "all";
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
    storyCount: SEED_STORIES.length + SEED_STORIES_DA.length
  });
  batch.set(db.doc(`handles/${SYSTEM_HANDLE}`), { uid: SYSTEM_UID });

  for (const name of [...SEED_NAMES, ...SEED_NAMES_DA]) {
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

async function seedStories(
  db: FirebaseFirestore.Firestore,
  stories: SeedStory[],
  language: "en" | "da",
  names: string[]
): Promise<void> {
  const now = Date.now();
  let batch = db.batch();
  let ops = 0;

  for (const [i, story] of stories.entries()) {
    const h = hash(`${language}-${story.id}`);
    const createdAt = now - (stories.length - i) * 3_600_000;
    // Plain story.id (not language-prefixed): English/Danish word slugs never
    // collide (disjoint word sets), and the 207 English stories already live
    // in production under these exact bare IDs -- prefixing here would
    // create duplicates instead of matching them on a re-seed.
    const storyRef = db.doc(`stories/${story.id}`);
    batch.set(storyRef, {
      text: story.text,
      word: story.word,
      family: story.family,
      language,
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
      const name = names[(h + ci * 7) % names.length];
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

async function reconcileCounts(db: FirebaseFirestore.Firestore): Promise<void> {
  console.log("Reconciling commentCount/storyCount from actual data...");
  const stories = await db.collection("stories").get();
  const storyCountByAuthor = new Map<string, number>();
  let batch = db.batch();
  let ops = 0;
  let fixed = 0;

  for (const storyDoc of stories.docs) {
    const data = storyDoc.data();
    const commentsAgg = await storyDoc.ref.collection("comments").count().get();
    const actualCommentCount = commentsAgg.data().count;
    if (data.commentCount !== actualCommentCount) {
      batch.update(storyDoc.ref, { commentCount: actualCommentCount });
      ops++;
      fixed++;
      if (ops >= 400) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
    if (data.status === "published") {
      storyCountByAuthor.set(data.authorId, (storyCountByAuthor.get(data.authorId) ?? 0) + 1);
    }
  }
  if (ops > 0) {
    await batch.commit();
    batch = db.batch();
    ops = 0;
  }

  for (const [authorId, count] of storyCountByAuthor) {
    const userSnap = await db.doc(`users/${authorId}`).get();
    if (userSnap.exists && userSnap.data()?.storyCount !== count) {
      batch.update(userSnap.ref, { storyCount: count });
      ops++;
      fixed++;
      if (ops >= 400) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
  }
  if (ops > 0) await batch.commit();
  console.log(`Reconciliation fixed ${fixed} field(s).`);
}

async function main() {
  if (PROD) await confirmProd();

  initializeApp({ projectId: PROJECT_ID });
  const db = getFirestore();

  if (process.argv.includes("--reconcile-only")) {
    console.log(`Reconciling ${PROD ? "PRODUCTION" : "the emulator"} (${PROJECT_ID})...`);
    await reconcileCounts(db);
    return;
  }

  console.log(`Seeding ${PROD ? "PRODUCTION" : "the emulator"} (${PROJECT_ID}), lang=${LANG}...`);
  // seedUsers is idempotent (always writes the full user/handle set), safe
  // to run regardless of --lang. seedStories is NOT idempotent -- it adds a
  // fresh batch of comment docs every call without clearing old ones -- so
  // --lang matters there: re-running it for a language that's already
  // seeded in production would duplicate comments.
  await seedUsers(db);
  if (LANG === "en" || LANG === "all") await seedStories(db, SEED_STORIES, "en", SEED_NAMES);
  if (LANG === "da" || LANG === "all") await seedStories(db, SEED_STORIES_DA, "da", SEED_NAMES_DA);
  await reconcileCounts(db);
  console.log(`Seeded (lang=${LANG}).`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
