import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./admin.js";
import { checkAndRecordRateLimit } from "./rateLimit.js";

export const onCommentWrite = onDocumentWritten("stories/{storyId}/comments/{commentId}", async (event) => {
  const before = event.data?.before.exists ?? false;
  const after = event.data?.after.exists ?? false;
  if (before === after) return;
  const { storyId } = event.params;
  const storyRef = db.doc(`stories/${storyId}`);

  if (!before && after) {
    await storyRef.update({ commentCount: FieldValue.increment(1) });
    const comment = event.data!.after.data() as { authorId: string };
    const overLimit = await checkAndRecordRateLimit(comment.authorId, "comment");
    if (overLimit) {
      // Deleting re-triggers this function on the delete branch below, which
      // decrements the count we just incremented -- net effect is zero.
      await event.data!.after.ref.delete();
    }
    return;
  }

  await storyRef.update({ commentCount: FieldValue.increment(-1) });
});
