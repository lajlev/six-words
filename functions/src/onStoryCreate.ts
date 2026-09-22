import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { normalizeText, validateStory } from "./shared/sixWords.js";
import { db } from "./admin.js";
import { checkAndRecordRateLimit } from "./rateLimit.js";
import { isSeedAuthor } from "./seedAuthors.js";
import { incrementOnce } from "./idempotent.js";

interface StoryData {
  text: string;
  word: string;
  authorId: string;
  language: "en" | "da";
}

export const onStoryCreate = onDocumentCreated({ document: "stories/{storyId}", region: "europe-west1" }, async (event) => {
  const snap = event.data;
  if (!snap) return;
  const story = snap.data() as StoryData;

  if (!isSeedAuthor(story.authorId)) {
    const overLimit = await checkAndRecordRateLimit(story.authorId, "story");
    if (overLimit) {
      await snap.ref.update({ status: "hidden", hiddenReason: "rate_limited" });
      return;
    }
  }

  const result = validateStory(story.text, story.word, story.language);
  if (!result.ok) {
    await snap.ref.update({ status: "hidden", hiddenReason: "invalid" });
    return;
  }

  const normalized = normalizeText(story.text).toLowerCase();
  const dupSnap = await db
    .collection("stories")
    .where("status", "==", "published")
    .where("textNormalized", "==", normalized)
    .get();
  const isDuplicate = dupSnap.docs.some((d) => d.id !== snap.id);
  if (isDuplicate) {
    await snap.ref.update({ status: "hidden", hiddenReason: "duplicate" });
    return;
  }

  await incrementOnce(event.id, db.doc(`users/${story.authorId}`), "storyCount", 1);
});
