import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink
} from "firebase/auth";
import { auth } from "../../lib/firebase";

const STORAGE_KEY = "sixwords-email-for-signin";

export async function sendEmailSignInLink(email: string): Promise<void> {
  await sendSignInLinkToEmail(auth, email, {
    url: `${window.location.origin}/signin`,
    handleCodeInApp: true
  });
  window.localStorage.setItem(STORAGE_KEY, email);
}

/** Call once on app load. Completes an email-link sign-in if the current URL is one. */
export async function completeEmailLinkSignInIfPresent(): Promise<void> {
  if (!isSignInWithEmailLink(auth, window.location.href)) return;
  let email = window.localStorage.getItem(STORAGE_KEY);
  if (!email) {
    email = window.prompt("Confirm your email to finish signing in:");
  }
  if (!email) return;
  await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem(STORAGE_KEY);
  const url = new URL(window.location.href);
  url.search = "";
  window.history.replaceState({}, "", url.toString());
}
