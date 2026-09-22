import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../../lib/firebase";
import { Sheet } from "../../components/Sheet";
import { useAuth } from "../auth/useAuth";
import type { Story } from "../../lib/types";

const REASONS = ["Spam", "Doesn't follow the rules", "Offensive", "Something else"];

export function ReportSheet({ story, open, onClose, onReported }: {
  story: Story | null;
  open: boolean;
  onClose: () => void;
  onReported: () => void;
}) {
  const { user, requireAuth } = useAuth();
  const [busy, setBusy] = useState(false);

  async function report(reason: string) {
    if (!story || !requireAuth() || !user) return;
    setBusy(true);
    try {
      await addDoc(collection(db, "reports"), {
        storyId: story.id,
        reporterId: user.uid,
        reason,
        createdAt: Date.now()
      });
      // Best-effort: the report itself is already recorded above regardless
      // of whether this notification succeeds.
      httpsCallable(functions, "sendReportEmail")({ storyId: story.id, reason }).catch(() => {});
      onReported();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} title="Report story" onClose={onClose}>
      <div className="report-sheet-body">
        {REASONS.map((reason) => (
          <button key={reason} className="report-reason" disabled={busy} onClick={() => report(reason)}>
            {reason}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
