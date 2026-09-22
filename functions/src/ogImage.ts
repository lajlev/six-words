import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { onRequest } from "firebase-functions/v2/https";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { db } from "./admin.js";

interface StoryData {
  text: string;
  word: string;
  family: string;
  authorHandle: string;
  status: string;
}

// Keep in sync with the neon family colors in web/src/styles/global.css :root.
const FAMILY_HEX: Record<string, string> = {
  Happy: "#3dffa2",
  Surprise: "#fff04a",
  Fear: "#c77dff",
  Anger: "#ff3d7f",
  Disgust: "#b8ff3d",
  Sad: "#3dd6ff"
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, "..", "assets");

const fonts = [
  { name: "Anton", data: readFileSync(path.join(assetsDir, "Anton.ttf")), weight: 400 as const, style: "normal" as const },
  {
    name: "Bricolage Grotesque",
    data: readFileSync(path.join(assetsDir, "BricolageGrotesque-Regular.ttf")),
    weight: 400 as const,
    style: "normal" as const
  },
  {
    name: "Bricolage Grotesque",
    data: readFileSync(path.join(assetsDir, "BricolageGrotesque-Bold.ttf")),
    weight: 800 as const,
    style: "normal" as const
  }
];

function card(story: StoryData) {
  const color = FAMILY_HEX[story.family] ?? "#ffffff";
  return {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        backgroundColor: "#000000",
        backgroundImage: `radial-gradient(circle at 0% 120%, ${color}55 0%, transparent 55%)`,
        fontFamily: "Bricolage Grotesque"
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontFamily: "Anton",
              textTransform: "uppercase",
              fontSize: 88,
              lineHeight: 1,
              color: "#ffffff",
              maxWidth: "1000px"
            },
            children: story.text
          }
        },
        {
          type: "div",
          props: {
            style: { display: "flex", marginTop: 40, fontSize: 30, fontWeight: 800, color },
            children: `@${story.authorHandle}`
          }
        },
        {
          type: "div",
          props: {
            style: { display: "flex", marginTop: 8, fontSize: 24, color: "#ffffff99" },
            children: `#${story.word.toLowerCase()} #${story.family.toLowerCase()} #sixwords`
          }
        }
      ]
    }
  };
}

export const ogImage = onRequest({ region: "europe-west1" }, async (req, res) => {
  const match = req.path.match(/^\/og\/([^/.]+)\.png$/);
  const storyId = match?.[1];
  if (!storyId) {
    res.status(400).send("Bad request");
    return;
  }

  const snap = await db.doc(`stories/${storyId}`).get();
  if (!snap.exists || (snap.data() as StoryData).status !== "published") {
    res.status(404).send("Not found");
    return;
  }

  const story = snap.data() as StoryData;
  const svg = await satori(card(story) as never, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();

  res.set("Content-Type", "image/png").set("Cache-Control", "public, max-age=86400").status(200).send(Buffer.from(png));
});
