import { FAMILIES, LANGUAGES, familyColor, type Family, type Language } from "@shared/wheel";
import type { FeedTab } from "../../lib/types";

const TABS: { key: FeedTab; label: string }[] = [
  { key: "forYou", label: "For you" },
  { key: "new", label: "New" },
  { key: "top", label: "Top" }
];

const LANGUAGE_LABEL: Record<Language, string> = { en: "EN", da: "DA" };

export function TopBar({
  family,
  onFamily,
  language,
  onLanguage,
  tab,
  onTab
}: {
  family?: Family;
  onFamily: (family?: Family) => void;
  language?: Language;
  onLanguage: (language?: Language) => void;
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
        {LANGUAGES.map((l) => (
          <button
            key={l}
            className="chip lang-chip"
            aria-pressed={language === l}
            aria-label={l === "en" ? "English stories" : "Danish stories"}
            onClick={() => onLanguage(language === l ? undefined : l)}
          >
            {LANGUAGE_LABEL[l]}
          </button>
        ))}
        <span className="chip-divider" aria-hidden="true" />
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
