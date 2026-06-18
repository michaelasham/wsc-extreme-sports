import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  pgEnum,
  jsonb,
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

  // AI scores (immutable after creation)
  aiTargetCompletion: integer("ai_target_completion"),
  aiDestructionSeverity: integer("ai_destruction_severity"),
  aiImpactScore: real("ai_impact_score"),
  aiDebrisSpread: integer("ai_debris_spread"),
  aiOverallScore: real("ai_overall_score"),
  aiConfidence: real("ai_confidence"),
  aiAnalysis: text("ai_analysis").array(),
  aiBadges: jsonb("ai_badges"),
  aiImprovementTips: text("ai_improvement_tips").array(),

  // Points: AI points + staff manual adjustment
  totalScore: integer("total_score"),
  manualAdjustment: integer("manual_adjustment").notNull().default(0),

  previousRank: integer("previous_rank"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
});

export type Cabin = typeof cabins.$inferSelect;
export type Camper = typeof campers.$inferSelect;
export type Media = typeof media.$inferSelect;
export type RageSession = typeof rageSessions.$inferSelect;
export type NewRageSession = typeof rageSessions.$inferInsert;
