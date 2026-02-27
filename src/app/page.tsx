"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useTRPC } from "@/lib/trpc/client";
import { useTypingStore } from "@/stores/typing-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentenceDisplay } from "@/components/sentence-display";
import { TypingInput } from "@/components/typing-input";
import { TypingStats } from "@/components/typing-stats";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const trpc = useTRPC();
  const setSentence = useTypingStore((s) => s.setSentence);

  const roundQuery = useQuery(trpc.round.getActive.queryOptions());
  const playerMutation = useMutation(trpc.player.findOrCreate.mutationOptions());
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

  useEffect(() => {
    if (roundQuery.data) {
      setSentence(roundQuery.data.sentence);
    }
  }, [roundQuery.data, setSentence]);

  const isLoading = authLoading || roundQuery.isLoading || playerMutation.isPending;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Typing Race</h1>

      {isLoading && <Skeleton className="h-48 w-full" />}

      {playerMutation.data && (
        <Badge variant="secondary">{playerMutation.data.name}</Badge>
      )}

      {roundQuery.data && joinMutation.data && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Round</span>
              <div className="flex gap-2">
                <TypingStats />
                <Badge>{roundQuery.data.duration}s</Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SentenceDisplay />
            <TypingInput />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
