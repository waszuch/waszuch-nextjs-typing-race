import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { publicProcedure, router } from "../trpc";
import { rounds, roundPlayers, players } from "../db/schema";
import { getRandomSentence } from "../constants";

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

  join: publicProcedure
    .input(
      z.object({
        roundId: z.string().uuid(),
        playerId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(roundPlayers)
        .where(
          and(
            eq(roundPlayers.roundId, input.roundId),
            eq(roundPlayers.playerId, input.playerId),
          ),
        )
        .limit(1);

      if (existing) return existing;

      const [joined] = await ctx.db
        .insert(roundPlayers)
        .values({
          roundId: input.roundId,
          playerId: input.playerId,
        })
        .returning();

      return joined!;
    }),

  end: publicProcedure
    .input(z.object({ roundId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(rounds)
        .set({ status: "ended" })
        .where(
          and(eq(rounds.id, input.roundId), eq(rounds.status, "active")),
        );

      const [newRound] = await ctx.db
        .insert(rounds)
        .values({
          sentence: getRandomSentence(),
          duration: 60,
        })
        .returning();

      return newRound!;
    }),

  getPlayers: publicProcedure
    .input(z.object({ roundId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          id: roundPlayers.id,
          playerId: roundPlayers.playerId,
          playerName: players.name,
          progressText: roundPlayers.progressText,
          wpm: roundPlayers.wpm,
          accuracy: roundPlayers.accuracy,
          updatedAt: roundPlayers.updatedAt,
        })
        .from(roundPlayers)
        .innerJoin(players, eq(roundPlayers.playerId, players.id))
        .where(eq(roundPlayers.roundId, input.roundId));
    }),
});
