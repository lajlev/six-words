// One-off migration: backfill `language: "en"` on every story/comment doc
// that predates the language field. Firestore excludes documents missing a
// field from an equality filter, so without this, pre-existing English
// stories would vanish from any language-filtered query.
//
// Run against the emulator (default) or production with --prod.
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const PROD = process.argv.includes("--prod");
const PROJECT_ID = "lillefar-com";

if (!PROD) {
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
}

async function confirmProd(): Promise<void> {
  const { createInterface } = await import("node:readline/promises");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `This backfills language:"en" on stories in the LIVE Firestore project "${PROJECT_ID}". Type "yes" to continue: `
  );
  rl.close();
  if (answer.trim().toLowerCase() !== "yes") {
    console.log("Aborted.");
    process.exit(1);
  }
}

async function main() {
  if (PROD) await confirmProd();

  initializeApp({ projectId: PROJECT_ID });
  const db = getFirestore();

  const stories = await db.collection("stories").get();
  const missing = stories.docs.filter((d) => d.data().language === undefined);
  console.log(`${stories.size} stories total, ${missing.length} missing a language field.`);

  let batch = db.batch();
  let n = 0;
  for (const doc of missing) {
    batch.update(doc.ref, { language: "en" });
    n++;
    if (n % 400 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  }
  if (n % 400 !== 0) await batch.commit();

  console.log(`Backfilled language:"en" on ${missing.length} stories.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
