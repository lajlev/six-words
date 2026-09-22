import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { db } from "./admin.js";
import { incrementOnce } from "./idempotent.js";

export const onCommentLikeWrite = onDocumentWritten(
  { document: "stories/{storyId}/comments/{commentId}/likes/{uid}", region: "europe-west1" },
  async (event) => {
    const before = event.data?.before.exists ?? false;
    const after = event.data?.after.exists ?? false;
    if (before === after) return;
    const { storyId, commentId } = event.params;
    await incrementOnce(event.id, db.doc(`stories/${storyId}/comments/${commentId}`), "likeCount", after ? 1 : -1);
  }
);
