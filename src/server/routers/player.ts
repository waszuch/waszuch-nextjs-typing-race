import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { publicProcedure, router } from "../trpc";
import { players } from "../db/schema";
import { generatePlayerName } from "../constants";

export const playerRouter = router({
  findOrCreate: publicProcedure
    .input(z.object({ authId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(players)
        .where(eq(players.authId, input.authId))
        .limit(1);

      if (existing) return existing;

      const [created] = await ctx.db
        .insert(players)
        .values({
          authId: input.authId,
          name: generatePlayerName(),
        })
        .returning();

      return created!;
    }),
});
