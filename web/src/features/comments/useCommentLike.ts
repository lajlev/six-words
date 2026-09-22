import { useEffect, useState } from "react";
import { deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../auth/useAuth";

export function useCommentLike(storyId: string, commentId: string) {
  const { user, requireAuth } = useAuth();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!user) {
      setLiked(false);
      return;
    }
    return onSnapshot(doc(db, "stories", storyId, "comments", commentId, "likes", user.uid), (snap) =>
      setLiked(snap.exists())
    );
  }, [storyId, commentId, user]);

  async function toggle() {
    if (!requireAuth() || !user) return;
    const next = !liked;
    setLiked(next);
    try {
      const ref = doc(db, "stories", storyId, "comments", commentId, "likes", user.uid);
      if (next) await setDoc(ref, { createdAt: Date.now() });
      else await deleteDoc(ref);
    } catch {
      setLiked(!next);
    }
  }

  return { liked, toggle };
}
