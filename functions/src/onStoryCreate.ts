import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { normalizeText, validateStory } from "../../shared/dist/sixWords.js";
import { db } from "./admin.js";
import { checkAndRecordRateLimit } from "./rateLimit.js";

interface StoryData {
  text: string;
  word: string;
  authorId: string;
}

export const onStoryCreate = onDocumentCreated("stories/{storyId}", async (event) => {
  const snap = event.data;
  if (!snap) return;
  const story = snap.data() as StoryData;

  const overLimit = await checkAndRecordRateLimit(story.authorId, "story");
  if (overLimit) {
    await snap.ref.update({ status: "hidden", hiddenReason: "rate_limited" });
    return;
  }

  const result = validateStory(story.text, story.word);
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

  await db.doc(`users/${story.authorId}`).update({ storyCount: FieldValue.increment(1) });
});
