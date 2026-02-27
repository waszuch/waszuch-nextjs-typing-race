"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useTRPC } from "@/lib/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const trpc = useTRPC();
  const healthQuery = useQuery(trpc.healthCheck.queryOptions());

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Typing Race</h1>
      <p className="text-muted-foreground">
        Real-time typing competition — coming soon.
      </p>

      {authLoading && <Skeleton className="h-6 w-48" />}

      {authError && (
        <p className="text-sm text-destructive">Auth error: {authError}</p>
      )}

      {user && (
        <Badge variant="secondary">
          Connected as {user.id.slice(0, 8)}...
        </Badge>
      )}

      {healthQuery.data && (
        <Badge variant="outline">
          API: {healthQuery.data.status}
        </Badge>
      )}
    </main>
  );
}
