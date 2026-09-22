import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Comment, CommentDoc } from "../../lib/types";

export function useComments(storyId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storyId) {
      setComments([]);
      return;
    }
    setLoading(true);
    const q = query(collection(db, "stories", storyId, "comments"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as CommentDoc) })));
      setLoading(false);
    });
  }, [storyId]);

  return { comments, loading };
}
