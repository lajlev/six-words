import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import type { UserDoc } from "../../lib/types";

interface AuthContextValue {
  user: User | null;
  profile: UserDoc | null;
  loading: boolean;
  /** True once we know the user is signed in but hasn't claimed a handle yet. */
  needsHandle: boolean;
  signInSheetOpen: boolean;
  /** Returns true if signed in; otherwise opens the sign-in sheet and returns false. */
  requireAuth: () => boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [signInSheetOpen, setSignInSheetOpen] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u);
    setAuthLoading(false);
    if (!u) setProfile(null);
  }), []);

  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    return onSnapshot(doc(db, "users", user.uid), (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserDoc) : null);
      setProfileLoading(false);
    });
  }, [user]);

  const needsHandle = !authLoading && !!user && !profileLoading && profile === null;

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading: authLoading || (!!user && profileLoading),
    needsHandle,
    signInSheetOpen,
    requireAuth: () => {
      if (user && profile) return true;
      setSignInSheetOpen(true);
      return false;
    },
    openSignIn: () => setSignInSheetOpen(true),
    closeSignIn: () => setSignInSheetOpen(false)
  }), [user, profile, authLoading, profileLoading, needsHandle, signInSheetOpen]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
