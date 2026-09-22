import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { db } from "./admin.js";
import { incrementOnce } from "./idempotent.js";

export const onLikeWrite = onDocumentWritten({ document: "stories/{storyId}/likes/{uid}", region: "europe-west1" }, async (event) => {
  const before = event.data?.before.exists ?? false;
  const after = event.data?.after.exists ?? false;
  if (before === after) return;
  const { storyId } = event.params;
  await incrementOnce(event.id, db.doc(`stories/${storyId}`), "likeCount", after ? 1 : -1);
});
