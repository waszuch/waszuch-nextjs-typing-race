import { router } from "../trpc/init";
import { roundRouter } from "./round";

export const appRouter = router({
  round: roundRouter,
});

export type AppRouter = typeof appRouter;
