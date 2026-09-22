import { useMemo } from "react";
import { shuffledWords, type Family } from "@shared/wheel";
import { Sheet } from "../../components/Sheet";

export function WordPicker({
  open,
  onClose,
  onPick
}: {
  open: boolean;
  onClose: () => void;
  onPick: (word: string, family: Family) => void;
}) {
  // Freshly shuffled every time the picker opens, per spec.
  const words = useMemo(() => shuffledWords(), [open]);

  return (
    <Sheet open={open} title="Choose a word" onClose={onClose}>
      <div className="picker-list" style={{ overflowY: "auto" }}>
        {words.map((w) => (
          <button
            key={w.word}
            className="picker-item"
            style={{ "--c": `var(--${w.family.toLowerCase()})` } as React.CSSProperties}
            onClick={() => {
              onPick(w.word, w.family);
              onClose();
            }}
          >
            <span>{w.word}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="fam">{w.family}</span>
              <span className="dot" />
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}
