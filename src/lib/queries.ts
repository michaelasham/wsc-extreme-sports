import { db } from "./db";
import { cabins, campers, rageSessions, media } from "./db/schema";
import { eq, sql, desc } from "drizzle-orm";
import type { Cabin, Camper, SessionResult } from "./types";

export async function getCabinLeaderboard(): Promise<Cabin[]> {
  const rows = await db.execute(sql`
    SELECT
      c.id,
      c.number,
      c.name,
      c.mascot,
      SUM(s.total_score)::int AS points,
      ROW_NUMBER() OVER (ORDER BY SUM(s.total_score) DESC)::int AS rank
    FROM cabins c
    INNER JOIN rage_sessions s ON s.cabin_id = c.id AND s.status = 'confirmed'
    GROUP BY c.id, c.number, c.name, c.mascot
    ORDER BY rank
  `);

  return rows.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    number: Number(r.number),
    name: r.name as string,
    mascot: r.mascot as string,
    points: Number(r.points),
    rank: Number(r.rank),
  }));
}

export async function getCamperLeaderboard(): Promise<Camper[]> {
  const rows = await db.execute(sql`
    SELECT
      camp.id,
      camp.name,
      c.number AS cabin_number,
      c.name AS cabin_name,
      COALESCE(SUM(s.total_score), 0)::int AS points,
      ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(s.total_score), 0) DESC)::int AS rank
    FROM campers camp
    JOIN cabins c ON c.id = camp.cabin_id
    LEFT JOIN rage_sessions s ON s.camper_id = camp.id AND s.status = 'confirmed'
    GROUP BY camp.id, camp.name, c.number, c.name
    ORDER BY rank
  `);

  return rows.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    cabinNumber: Number(r.cabin_number),
    cabinName: r.cabin_name as string,
    points: Number(r.points),
    rank: Number(r.rank),
  }));
}

export async function getAllCabins() {
  return db.select().from(cabins).orderBy(cabins.number);
}

export async function getAllCampers() {
  return db
    .select({
      id: campers.id,
      name: campers.name,
      cabinId: campers.cabinId,
      cabinNumber: cabins.number,
      cabinName: cabins.name,
    })
    .from(campers)
    .innerJoin(cabins, eq(campers.cabinId, cabins.id))
    .orderBy(cabins.number, campers.name);
}

export async function getSessionResult(sessionId: string): Promise<SessionResult | null> {
  const rows = await db.execute(sql`
    SELECT
      s.id,
      s.status,
      s.final_rage_score,
      s.final_destruction_level,
      s.final_team_energy,
      s.final_safety_discipline,
      s.final_creativity_bonus,
      s.total_score,
      s.ai_notes,
      s.previous_rank,
      camp.name AS camper_name,
      c.id AS cabin_id,
      c.number AS cabin_number,
      c.name AS cabin_name,
      c.mascot AS cabin_mascot,
      bm.rel_path AS before_path,
      am.rel_path AS after_path,
      (
        SELECT ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(s2.total_score), 0) DESC)
        FROM cabins c2
        LEFT JOIN rage_sessions s2 ON s2.cabin_id = c2.id AND s2.status = 'confirmed'
        WHERE c2.id = c.id
        GROUP BY c2.id
      )::int AS current_rank
    FROM rage_sessions s
    JOIN campers camp ON camp.id = s.camper_id
    JOIN cabins c ON c.id = s.cabin_id
    LEFT JOIN media bm ON bm.id = s.before_media_id
    LEFT JOIN media am ON am.id = s.after_media_id
    WHERE s.id = ${sessionId}
    LIMIT 1
  `);

  if (!rows.length) return null;
  const r = rows[0] as Record<string, unknown>;

  const cabinPoints = await db.execute(sql`
    SELECT COALESCE(SUM(total_score), 0)::int AS pts
    FROM rage_sessions
    WHERE cabin_id = ${r.cabin_id as string} AND status = 'confirmed'
  `);

  const points = Number((cabinPoints[0] as Record<string, unknown>).pts ?? 0);
  const currentRank = Number(r.current_rank ?? 1);
  const previousRank = Number(r.previous_rank ?? currentRank);

  return {
    id: r.id as string,
    cabin: {
      id: r.cabin_id as string,
      number: Number(r.cabin_number),
      name: r.cabin_name as string,
      mascot: r.cabin_mascot as string,
      points,
      rank: currentRank,
    },
    camper: r.camper_name as string,
    scores: {
      rageScore: Number(r.final_rage_score ?? 0),
      rageScoreMax: 10,
      destructionLevel: Number(r.final_destruction_level ?? 0),
      teamEnergy: Number(r.final_team_energy ?? 0),
      teamEnergyMax: 10,
      safetyDiscipline: Number(r.final_safety_discipline ?? 0),
      safetyDisciplineMax: 10,
      creativityBonus: Number(r.final_creativity_bonus ?? 0),
      totalScore: Number(r.total_score ?? 0),
    },
    rankMovement: {
      previousRank,
      currentRank,
    },
    aiNotes: (r.ai_notes as string[]) ?? [],
    sessionComplete: r.status === "confirmed",
    beforeImagePath: r.before_path ? String(r.before_path) : undefined,
    afterImagePath: r.after_path ? String(r.after_path) : undefined,
  } as SessionResult & { beforeImagePath?: string; afterImagePath?: string };
}

export async function getCabinRank(cabinId: string): Promise<number> {
  const rows = await db.execute(sql`
    SELECT ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(s.total_score), 0) DESC)::int AS rank
    FROM cabins c
    LEFT JOIN rage_sessions s ON s.cabin_id = c.id AND s.status = 'confirmed'
    WHERE c.id = ${cabinId}
    GROUP BY c.id
  `);
  return rows.length ? Number((rows[0] as Record<string, unknown>).rank) : 1;
}
