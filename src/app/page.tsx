"use client";

import { Suspense, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useTRPC } from "@/lib/trpc/client";
import { useTypingStore } from "@/stores/typing-store";
import { useRealtimeRound } from "@/hooks/use-realtime-round";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentenceDisplay } from "@/components/sentence-display";
import { TypingInput } from "@/components/typing-input";
import { TypingStats } from "@/components/typing-stats";
import { PlayersTable } from "@/components/players-table";

export default function Home() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto mt-32 h-48 w-full max-w-3xl" />}>
      <GamePage />
    </Suspense>
  );
}

function GamePage() {
  const { user, isLoading: authLoading } = useAuth();
  const trpc = useTRPC();
  const setSentence = useTypingStore((s) => s.setSentence);
  const typedText = useTypingStore((s) => s.typedText);
  const wpm = useTypingStore((s) => s.wpm);
  const accuracy = useTypingStore((s) => s.accuracy);

  const roundQuery = useQuery(trpc.round.getActive.queryOptions());
  const playerMutation = useMutation(trpc.player.findOrCreate.mutationOptions());
  const joinMutation = useMutation(trpc.round.join.mutationOptions());

  const { broadcast } = useRealtimeRound({
    roundId: roundQuery.data?.id,
    playerId: playerMutation.data?.id,
    playerName: playerMutation.data?.name,
  });

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

  useEffect(() => {
    broadcast(typedText, wpm, accuracy);
  }, [typedText, wpm, accuracy, broadcast]);

  const isLoading = authLoading || roundQuery.isLoading || playerMutation.isPending;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Typing Race</h1>

      {isLoading && <Skeleton className="h-48 w-full" />}

      {playerMutation.data && (
        <Badge variant="secondary">{playerMutation.data.name}</Badge>
      )}

      {roundQuery.data && joinMutation.data && (
        <>
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

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Players</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayersTable />
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
