"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useTRPC } from "@/lib/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const trpc = useTRPC();

  const roundQuery = useQuery(trpc.round.getActive.queryOptions());

  const playerMutation = useMutation(
    trpc.player.findOrCreate.mutationOptions(),
  );

  const joinMutation = useMutation(trpc.round.join.mutationOptions());

  useEffect(() => {
    if (!user || playerMutation.data || playerMutation.isPending) return;
    playerMutation.mutate({ authId: user.id });
  }, [user]);

  useEffect(() => {
    if (
      !roundQuery.data ||
      !playerMutation.data ||
      joinMutation.data ||
      joinMutation.isPending
    )
      return;
    joinMutation.mutate({
      roundId: roundQuery.data.id,
      playerId: playerMutation.data.id,
    });
  }, [roundQuery.data, playerMutation.data]);

  const isLoading =
    authLoading || roundQuery.isLoading || playerMutation.isPending;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Typing Race</h1>

      {isLoading && <Skeleton className="h-32 w-full max-w-2xl" />}

      {playerMutation.data && (
        <Badge variant="secondary">{playerMutation.data.name}</Badge>
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

      {joinMutation.data && (
        <Badge variant="outline">Joined round</Badge>
      )}
    </main>
  );
}
