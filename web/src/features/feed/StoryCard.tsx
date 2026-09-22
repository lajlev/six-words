import { useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { familyColor } from "@shared/wheel";
import { BubbleIcon, FlagIcon, HeartIcon, ShareIcon } from "../../components/icons";
import { useToast } from "../../components/Toast";
import { useLike } from "./useLike";
import type { Story } from "../../lib/types";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function StoryCard({
  story,
  feedRef,
  onOpenComments,
  onOpenReport
}: {
  story: Story;
  feedRef: RefObject<HTMLElement>;
  onOpenComments: (story: Story) => void;
  onOpenReport: (story: Story) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const { liked, like, toggle } = useLike(story.id);
  const toast = useToast();
  const [burst, setBurst] = useState<{ x: number; y: number; key: number } | null>(null);
  const lastTap = useRef(0);
  const color = familyColor(story.family);
  const displayLikes = story.likeCount + (liked ? 1 : 0);

  useEffect(() => {
    const node = ref.current;
    const root = feedRef.current;
    if (!node || !root) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.intersectionRatio > 0.6 && setInView(true)),
      { root, threshold: [0.6] }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [feedRef]);

  async function share() {
    const url = `${window.location.origin}/s/${story.id}`;
    const text = `${story.text}\n#${story.word.toLowerCase()} #sixwords`;
    try {
      if (navigator.share) {
        await navigator.share({ text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("Copied link");
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") toast("Copy failed. Select the text to copy it.");
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest(".act, .avatar")) return;
    const now = Date.now();
    if (now - lastTap.current < 300) {
      like();
      const rect = ref.current?.getBoundingClientRect();
      if (rect) setBurst({ x: e.clientX - rect.left, y: e.clientY - rect.top, key: now });
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }

  return (
    <section
      ref={ref}
      className={`slide${inView ? " in" : ""}`}
      style={{ "--c": color } as React.CSSProperties}
      aria-label={`Story by @${story.authorHandle}`}
      onPointerUp={onPointerUp}
    >
      <div className="glow" />
      <div className="glow b" />
      <p className="story">
        {story.text.split(" ").map((w, i) => (
          <span className="w" key={i} style={{ "--i": i } as React.CSSProperties}>
            {w}{i < story.text.split(" ").length - 1 ? " " : ""}
          </span>
        ))}
      </p>
      <div className="rail">
        <Link to={`/u/${story.authorHandle}`} className="avatar" aria-label={`@${story.authorHandle}`}>
          {story.authorHandle[0]?.toUpperCase() ?? "6"}
        </Link>
        <button className={`act${liked ? " liked" : ""}`} aria-pressed={liked} aria-label="Like" onClick={toggle}>
          <HeartIcon />
          <span>{formatCount(displayLikes)}</span>
        </button>
        <button className="act" aria-label="Comments" onClick={() => onOpenComments(story)}>
          <BubbleIcon />
          <span>{formatCount(story.commentCount)}</span>
        </button>
        <button className="act" aria-label="Share" onClick={share}>
          <ShareIcon />
          <span>Share</span>
        </button>
        <button className="act" aria-label="Report" onClick={() => onOpenReport(story)}>
          <FlagIcon />
          <span>Report</span>
        </button>
      </div>
      <div className="meta">
        <Link to={`/u/${story.authorHandle}`} className="handle">
          @{story.authorHandle}
        </Link>
        <p className="caption">
          Solve it in six words. <b>#{story.word.toLowerCase()}</b> <b>#{story.family.toLowerCase()}</b>
        </p>
      </div>
      {burst && (
        <span
          key={burst.key}
          className="burst"
          style={{ left: burst.x, top: burst.y }}
          onAnimationEnd={() => setBurst(null)}
        >
          <HeartIcon style={{ width: "100%", height: "100%" }} fill="currentColor" />
        </span>
      )}
    </section>
  );
}
