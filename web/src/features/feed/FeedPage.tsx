import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useToast } from "../../components/Toast";
import type { Family } from "@shared/wheel";
import type { FeedTab, Story, StoryDoc } from "../../lib/types";
import { useFeedQuery } from "./useFeedQuery";
import { StoryCard } from "./StoryCard";
import { TopBar } from "./TopBar";
import { CommentSheet } from "../comments/CommentSheet";
import { ReportSheet } from "./ReportSheet";

export default function FeedPage() {
  const { family, storyId } = useParams<{ family?: string; storyId?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<FeedTab>("forYou");
  const { stories, loading, hasMore, loadMore } = useFeedQuery(tab, family as Family | undefined);
  const [pinnedStory, setPinnedStory] = useState<Story | null>(null);
  const feedRef = useRef<HTMLElement>(null);
  const [commentStory, setCommentStory] = useState<Story | null>(null);
  const [reportStory, setReportStory] = useState<Story | null>(null);

  useEffect(() => {
    if (!storyId) {
      setPinnedStory(null);
      return;
    }
    let cancelled = false;
    getDoc(doc(db, "stories", storyId)).then((snap) => {
      if (!cancelled && snap.exists()) setPinnedStory({ id: snap.id, ...(snap.data() as StoryDoc) });
    });
    return () => {
      cancelled = true;
    };
  }, [storyId]);

  const list = useMemo(() => {
    if (!pinnedStory) return stories;
    return [pinnedStory, ...stories.filter((s) => s.id !== pinnedStory.id)];
  }, [stories, pinnedStory]);

  useEffect(() => {
    const node = feedRef.current;
    if (!node) return;
    function onScroll() {
      if (!node || !hasMore || loading) return;
      if (node.scrollTop + node.clientHeight > node.scrollHeight - 900) loadMore();
    }
    node.addEventListener("scroll", onScroll);
    return () => node.removeEventListener("scroll", onScroll);
  }, [hasMore, loading, loadMore]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (commentStory || reportStory) return;
      const node = feedRef.current;
      if (!node) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        node.scrollBy({ top: node.clientHeight, behavior: "smooth" });
        e.preventDefault();
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        node.scrollBy({ top: -node.clientHeight, behavior: "smooth" });
        e.preventDefault();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [commentStory, reportStory]);

  return (
    <div className="app">
      <TopBar
        family={family as Family | undefined}
        onFamily={(f) => navigate(f ? `/f/${f}` : "/")}
        tab={tab}
        onTab={setTab}
      />
      <main className="feed" ref={feedRef} aria-live="polite">
        {list.length === 0 && !loading && (
          <div className="empty-state">No stories yet{family ? ` in ${family}` : ""}. Be the first to write one.</div>
        )}
        {list.map((s) => (
          <StoryCard
            key={s.id}
            story={s}
            feedRef={feedRef as React.RefObject<HTMLElement>}
            onOpenComments={setCommentStory}
            onOpenReport={setReportStory}
          />
        ))}
      </main>
      <Link to="/new" className="fab" aria-label="Write a story">
        +
      </Link>
      <CommentSheet story={commentStory} open={!!commentStory} onClose={() => setCommentStory(null)} />
      <ReportSheet
        story={reportStory}
        open={!!reportStory}
        onClose={() => setReportStory(null)}
        onReported={() => toast("Reported. Thanks.")}
      />
    </div>
  );
}
