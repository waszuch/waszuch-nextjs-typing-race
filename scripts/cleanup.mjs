import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL);

const ended = await sql`UPDATE rounds SET status = 'ended' WHERE status = 'active'`;
console.log("Ended active rounds:", ended.count);

await sql`CREATE UNIQUE INDEX IF NOT EXISTS unique_active_round ON rounds (status) WHERE status = 'active'`;
console.log("Created unique_active_round index");

await sql.end();
