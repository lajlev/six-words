import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import nodemailer from "nodemailer";
import { db } from "./admin.js";

// Set with: firebase functions:secrets:set GMAIL_APP_PASSWORD
// (an App Password for NOTIFY_EMAIL, not its normal login password --
// requires 2-Step Verification enabled on that Google account; create one
// at https://myaccount.google.com/apppasswords)
const gmailAppPassword = defineSecret("GMAIL_APP_PASSWORD");

const NOTIFY_EMAIL = "lajlev@gmail.com";
const SITE_URL = "https://sixwords-lillefar.web.app";

interface StoryData {
  text: string;
  authorHandle: string;
}

interface RequestData {
  storyId: string;
  reason: string;
}

// A direct client-invoked callable rather than a reports/{reportId} Firestore
// trigger: the trigger form was deployed and verified correct (trigger
// active, IAM/secret access granted, even recreated from scratch) but never
// received a single Eventarc delivery after ~20 minutes -- a callable uses
// the same onRequest-style path that storyPage/ogImage already prove works
// reliably, so the report flow doesn't depend on that Eventarc plumbing.
// The client calls this right after writing the reports/{reportId} doc
// (which remains the record of the report); a failure here doesn't block
// that write or surface to the reporter -- see ReportSheet.tsx.
export const sendReportEmail = onCall(
  { region: "europe-west1", secrets: [gmailAppPassword] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    const { storyId, reason } = request.data as RequestData;
    if (typeof storyId !== "string" || typeof reason !== "string") {
      throw new HttpsError("invalid-argument", "storyId and reason are required.");
    }

    const storySnap = await db.doc(`stories/${storyId}`).get();
    const story = storySnap.exists ? (storySnap.data() as StoryData) : null;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: NOTIFY_EMAIL, pass: gmailAppPassword.value() }
    });

    await transporter.sendMail({
      from: NOTIFY_EMAIL,
      to: NOTIFY_EMAIL,
      subject: `Story reported: ${reason}`,
      text: [
        "A story was reported on Six Words, One Feeling.",
        "",
        `Reason: ${reason}`,
        `Reported by uid: ${request.auth.uid}`,
        story ? `Story: "${story.text}" by @${story.authorHandle}` : `Story ${storyId} (not found -- may already be deleted)`,
        `Link: ${SITE_URL}/s/${storyId}`,
        `Manage: https://console.firebase.google.com/project/lillefar-com/firestore/data/~2Fstories~2F${storyId}`
      ].join("\n")
    });

    return { sent: true };
  }
);
