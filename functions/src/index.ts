import { setGlobalOptions } from "firebase-functions/v2";

// App Check enforcement for this app happens on the Firestore product itself
// (Console > App Check > Firestore > Enforce), once a reCAPTCHA Enterprise key
// is registered -- see README. storyPage/ogImage must stay reachable without
// an App Check token since link-preview crawlers can't supply one, and the
// Firestore triggers below aren't client-invoked, so enforceAppCheck isn't
// set on any function here.
setGlobalOptions({ region: "europe-west1" });

export { onStoryCreate } from "./onStoryCreate.js";
export { onStoryDelete } from "./onStoryDelete.js";
export { onLikeWrite } from "./onLikeWrite.js";
export { onCommentWrite } from "./onCommentWrite.js";
export { onCommentLikeWrite } from "./onCommentLikeWrite.js";
export { storyPage } from "./storyPage.js";
export { ogImage } from "./ogImage.js";
export { sendReportEmail } from "./sendReportEmail.js";
