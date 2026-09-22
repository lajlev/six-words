import { doc, runTransaction } from "firebase/firestore";
import { db } from "../../lib/firebase";

export const HANDLE_RE = /^[a-z0-9._]{3,20}$/;

export function validateHandle(handle: string): string | null {
  if (!HANDLE_RE.test(handle)) {
    return "3-20 characters: lowercase letters, numbers, dot or underscore.";
  }
  return null;
}

export async function claimHandle(uid: string, handle: string, displayName: string, photoURL: string | null): Promise<void> {
  const handleRef = doc(db, "handles", handle);
  const userRef = doc(db, "users", uid);
  await runTransaction(db, async (tx) => {
    const existing = await tx.get(handleRef);
    if (existing.exists()) {
      throw new Error("That handle is already taken.");
    }
    tx.set(userRef, {
      handle,
      displayName: displayName || handle,
      photoURL,
      createdAt: Date.now(),
      storyCount: 0
    });
    tx.set(handleRef, { uid });
  });
}
