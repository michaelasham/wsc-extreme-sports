import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Migrating rage_sessions to new scoring schema…");
  await sql.unsafe(`
    ALTER TABLE rage_sessions
      DROP COLUMN IF EXISTS ai_rage_score,
      DROP COLUMN IF EXISTS ai_team_energy,
      DROP COLUMN IF EXISTS ai_safety_discipline,
      DROP COLUMN IF EXISTS ai_creativity_bonus,
      DROP COLUMN IF EXISTS ai_destruction_level,
      DROP COLUMN IF EXISTS final_rage_score,
      DROP COLUMN IF EXISTS final_destruction_level,
      DROP COLUMN IF EXISTS final_team_energy,
      DROP COLUMN IF EXISTS final_safety_discipline,
      DROP COLUMN IF EXISTS final_creativity_bonus,
      ADD COLUMN IF NOT EXISTS ai_target_completion integer,
      ADD COLUMN IF NOT EXISTS ai_destruction_severity integer,
      ADD COLUMN IF NOT EXISTS ai_impact_score real,
      ADD COLUMN IF NOT EXISTS ai_debris_spread integer,
      ADD COLUMN IF NOT EXISTS ai_overall_score real,
      ADD COLUMN IF NOT EXISTS ai_confidence real,
      ADD COLUMN IF NOT EXISTS ai_analysis text[],
      ADD COLUMN IF NOT EXISTS ai_badges jsonb,
      ADD COLUMN IF NOT EXISTS ai_improvement_tips text[],
      ADD COLUMN IF NOT EXISTS manual_adjustment integer NOT NULL DEFAULT 0;
  `);
  console.log("Done.");
  await sql.end();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
