import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./admin.js";

export const onCommentLikeWrite = onDocumentWritten(
  "stories/{storyId}/comments/{commentId}/likes/{uid}",
  async (event) => {
    const before = event.data?.before.exists ?? false;
    const after = event.data?.after.exists ?? false;
    if (before === after) return;
    const { storyId, commentId } = event.params;
    await db.doc(`stories/${storyId}/comments/${commentId}`).update({ likeCount: FieldValue.increment(after ? 1 : -1) });
  }
);
