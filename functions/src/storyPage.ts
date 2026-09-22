import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { onRequest } from "firebase-functions/v2/https";
import { db } from "./admin.js";

interface StoryData {
  text: string;
  word: string;
  family: string;
  status: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.join(__dirname, "..", "assets", "story-template.html");

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function injectMeta(html: string, meta: { title: string; description: string; image: string; url: string }): string {
  const tags = `
<meta property="og:type" content="article" />
<meta property="og:title" content="${escapeHtml(meta.title)}" />
<meta property="og:description" content="${escapeHtml(meta.description)}" />
<meta property="og:image" content="${meta.image}" />
<meta property="og:url" content="${meta.url}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(meta.title)}" />
<meta name="twitter:description" content="${escapeHtml(meta.description)}" />
<meta name="twitter:image" content="${meta.image}" />`;

  return html
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escapeHtml(meta.description)}" />`)
    .replace("</head>", `${tags}\n</head>`);
}

export const storyPage = onRequest({ region: "europe-west1" }, async (req, res) => {
  const template = readFileSync(TEMPLATE_PATH, "utf8");
  const match = req.path.match(/^\/s\/([^/]+)/);
  const storyId = match?.[1];

  if (!storyId) {
    res.set("Content-Type", "text/html; charset=utf-8").status(200).send(template);
    return;
  }

  const snap = await db.doc(`stories/${storyId}`).get();
  const origin = `${req.protocol}://${req.get("host")}`;

  if (!snap.exists || (snap.data() as StoryData).status !== "published") {
    res.set("Content-Type", "text/html; charset=utf-8").status(200).send(template);
    return;
  }

  const story = snap.data() as StoryData;
  const html = injectMeta(template, {
    title: story.text,
    description: `A six-word ${story.family.toLowerCase()} story about ${story.word.toLowerCase()}. Solve it on Six Words, One Feeling.`,
    image: `${origin}/og/${storyId}.png`,
    url: `${origin}/s/${storyId}`
  });

  res.set("Content-Type", "text/html; charset=utf-8").set("Cache-Control", "public, max-age=300").status(200).send(html);
});
