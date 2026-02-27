import { eq } from "drizzle-orm";
import { publicProcedure, router } from "../trpc/init";
import { rounds } from "../db/schema";
import { getRandomSentence } from "../data/sentences";

export const roundRouter = router({
  getActive: publicProcedure.query(async ({ ctx }) => {
    const [active] = await ctx.db
      .select()
      .from(rounds)
      .where(eq(rounds.status, "active"))
      .limit(1);

    if (active) return active;

    const [created] = await ctx.db
      .insert(rounds)
      .values({
        sentence: getRandomSentence(),
        duration: 60,
      })
      .returning();

    return created!;
  }),
});
