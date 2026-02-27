import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const createTRPCContext = async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    db: (await import("./db")).db,
    authUserId: user?.id ?? null,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.authUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, authUserId: ctx.authUserId } });
});
