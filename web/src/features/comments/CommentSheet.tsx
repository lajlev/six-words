import { useState } from "react";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Sheet } from "../../components/Sheet";
import { HeartIcon } from "../../components/icons";
import { useAuth } from "../auth/useAuth";
import { useComments } from "./useComments";
import { useCommentLike } from "./useCommentLike";
import type { Comment, Story } from "../../lib/types";

const MAX_LEN = 280;

export function CommentSheet({ story, open, onClose }: { story: Story | null; open: boolean; onClose: () => void }) {
  const { comments } = useComments(open ? story?.id ?? null : null);

  return (
    <Sheet open={open} title={`${comments.length} comment${comments.length === 1 ? "" : "s"}`} onClose={onClose}>
      {story && <p className="sheet-story">{story.text}</p>}
      <ul className="list">
        {comments.map((c) => (
          <CommentRow key={c.id} storyId={story?.id ?? ""} comment={c} />
        ))}
        {comments.length === 0 && <li className="empty-state" style={{ height: "auto", padding: "24px 0" }}>No comments yet. Be the first to solve it.</li>}
      </ul>
      {story && <CommentComposer storyId={story.id} />}
    </Sheet>
  );
}

function CommentRow({ storyId, comment }: { storyId: string; comment: Comment }) {
  const { user } = useAuth();
  const { liked, toggle } = useCommentLike(storyId, comment.id);
  const isOwn = user?.uid === comment.authorId;

  async function remove() {
    await deleteDoc(doc(db, "stories", storyId, "comments", comment.id));
  }

  return (
    <li className="cm">
      <div className="pic" style={{ background: "var(--happy)" }}>
        {comment.authorHandle[0]?.toUpperCase() ?? "?"}
      </div>
      <div>
        <p className="who">@{comment.authorHandle}</p>
        <p className="txt">{comment.text}</p>
        {isOwn && (
          <button className="del" onClick={remove}>
            Delete
          </button>
        )}
      </div>
      <button className={`hl${liked ? " liked" : ""}`} onClick={toggle} aria-pressed={liked} aria-label="Like comment">
        <HeartIcon style={liked ? { color: "var(--anger)" } : undefined} />
        <span>{comment.likeCount}</span>
      </button>
    </li>
  );
}

function CommentComposer({ storyId }: { storyId: string }) {
  const { user, profile, requireAuth } = useAuth();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!requireAuth() || !user || !profile) return;
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > MAX_LEN) return;
    setBusy(true);
    try {
      await addDoc(collection(db, "stories", storyId, "comments"), {
        text: trimmed,
        authorId: user.uid,
        authorHandle: profile.handle,
        createdAt: Date.now(),
        likeCount: 0
      });
      setText("");
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return <p className="signin-hint">Sign in to join the conversation.</p>;
  }

  return (
    <form className="composer-row" onSubmit={submit}>
      <textarea
        value={text}
        maxLength={MAX_LEN}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment"
        rows={1}
      />
      <button type="submit" disabled={busy || !text.trim()}>
        Post
      </button>
    </form>
  );
}
