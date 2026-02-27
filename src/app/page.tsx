"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useTRPC } from "@/lib/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const trpc = useTRPC();
  const roundQuery = useQuery(trpc.round.getActive.queryOptions());

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Typing Race</h1>

      {authLoading && <Skeleton className="h-6 w-48" />}
      {authError && (
        <p className="text-sm text-destructive">Auth error: {authError}</p>
      )}
      {user && (
        <Badge variant="secondary">
          Connected as {user.id.slice(0, 8)}...
        </Badge>
      )}

      {roundQuery.isLoading && <Skeleton className="h-32 w-full max-w-2xl" />}
      {roundQuery.error && (
        <p className="text-sm text-destructive">
          Round error: {roundQuery.error.message}
        </p>
      )}
      {roundQuery.data && (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Round</span>
              <Badge>{roundQuery.data.duration}s</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg leading-relaxed">
              {roundQuery.data.sentence}
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
