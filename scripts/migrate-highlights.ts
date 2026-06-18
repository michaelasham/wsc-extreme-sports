/**
 * Creates the session_highlights table.
 * Run with: DATABASE_URL=... npx tsx scripts/migrate-highlights.ts
 */
import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS session_highlights (
      id            text PRIMARY KEY,
      session_id    text NOT NULL REFERENCES rage_sessions(id) ON DELETE CASCADE,
      media_id      text NOT NULL REFERENCES media(id),
      capture_order integer NOT NULL,
      created_at    timestamp DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_session_highlights_session_id
      ON session_highlights(session_id);
  `);

  console.log("✓ session_highlights table created");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
