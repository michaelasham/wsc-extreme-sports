import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

async function clear() {
  await sql`DELETE FROM media`;
  await sql`DELETE FROM rage_sessions`;
  await sql`DELETE FROM campers`;
  console.log("Cleared rage_sessions, media, and campers.");
  await sql.end();
}

clear().catch((err) => { console.error(err); process.exit(1); });
