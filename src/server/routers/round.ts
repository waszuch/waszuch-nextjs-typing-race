import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import { rounds, roundPlayers, players } from "../db/schema";
import { getRandomSentence } from "../constants";

const ROUND_DURATION_SECONDS = 60;

export const roundRouter = router({
  getActive: publicProcedure.query(async ({ ctx }) => {
    const [current] = await ctx.db
      .select()
      .from(rounds)
      .where(eq(rounds.status, "active"))
      .limit(1);

    if (current) {
      const elapsed = (Date.now() - new Date(current.startTime).getTime()) / 1000;
      if (elapsed < current.duration) {
        return current;
      }
      await ctx.db
        .update(rounds)
        .set({ status: "ended" })
        .where(eq(rounds.id, current.id));
    }

    try {
      const [created] = await ctx.db
        .insert(rounds)
        .values({
          sentence: getRandomSentence(),
          duration: ROUND_DURATION_SECONDS,
        })
        .returning();

      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create round",
        });
      }

      return created;
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      const [existing] = await ctx.db
        .select()
        .from(rounds)
        .where(eq(rounds.status, "active"))
        .limit(1);

      if (existing) return existing;
      throw new Error("Failed to get or create active round");
    }
  }),

  join: protectedProcedure
    .input(
      z.object({
        roundId: z.string().uuid(),
        playerId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [player] = await ctx.db
        .select({ id: players.id })
        .from(players)
        .where(
          and(
            eq(players.id, input.playerId),
            eq(players.authId, ctx.authUserId),
          ),
        )
        .limit(1);

      if (!player) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

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

      if (!joined) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to join round",
        });
      }

      return joined;
    }),

  saveProgress: protectedProcedure
    .input(
      z.object({
        roundId: z.string().uuid(),
        playerId: z.string().uuid(),
        progressText: z.string(),
        wpm: z.number().min(0),
        accuracy: z.number().min(0).max(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [player] = await ctx.db
        .select({ id: players.id })
        .from(players)
        .where(
          and(
            eq(players.id, input.playerId),
            eq(players.authId, ctx.authUserId),
          ),
        )
        .limit(1);

      if (!player) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [updated] = await ctx.db
        .update(roundPlayers)
        .set({
          progressText: input.progressText,
          wpm: input.wpm,
          accuracy: input.accuracy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(roundPlayers.roundId, input.roundId),
            eq(roundPlayers.playerId, input.playerId),
          ),
        )
        .returning();

      return updated ?? null;
    }),

  end: protectedProcedure
    .input(z.object({ roundId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [participant] = await ctx.db
        .select({ id: roundPlayers.id })
        .from(roundPlayers)
        .innerJoin(players, eq(roundPlayers.playerId, players.id))
        .where(
          and(
            eq(roundPlayers.roundId, input.roundId),
            eq(players.authId, ctx.authUserId),
          ),
        )
        .limit(1);

      if (!participant) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await ctx.db
        .update(rounds)
        .set({ status: "ended" })
        .where(
          and(eq(rounds.id, input.roundId), eq(rounds.status, "active")),
        );

      return { ended: true };
    }),

});
