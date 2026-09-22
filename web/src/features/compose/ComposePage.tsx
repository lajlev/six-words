import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { familyColor, findWord, randomWord } from "@shared/wheel";
import { normalizeText, tokenize, validateStory } from "@shared/sixWords";
import { ShuffleIcon } from "../../components/icons";
import { useAuth } from "../auth/useAuth";
import { AuthFlow } from "../auth/AuthFlow";
import { WordPicker } from "./WordPicker";

const MAX_CHARS = 120;

export default function ComposePage() {
  const { user, profile, needsHandle } = useAuth();
  const navigate = useNavigate();
  const [{ word, family }, setWord] = useState(() => randomWord());
  const [text, setText] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const color = familyColor(family);

  const normalized = normalizeText(text);
  const tokens = useMemo(() => tokenize(text), [text]);
  const result = useMemo(() => validateStory(text, word), [text, word]);
  const wordForms = useMemo(() => new Set(findWord(word)?.forms ?? []), [word]);

  async function submit() {
    if (!user || !profile || result.ok !== true) return;
    setBusy(true);
    setSubmitError(null);
    try {
      const ref = await addDoc(collection(db, "stories"), {
        text: normalized,
        word,
        family,
        authorId: user.uid,
        authorHandle: profile.handle,
        createdAt: Date.now(),
        likeCount: 0,
        commentCount: 0,
        random: Math.random(),
        textNormalized: normalized.toLowerCase(),
        status: "published"
      });
      navigate(`/s/${ref.id}`, { replace: true });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Couldn't post. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!user || needsHandle) {
    return (
      <div className="compose-page">
        <div className="compose-top">
          <button className="compose-back" onClick={() => navigate(-1)}>
            Close
          </button>
        </div>
        <AuthFlow onDone={() => {}} />
      </div>
    );
  }

  return (
    <div className="compose-page">
      <div className="compose-top">
        <button className="compose-back" onClick={() => navigate(-1)}>
          Close
        </button>
      </div>
      <div className="compose-word-row" style={{ "--c": color } as React.CSSProperties}>
        <h1 className="compose-word">{word}</h1>
        <div className="compose-actions">
          <button className="iconbtn" onClick={() => setWord(randomWord(word))} aria-label="Shuffle word">
            <ShuffleIcon />
          </button>
          <button className="iconbtn" onClick={() => setPickerOpen(true)}>
            Choose
          </button>
        </div>
      </div>

      <div className="compose-preview" style={{ "--c": color } as React.CSSProperties}>
        <p className="story">
          {text
            ? tokens.map((w, i) => {
                const core = w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "").replace(/['’]s$/i, "").toLowerCase();
                return (
                  <span className={`w${wordForms.has(core) ? " hit" : ""}`} key={i}>
                    {w}
                    {i < tokens.length - 1 ? " " : ""}
                  </span>
                );
              })
            : <span style={{ color: "var(--dim)" }}>Your six words go here.</span>}
        </p>
      </div>

      <div className="compose-body">
        <textarea
          className="compose-textarea"
          style={{ "--c": color } as React.CSSProperties}
          value={text}
          maxLength={MAX_CHARS + 20}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Write six words using "${word}"`}
          autoFocus
        />
        <div className="compose-footer">
          <span className={`word-counter${tokens.length === 6 ? " ok" : ""}`} style={tokens.length === 6 ? { color } : undefined}>
            {tokens.length} / 6 words
          </span>
          <span style={{ color: "var(--dim)", fontSize: 12 }}>
            {normalized.length} / {MAX_CHARS}
          </span>
        </div>
        <p className="compose-error">{!result.ok && text.trim() ? result.reason : submitError ?? ""}</p>
        <button className="post-btn" disabled={busy || result.ok !== true} onClick={submit}>
          {busy ? "Posting…" : "Post"}
        </button>
      </div>

      <WordPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(w, f) => setWord({ word: w, family: f })}
      />
    </div>
  );
}
