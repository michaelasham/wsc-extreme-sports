import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { cabins } from "../src/lib/db/schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const CABIN_NAMES: [string, string][] = [
  ["Eagles", "🦅"],
  ["Lions", "🦁"],
  ["Wolves", "🐺"],
  ["Falcons", "🦅"],
  ["Bears", "🐻"],
  ["Tigers", "🐯"],
  ["Sharks", "🦈"],
  ["Hawks", "🦆"],
  ["Panthers", "🐆"],
  ["Cobras", "🐍"],
  ["Vipers", "🐍"],
  ["Foxes", "🦊"],
  ["Owls", "🦉"],
  ["Ravens", "🐦"],
  ["Jaguars", "🐆"],
  ["Cougars", "🦁"],
  ["Stallions", "🐴"],
  ["Bulldogs", "🐕"],
  ["Grizzlies", "🐻"],
  ["Lynx", "🐱"],
  ["Otters", "🦦"],
  ["Bison", "🦬"],
  ["Coyotes", "🐺"],
  ["Scorpions", "🦂"],
];

async function seed() {
  console.log("Seeding 24 cabins…");
  for (let i = 0; i < 24; i++) {
    const number = i + 1;
    const [name, mascot] = CABIN_NAMES[i];
    const id = `cabin-${number}`;
    await db
      .insert(cabins)
      .values({ id, number, name, mascot })
      .onConflictDoUpdate({
        target: cabins.id,
        set: { name, mascot, number },
      });
  }
  console.log("Done.");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
