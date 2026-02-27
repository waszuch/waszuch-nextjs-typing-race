import { router } from "../trpc";
import { roundRouter } from "./round";
import { playerRouter } from "./player";

export const appRouter = router({
  round: roundRouter,
  player: playerRouter,
});

export type AppRouter = typeof appRouter;
