"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { db } from "@/lib/db";
import { rageSessions, media, campers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import * as storage from "@/lib/storage";
import { scoreSession, computePoints } from "@/lib/scoring";
import { getCabinRank } from "@/lib/queries";
import { getAuthSession } from "@/lib/session";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 50 * 1024 * 1024;

async function processAndStoreImage(
  file: File,
  sessionId: string,
  slot: "before" | "after"
): Promise<{ mediaId: string; relPath: string; buf: Buffer }> {
  if (!ALLOWED_MIME.has(file.type)) throw new Error(`Unsupported type: ${file.type}`);
  if (file.size > MAX_BYTES) throw new Error("Image too large (max 50MB)");

  const rawBuf = Buffer.from(await file.arrayBuffer());
  const processed = await sharp(rawBuf)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const meta = await sharp(processed).metadata();
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const fileId = randomUUID();
  const relPath = `${yyyy}/${mm}/${sessionId}-${slot}-${fileId}.webp`;

  storage.put(relPath, processed);

  const mediaId = randomUUID();
  await db.insert(media).values({
    id: mediaId,
    relPath,
    mime: "image/webp",
    width: meta.width ?? null,
    height: meta.height ?? null,
    bytes: processed.length,
  });

  return { mediaId, relPath, buf: processed };
}

async function findOrCreateCamper(name: string, cabinId: string): Promise<string> {
  const trimmed = name.trim();
  const existing = await db.query.campers.findFirst({
    where: (c, { eq: deq, and: dand }) => dand(deq(c.name, trimmed), deq(c.cabinId, cabinId)),
  });
  if (existing) return existing.id;
  const id = randomUUID();
  await db.insert(campers).values({ id, name: trimmed, cabinId });
  return id;
}

export async function createRageSession(formData: FormData): Promise<string> {
  const authed = await getAuthSession();
  if (!authed) throw new Error("Unauthorized");

  const cabinId = formData.get("cabinId")?.toString();
  const camperName = formData.get("camperName")?.toString()?.trim();
  const beforeFile = formData.get("before") as File | null;
  const afterFile = formData.get("after") as File | null;

  if (!cabinId || !camperName) throw new Error("Missing cabin or camper name");
  if (!beforeFile || !afterFile) throw new Error("Both before and after photos are required");

  // Up to 3 evenly-spaced highlight frames (canvas JPEG blobs)
  const highlightBufs: Buffer[] = [];
  for (let i = 0; i < 3; i++) {
    const f = formData.get(`highlight${i}`) as File | null;
    if (f && f.size > 0) {
      highlightBufs.push(Buffer.from(await f.arrayBuffer()));
    }
  }

  const sessionId = randomUUID();

  const [beforeData, afterData] = await Promise.all([
    processAndStoreImage(beforeFile, sessionId, "before"),
    processAndStoreImage(afterFile, sessionId, "after"),
  ]);

  const cabinRow = await db.query.cabins.findFirst({
    where: (c) => eq(c.id, cabinId),
  });
  if (!cabinRow) throw new Error("Cabin not found");

  const camperId = await findOrCreateCamper(camperName, cabinId);

  let aiResult: import("@/lib/scoring").AiScoreResult;
  try {
    aiResult = await scoreSession({
      beforeBuf: beforeData.buf,
      afterBuf: afterData.buf,
      highlightBufs: highlightBufs.length > 0 ? highlightBufs : undefined,
      cabinName: cabinRow.name,
      camperName,
    });
  } catch (err) {
    console.error("Gemini scoring failed:", err);
    const fallback = { targetCompletion: 0, destructionSeverity: 0, impactScore: 0, debrisSpread: 0 };
    const { overallScore, points } = computePoints(fallback);
    aiResult = {
      ...fallback,
      overallScore,
      points,
      confidence: 0,
      analysis: ["AI scoring unavailable — staff review required."],
      badges: [],
      improvementTips: [],
    };
  }

  await db.insert(rageSessions).values({
    id: sessionId,
    cabinId,
    camperId,
    status: "pending",
    beforeMediaId: beforeData.mediaId,
    afterMediaId: afterData.mediaId,
    aiTargetCompletion: aiResult.targetCompletion,
    aiDestructionSeverity: aiResult.destructionSeverity,
    aiImpactScore: aiResult.impactScore,
    aiDebrisSpread: aiResult.debrisSpread,
    aiOverallScore: aiResult.overallScore,
    aiConfidence: aiResult.confidence,
    aiAnalysis: aiResult.analysis,
    aiBadges: aiResult.badges,
    aiImprovementTips: aiResult.improvementTips,
    totalScore: aiResult.points,
    manualAdjustment: 0,
  });

  return sessionId;
}

export async function confirmSession(
  sessionId: string,
  manualAdjustment = 0
): Promise<void> {
  const authed = await getAuthSession();
  if (!authed) throw new Error("Unauthorized");

  const session = await db.query.rageSessions.findFirst({
    where: (s) => eq(s.id, sessionId),
  });
  if (!session) throw new Error("Session not found");

  const previousRank = await getCabinRank(session.cabinId);
  const adj = Math.max(-500, Math.min(500, Math.round(manualAdjustment)));
  const finalScore = Math.max(0, (session.totalScore ?? 0) + adj);

  await db
    .update(rageSessions)
    .set({
      status: "confirmed",
      confirmedAt: new Date(),
      previousRank,
      manualAdjustment: adj,
      totalScore: finalScore,
    })
    .where(eq(rageSessions.id, sessionId));

  revalidatePath("/leaderboard");
  revalidatePath(`/rage-room/${sessionId}`);
  revalidatePath(`/session-review`);
}
