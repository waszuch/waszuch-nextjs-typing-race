import { router, publicProcedure } from "../trpc/init";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return { status: "ok" };
  }),
});

export type AppRouter = typeof appRouter;
