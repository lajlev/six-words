import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { db } from "./admin.js";
import { checkAndRecordRateLimit } from "./rateLimit.js";
import { isSeedAuthor } from "./seedAuthors.js";
import { incrementOnce } from "./idempotent.js";

export const onCommentWrite = onDocumentWritten({ document: "stories/{storyId}/comments/{commentId}", region: "europe-west1" }, async (event) => {
  const before = event.data?.before.exists ?? false;
  const after = event.data?.after.exists ?? false;
  if (before === after) return;
  const { storyId } = event.params;
  const storyRef = db.doc(`stories/${storyId}`);

  if (!before && after) {
    await incrementOnce(event.id, storyRef, "commentCount", 1);
    const comment = event.data!.after.data() as { authorId: string };
    if (!isSeedAuthor(comment.authorId)) {
      const overLimit = await checkAndRecordRateLimit(comment.authorId, "comment");
      if (overLimit) {
        // Deleting re-triggers this function on the delete branch below, which
        // decrements the count we just incremented -- net effect is zero.
        await event.data!.after.ref.delete();
      }
    }
    return;
  }

  await incrementOnce(event.id, storyRef, "commentCount", -1);
});
