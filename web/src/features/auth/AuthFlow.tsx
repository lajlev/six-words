import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "./useAuth";
import { sendEmailSignInLink } from "./emailLink";
import { HANDLE_RE, claimHandle, validateHandle } from "./handleClaim";

export function AuthFlow({ onDone }: { onDone?: () => void }) {
  const { user, needsHandle } = useAuth();

  if (user && needsHandle) return <HandleForm onDone={onDone} />;
  if (user) return null;
  return <SignInOptions />;
}

function SignInOptions() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function withGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't sign in with Google.");
    } finally {
      setBusy(false);
    }
  }

  async function withEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await sendEmailSignInLink(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the sign-in link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-sheet-body">
      <button className="auth-btn" onClick={withGoogle} disabled={busy}>
        Continue with Google
      </button>
      {sent ? (
        <p className="auth-note">Check {email} for a sign-in link.</p>
      ) : (
        <form onSubmit={withEmail} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            className="auth-input"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="auth-btn" type="submit" disabled={busy || !email}>
            Email me a sign-in link
          </button>
        </form>
      )}
      {error && <p className="handle-error">{error}</p>}
    </div>
  );
}

function HandleForm({ onDone }: { onDone?: () => void }) {
  const { user } = useAuth();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const clientError = validateHandle(handle);
    if (clientError) {
      setError(clientError);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await claimHandle(user.uid, handle, user.displayName ?? handle, user.photoURL);
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't claim that handle.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="handle-form" onSubmit={submit}>
      <p className="auth-note">Pick a handle. This is how other people will see you.</p>
      <input
        className="auth-input"
        placeholder="yourhandle"
        value={handle}
        pattern={HANDLE_RE.source}
        onChange={(e) => setHandle(e.target.value.toLowerCase())}
        autoFocus
      />
      {error && <p className="handle-error">{error}</p>}
      <button className="auth-btn" type="submit" disabled={busy || !handle}>
        Claim @{handle || "handle"}
      </button>
    </form>
  );
}
