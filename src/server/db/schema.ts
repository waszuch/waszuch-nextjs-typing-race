import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roundStatusEnum = pgEnum("round_status", ["active", "ended"]);

export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  authId: uuid("auth_id").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const rounds = pgTable("rounds", {
  id: uuid("id").defaultRandom().primaryKey(),
  sentence: text("sentence").notNull(),
  startTime: timestamp("start_time", { withTimezone: true })
    .defaultNow()
    .notNull(),
  duration: integer("duration").notNull().default(60),
  status: roundStatusEnum("status").notNull().default("active"),
});

export const roundPlayers = pgTable("round_players", {
  id: uuid("id").defaultRandom().primaryKey(),
  roundId: uuid("round_id")
    .notNull()
    .references(() => rounds.id),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id),
  progressText: text("progress_text").notNull().default(""),
  wpm: real("wpm").notNull().default(0),
  accuracy: real("accuracy").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
