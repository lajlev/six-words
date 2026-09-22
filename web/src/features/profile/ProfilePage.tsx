import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { familyColor } from "@shared/wheel";
import type { Story, StoryDoc, UserDoc } from "../../lib/types";

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserDoc | null | undefined>(undefined);
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    (async () => {
      const handleSnap = await getDoc(doc(db, "handles", handle));
      if (!handleSnap.exists()) {
        if (!cancelled) setProfile(null);
        return;
      }
      const uid = (handleSnap.data() as { uid: string }).uid;
      const userSnap = await getDoc(doc(db, "users", uid));
      if (cancelled) return;
      setProfile(userSnap.exists() ? (userSnap.data() as UserDoc) : null);

      const storiesSnap = await getDocs(
        query(collection(db, "stories"), where("authorId", "==", uid), orderBy("createdAt", "desc"))
      );
      if (!cancelled) {
        setStories(
          storiesSnap.docs
            .map((d) => ({ id: d.id, ...(d.data() as StoryDoc) }))
            .filter((s) => s.status === "published")
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  return (
    <div className="profile-page">
      <button className="profile-back" onClick={() => navigate(-1)}>
        ← Back
      </button>
      {profile === undefined && <div className="empty-state">Loading…</div>}
      {profile === null && <div className="empty-state">No one goes by @{handle}.</div>}
      {profile && (
        <>
          <div className="profile-head">
            <div className="profile-avatar">{profile.handle[0]?.toUpperCase()}</div>
            <p className="profile-handle">@{profile.handle}</p>
            <p className="profile-count">
              {profile.storyCount} stor{profile.storyCount === 1 ? "y" : "ies"}
            </p>
          </div>
          <div className="profile-grid">
            {stories.map((s) => (
              <Link key={s.id} to={`/s/${s.id}`} className="profile-tile" style={{ "--c": familyColor(s.family) } as React.CSSProperties}>
                <span className="g" />
                <p>{s.text}</p>
              </Link>
            ))}
          </div>
          {stories.length === 0 && <div className="empty-state">No stories yet.</div>}
        </>
      )}
    </div>
  );
}
