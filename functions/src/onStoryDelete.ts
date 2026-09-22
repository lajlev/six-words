import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import { db } from "./admin.js";
import { incrementOnce } from "./idempotent.js";

async function deleteAll(ref: FirebaseFirestore.CollectionReference): Promise<void> {
  const snap = await ref.get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export const onStoryDelete = onDocumentDeleted({ document: "stories/{storyId}", region: "europe-west1" }, async (event) => {
  const snap = event.data;
  if (!snap) return;
  const story = snap.data() as { authorId: string };
  const storyRef = snap.ref;

  const commentsSnap = await storyRef.collection("comments").get();
  for (const comment of commentsSnap.docs) {
    await deleteAll(comment.ref.collection("likes"));
  }
  await deleteAll(storyRef.collection("comments"));
  await deleteAll(storyRef.collection("likes"));

  await incrementOnce(event.id, db.doc(`users/${story.authorId}`), "storyCount", -1);
});
