"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { db } from "@/lib/db";
import { rageSessions, media, campers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import * as storage from "@/lib/storage";
import { scoreSession, computeTotalScore } from "@/lib/scoring";
import { getCabinRank } from "@/lib/queries";
import { getAuthSession } from "@/lib/session";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 15 * 1024 * 1024;

async function processAndStoreImage(
  file: File,
  sessionId: string,
  slot: "before" | "after"
): Promise<{ mediaId: string; relPath: string; buf: Buffer }> {
  if (!ALLOWED_MIME.has(file.type)) throw new Error(`Unsupported type: ${file.type}`);
  if (file.size > MAX_BYTES) throw new Error("Image too large (max 15MB)");

  const rawBuf = Buffer.from(await file.arrayBuffer());
  const processed = await sharp(rawBuf)
    .rotate() // auto-orient from EXIF
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

export async function createRageSession(formData: FormData): Promise<void> {
  const authed = await getAuthSession();
  if (!authed) throw new Error("Unauthorized");

  const cabinId = formData.get("cabinId")?.toString();
  const camperName = formData.get("camperName")?.toString()?.trim();
  const beforeFile = formData.get("before") as File | null;
  const afterFile = formData.get("after") as File | null;

  if (!cabinId || !camperName) throw new Error("Missing cabin or camper name");
  if (!beforeFile || !afterFile) throw new Error("Both before and after photos are required");

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

  let aiResult: import("@/lib/scoring").ScoreBreakdownResult;
  try {
    aiResult = await scoreSession({
      beforeBuf: beforeData.buf,
      afterBuf: afterData.buf,
      cabinName: cabinRow.name,
      camperName,
    });
  } catch (err) {
    console.error("Gemini scoring failed:", err);
    // Fallback: neutral scores so staff can manually enter
    const fallback = {
      rageScore: 5,
      destructionLevel: 50,
      teamEnergy: 5,
      safetyDiscipline: 5,
      creativityBonus: 0,
      notes: ["AI scoring unavailable — please enter scores manually."],
    };
    aiResult = { ...fallback, totalScore: computeTotalScore(fallback) };
  }

  await db.insert(rageSessions).values({
    id: sessionId,
    cabinId,
    camperId,
    status: "pending",
    beforeMediaId: beforeData.mediaId,
    afterMediaId: afterData.mediaId,
    aiRageScore: aiResult.rageScore,
    aiDestructionLevel: aiResult.destructionLevel,
    aiTeamEnergy: aiResult.teamEnergy,
    aiSafetyDiscipline: aiResult.safetyDiscipline,
    aiCreativityBonus: aiResult.creativityBonus,
    aiNotes: aiResult.notes,
    finalRageScore: aiResult.rageScore,
    finalDestructionLevel: aiResult.destructionLevel,
    finalTeamEnergy: aiResult.teamEnergy,
    finalSafetyDiscipline: aiResult.safetyDiscipline,
    finalCreativityBonus: aiResult.creativityBonus,
    totalScore: aiResult.totalScore,
  });

  redirect(`/rage-room/${sessionId}`);
}

export async function updateSessionScores(
  sessionId: string,
  scores: {
    rageScore: number;
    destructionLevel: number;
    teamEnergy: number;
    safetyDiscipline: number;
    creativityBonus: number;
  }
): Promise<void> {
  const authed = await getAuthSession();
  if (!authed) throw new Error("Unauthorized");

  const totalScore = computeTotalScore(scores);

  await db
    .update(rageSessions)
    .set({
      finalRageScore: scores.rageScore,
      finalDestructionLevel: scores.destructionLevel,
      finalTeamEnergy: scores.teamEnergy,
      finalSafetyDiscipline: scores.safetyDiscipline,
      finalCreativityBonus: scores.creativityBonus,
      totalScore,
    })
    .where(eq(rageSessions.id, sessionId));
}

export async function confirmSession(sessionId: string): Promise<void> {
  const authed = await getAuthSession();
  if (!authed) throw new Error("Unauthorized");

  const session = await db.query.rageSessions.findFirst({
    where: (s) => eq(s.id, sessionId),
  });
  if (!session) throw new Error("Session not found");

  const previousRank = await getCabinRank(session.cabinId);

  await db
    .update(rageSessions)
    .set({
      status: "confirmed",
      confirmedAt: new Date(),
      previousRank,
    })
    .where(eq(rageSessions.id, sessionId));

  revalidatePath("/leaderboard");
  revalidatePath(`/rage-room/${sessionId}`);
  revalidatePath(`/session-review`);
}
