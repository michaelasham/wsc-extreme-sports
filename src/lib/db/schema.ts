import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const sessionStatusEnum = pgEnum("session_status", [
  "pending",
  "confirmed",
  "discarded",
]);

export const cabins = pgTable("cabins", {
  id: text("id").primaryKey(),
  number: integer("number").notNull().unique(),
  name: text("name").notNull(),
  mascot: text("mascot").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campers = pgTable("campers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cabinId: text("cabin_id")
    .notNull()
    .references(() => cabins.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  relPath: text("rel_path").notNull(),
  mime: text("mime").notNull(),
  width: integer("width"),
  height: integer("height"),
  bytes: integer("bytes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rageSessions = pgTable("rage_sessions", {
  id: text("id").primaryKey(),
  cabinId: text("cabin_id")
    .notNull()
    .references(() => cabins.id),
  camperId: text("camper_id")
    .notNull()
    .references(() => campers.id),
  status: sessionStatusEnum("status").notNull().default("pending"),

  beforeMediaId: text("before_media_id").references(() => media.id),
  afterMediaId: text("after_media_id").references(() => media.id),

  // AI raw output (immutable)
  aiRageScore: real("ai_rage_score"),
  aiDestructionLevel: real("ai_destruction_level"),
  aiTeamEnergy: real("ai_team_energy"),
  aiSafetyDiscipline: real("ai_safety_discipline"),
  aiCreativityBonus: integer("ai_creativity_bonus"),
  aiNotes: text("ai_notes").array(),

  // Staff-overridable final values
  finalRageScore: real("final_rage_score"),
  finalDestructionLevel: real("final_destruction_level"),
  finalTeamEnergy: real("final_team_energy"),
  finalSafetyDiscipline: real("final_safety_discipline"),
  finalCreativityBonus: integer("final_creativity_bonus"),
  totalScore: integer("total_score"),

  previousRank: integer("previous_rank"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
});

export type Cabin = typeof cabins.$inferSelect;
export type Camper = typeof campers.$inferSelect;
export type Media = typeof media.$inferSelect;
export type RageSession = typeof rageSessions.$inferSelect;
export type NewRageSession = typeof rageSessions.$inferInsert;
