import { FAMILIES, familyColor, type Family } from "@shared/wheel";
import type { FeedTab } from "../../lib/types";

const TABS: { key: FeedTab; label: string }[] = [
  { key: "forYou", label: "For you" },
  { key: "new", label: "New" },
  { key: "top", label: "Top" }
];

export function TopBar({
  family,
  onFamily,
  tab,
  onTab
}: {
  family?: Family;
  onFamily: (family?: Family) => void;
  tab: FeedTab;
  onTab: (tab: FeedTab) => void;
}) {
  return (
    <nav className="top" aria-label="Filter feed">
      <div className="segmented" role="tablist" aria-label="Feed order">
        {TABS.map((t) => (
          <button
            key={t.key}
            className="segbtn"
            role="tab"
            aria-pressed={tab === t.key}
            onClick={() => onTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="chips">
        <button
          className="chip"
          aria-pressed={!family}
          onClick={() => onFamily(undefined)}
        >
          All
        </button>
        {FAMILIES.map((f) => (
          <button
            key={f}
            className="chip"
            aria-pressed={family === f}
            style={{ "--c": familyColor(f) } as React.CSSProperties}
            onClick={() => onFamily(f)}
          >
            {f}
          </button>
        ))}
      </div>
    </nav>
  );
}
