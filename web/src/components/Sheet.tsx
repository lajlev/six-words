import { useEffect, useRef, type ReactNode } from "react";

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
}

export function Sheet({ open, title, onClose, children }: SheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement;
      closeRef.current?.focus();
    } else if (lastFocus.current instanceof HTMLElement) {
      lastFocus.current.focus();
    }
  }, [open]);

  // Blur before onClose (not after): onClose flips `open` to false, which
  // sets aria-hidden="true" on this section on the next render. If the close
  // button (or anything else in here) still has focus at that point, Chrome
  // force-blurs it and logs "Blocked aria-hidden on an element because its
  // descendant retained focus" -- and focus is left in a broken state
  // (nothing focused, Escape/Tab handling gets flaky) rather than cleanly
  // restored to lastFocus. Moving focus out first avoids the conflict
  // entirely instead of reacting to it after the fact.
  function close() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  return (
    <>
      <div className={`scrim${open ? " open" : ""}`} onClick={close} />
      <section
        className={`sheet${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
      >
        <div className="sheet-head">
          <span>{title}</span>
          <button ref={closeRef} className="close" aria-label="Close" onClick={close}>
            ×
          </button>
        </div>
        {children}
      </section>
    </>
  );
}
