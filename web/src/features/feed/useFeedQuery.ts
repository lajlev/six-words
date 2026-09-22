import { useEffect, useRef, useState } from "react";
import {
  type QueryDocumentSnapshot,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Family } from "@shared/wheel";
import type { FeedTab, Story, StoryDoc } from "../../lib/types";

const PAGE_SIZE = 10;

function toStory(snap: QueryDocumentSnapshot): Story {
  return { id: snap.id, ...(snap.data() as StoryDoc) };
}

export function useFeedQuery(tab: FeedTab, family?: Family) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const cursorDoc = useRef<QueryDocumentSnapshot | null>(null);
  const seed = useRef(Math.random());
  const cursorRandom = useRef(0);
  const wrapped = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    generation.current += 1;
    const gen = generation.current;
    setStories([]);
    setHasMore(true);
    setLoading(true);
    cursorDoc.current = null;
    seed.current = Math.random();
    cursorRandom.current = seed.current;
    wrapped.current = false;
    void fetchPage(gen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, family]);

  async function fetchNewOrTop(gen: number) {
    const dir = tab === "new" ? "createdAt" : "likeCount";
    const constraints = [
      where("status", "==", "published"),
      ...(family ? [where("family", "==", family)] : []),
      orderBy(dir, "desc"),
      ...(cursorDoc.current ? [startAfter(cursorDoc.current)] : []),
      limit(PAGE_SIZE)
    ];
    const snap = await getDocs(query(collection(db, "stories"), ...constraints));
    if (gen !== generation.current) return;
    cursorDoc.current = snap.docs.at(-1) ?? cursorDoc.current;
    setStories((prev) => [...prev, ...snap.docs.map(toStory)]);
    setHasMore(snap.docs.length === PAGE_SIZE);
    setLoading(false);
  }

  async function fetchForYou(gen: number) {
    const collected: Story[] = [];
    let remaining = PAGE_SIZE;
    let sawAny = false;

    for (let iterations = 0; iterations < 3 && remaining > 0; iterations++) {
      const base = [
        where("status", "==", "published"),
        ...(family ? [where("family", "==", family)] : [])
      ];
      const constraints = wrapped.current
        ? [...base, where("random", "<", seed.current), orderBy("random", "asc"), limit(remaining)]
        : [...base, where("random", ">=", cursorRandom.current), orderBy("random", "asc"), limit(remaining)];
      const snap = await getDocs(query(collection(db, "stories"), ...constraints));
      if (gen !== generation.current) return;
      if (snap.docs.length > 0) sawAny = true;
      collected.push(...snap.docs.map(toStory));
      remaining -= snap.docs.length;

      if (snap.docs.length > 0) {
        const lastRandom = (snap.docs.at(-1)!.data() as StoryDoc).random;
        cursorRandom.current = lastRandom;
      }

      if (snap.docs.length < (wrapped.current ? remaining + snap.docs.length : remaining)) {
        // This segment ran dry.
        if (wrapped.current) {
          // We've come back around to (or past) the seed: nothing more to show.
          setHasMore(false);
          break;
        }
        wrapped.current = true;
      }
    }

    setStories((prev) => [...prev, ...collected]);
    if (!sawAny) setHasMore(false);
    setLoading(false);
  }

  async function fetchPage(gen: number) {
    setLoading(true);
    if (tab === "forYou") await fetchForYou(gen);
    else await fetchNewOrTop(gen);
  }

  function loadMore() {
    if (loading || !hasMore) return;
    void fetchPage(generation.current);
  }

  return { stories, loading, hasMore, loadMore };
}
