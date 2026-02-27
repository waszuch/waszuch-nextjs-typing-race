"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { useState, type ReactNode } from "react";
import superjson from "superjson";
import { TRPCProvider } from "@/lib/trpc/client";
import { queryClient } from "@/lib/trpc/shared";
import { AuthProvider } from "@/components/auth-provider";
import type { AppRouter } from "@/server/routers/_app";

export function Providers({ children }: { children: ReactNode }) {
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </TRPCProvider>
    </QueryClientProvider>
  );
}
