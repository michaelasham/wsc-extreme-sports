import "dotenv/config";
import fs from "fs";
import path from "path";
import { scoreSession } from "../src/lib/scoring";

const MEDIA_DIR = process.env.MEDIA_DIR ?? path.join(process.cwd(), ".media");

const BEFORE = "2026/06/e026d628-dc11-4c64-8aa4-db310804e01a-before-d86201ad-4c05-40e4-8367-0c0a581e5f13.webp";
const AFTER  = "2026/06/e026d628-dc11-4c64-8aa4-db310804e01a-after-e210b310-eca4-430d-b992-2d6f9056644e.webp";

async function main() {
  const beforeBuf = fs.readFileSync(path.join(MEDIA_DIR, BEFORE));
  const afterBuf  = fs.readFileSync(path.join(MEDIA_DIR, AFTER));

  console.log("Sending to Gemini…");
  const r = await scoreSession({ beforeBuf, afterBuf, cabinName: "Cabin 2", camperName: "test" });

  console.log("\n=== SCORES ===");
  console.log("Target Completion:    ", r.targetCompletion, "/ 100");
  console.log("Destruction Severity: ", r.destructionSeverity, "/ 100");
  console.log("Impact Score:         ", r.impactScore, "/ 10");
  console.log("Debris Spread:        ", r.debrisSpread, "/ 100");
  console.log("──────────────────────");
  console.log("Overall Score:        ", r.overallScore, "/ 100");
  console.log("POINTS:               ", r.points, "/ 1000");
  console.log("Confidence:           ", Math.round(r.confidence * 100) + "%");
  console.log("\nAnalysis:");
  r.analysis.forEach(n => console.log(" ·", n));
  if (r.badges.length) {
    console.log("\nBadges:");
    r.badges.forEach(b => console.log(` 🏅 ${b.name}: ${b.description}`));
  }
  if (r.improvementTips.length) {
    console.log("\nImprovement Tips:");
    r.improvementTips.forEach(t => console.log(" →", t));
  }
}

main().catch(console.error);
