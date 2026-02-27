import { eq, avg, count } from "drizzle-orm";
import { z } from "zod/v4";
import { publicProcedure, router } from "../trpc";
import { players, roundPlayers } from "../db/schema";
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

  getStats: publicProcedure
    .input(z.object({ playerId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [stats] = await ctx.db
        .select({
          avgWpm: avg(roundPlayers.wpm),
          avgAccuracy: avg(roundPlayers.accuracy),
          roundsPlayed: count(roundPlayers.id),
        })
        .from(roundPlayers)
        .where(eq(roundPlayers.playerId, input.playerId));

      return {
        avgWpm: stats?.avgWpm ? Math.round(Number(stats.avgWpm)) : 0,
        avgAccuracy: stats?.avgAccuracy ? Number(stats.avgAccuracy) : 0,
        roundsPlayed: stats?.roundsPlayed ?? 0,
      };
    }),
});
