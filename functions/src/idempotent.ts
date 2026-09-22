import { FieldValue } from "firebase-admin/firestore";
import { db } from "./admin.js";

// Cloud Functions v2 / Eventarc delivers events at-least-once: the same
// event.id can be redelivered (observed in practice during this project's
// first-ever 2nd-gen deploy, which double-counted storyCount/commentCount
// during seeding). Every counter mutation below is guarded by a
// processedEvents/{eventId} marker written atomically with the increment, so
// a redelivered event is a no-op instead of a double count.
export async function incrementOnce(
  eventId: string,
  targetRef: FirebaseFirestore.DocumentReference,
  field: string,
  delta: number
): Promise<void> {
  const markerRef = db.collection("processedEvents").doc(eventId);
  await db.runTransaction(async (tx) => {
    const marker = await tx.get(markerRef);
    if (marker.exists) return;
    tx.set(markerRef, { processedAt: Date.now() });
    tx.update(targetRef, { [field]: FieldValue.increment(delta) });
  });
}
