// Builds the web app and copies its index.html into functions/assets so the
// storyPage function can inject per-story Open Graph tags into it at
// request time. Referenced as a predeploy hook from both the hosting and
// functions targets in firebase.json (idempotent, safe to run twice).
import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const webDist = path.join(root, "web", "dist", "index.html");
const dest = path.join(root, "functions", "assets", "story-template.html");

console.log("[prepareDeploy] building web app...");
execSync("npm run build", { cwd: path.join(root, "web"), stdio: "inherit" });

if (!existsSync(webDist)) {
  throw new Error(`Expected ${webDist} after web build, but it's missing.`);
}
copyFileSync(webDist, dest);
console.log(`[prepareDeploy] copied ${webDist} -> ${dest}`);
