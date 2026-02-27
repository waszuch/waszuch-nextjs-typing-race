"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useTRPC } from "@/lib/trpc/client";
import { queryClient } from "@/lib/trpc/shared";
import { useTypingStore } from "@/stores/typing-store";
import { usePlayersStore, type PlayerProgress } from "@/stores/players-store";
import { useRealtimeRound } from "@/hooks/use-realtime-round";
import { useRoundTimer } from "@/hooks/use-round-timer";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentenceDisplay } from "@/components/sentence-display";
import { TypingInput } from "@/components/typing-input";
import { TypingStats } from "@/components/typing-stats";
import { PlayersTable } from "@/components/players-table";
import { RoundTimer } from "@/components/round-timer";
import { RoundSummary } from "@/components/round-summary";

const RESULTS_DURATION = 8;

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
  const resetTyping = useTypingStore((s) => s.reset);
  const typedText = useTypingStore((s) => s.typedText);
  const wpm = useTypingStore((s) => s.wpm);
  const accuracy = useTypingStore((s) => s.accuracy);
  const players = usePlayersStore((s) => s.players);
  const resetPlayers = usePlayersStore((s) => s.reset);

  const [showResults, setShowResults] = useState(false);
  const [resultPlayers, setResultPlayers] = useState<PlayerProgress[]>([]);
  const [resultsCountdown, setResultsCountdown] = useState(RESULTS_DURATION);

  const roundQuery = useQuery({
    ...trpc.round.getActive.queryOptions(),
    staleTime: 0,
  });
  const playerMutation = useMutation(trpc.player.findOrCreate.mutationOptions());
  const joinMutation = useMutation(trpc.round.join.mutationOptions());
  const endRoundMutation = useMutation(trpc.round.end.mutationOptions());
  const saveProgressMutation = useMutation(trpc.round.saveProgress.mutationOptions());

  const playerStatsQuery = useQuery({
    ...trpc.player.getStats.queryOptions({
      playerId: playerMutation.data?.id ?? "",
    }),
    enabled: !!playerMutation.data?.id,
  });

  const isTransitioning = useRef(false);

  const { broadcast } = useRealtimeRound({
    roundId: roundQuery.data?.id,
    playerId: playerMutation.data?.id,
    playerName: playerMutation.data?.name,
  });

  const startNextRound = useCallback(() => {
    setShowResults(false);
    resetTyping();
    resetPlayers();
    joinMutation.reset();
    queryClient.invalidateQueries({
      queryKey: trpc.round.getActive.queryKey(),
    });
    if (playerMutation.data) {
      queryClient.invalidateQueries({
        queryKey: trpc.player.getStats.queryKey({
          playerId: playerMutation.data.id,
        }),
      });
    }
    isTransitioning.current = false;
  }, [resetTyping, resetPlayers, joinMutation, trpc, playerMutation.data]);

  const handleTimeUp = useCallback(() => {
    if (!roundQuery.data || !playerMutation.data || isTransitioning.current)
      return;
    isTransitioning.current = true;

    const currentState = useTypingStore.getState();
    const finalPlayers = Object.values(usePlayersStore.getState().players);

    const hasActivity = currentState.typedText.length > 0 || finalPlayers.length > 0;

    if (!hasActivity) {
      endRoundMutation.mutate(
        { roundId: roundQuery.data.id },
        {
          onSuccess: () => {
            resetTyping();
            resetPlayers();
            joinMutation.reset();
            queryClient.invalidateQueries({
              queryKey: trpc.round.getActive.queryKey(),
            });
            isTransitioning.current = false;
          },
          onError: () => {
            isTransitioning.current = false;
          },
        },
      );
      return;
    }

    setResultPlayers(finalPlayers);
    setShowResults(true);
    setResultsCountdown(RESULTS_DURATION);

    saveProgressMutation.mutate(
      {
        roundId: roundQuery.data.id,
        playerId: playerMutation.data.id,
        progressText: currentState.typedText,
        wpm: currentState.wpm,
        accuracy: currentState.accuracy,
      },
      {
        onSettled: () => {
          endRoundMutation.mutate({ roundId: roundQuery.data!.id });
        },
      },
    );
  }, [roundQuery.data, playerMutation.data, endRoundMutation, saveProgressMutation, resetTyping, resetPlayers, joinMutation, trpc]);

  useEffect(() => {
    if (!showResults) return;

    const interval = setInterval(() => {
      setResultsCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [showResults]);

  useEffect(() => {
    if (showResults && resultsCountdown === 0) {
      startNextRound();
    }
  }, [showResults, resultsCountdown, startNextRound]);

  const { secondsLeft } = useRoundTimer({
    startTime: roundQuery.data?.startTime,
    duration: roundQuery.data?.duration,
    onTimeUp: handleTimeUp,
  });

  useEffect(() => {
    if (!user || playerMutation.data || playerMutation.isPending) return;
    playerMutation.mutate({ authId: user.id });
  }, [user]);

  useEffect(() => {
    if (
      showResults ||
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
  }, [roundQuery.data, playerMutation.data, showResults]);

  useEffect(() => {
    if (roundQuery.data && !showResults) {
      setSentence(roundQuery.data.sentence);
    }
  }, [roundQuery.data, setSentence, showResults]);

  useEffect(() => {
    if (!showResults) {
      broadcast(typedText, wpm, accuracy);
    }
  }, [typedText, wpm, accuracy, broadcast, showResults]);

  const isLoading = authLoading || roundQuery.isLoading || playerMutation.isPending;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Typing Race</h1>

      {isLoading && <Skeleton className="h-48 w-full" />}

      {playerMutation.data && (
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{playerMutation.data.name}</Badge>
          {playerStatsQuery.data && playerStatsQuery.data.roundsPlayed > 0 && (
            <span className="text-sm text-muted-foreground">
              Avg {playerStatsQuery.data.avgWpm} WPM · {Math.round(playerStatsQuery.data.avgAccuracy * 100)}% accuracy · {playerStatsQuery.data.roundsPlayed} rounds
            </span>
          )}
        </div>
      )}

      {showResults && (
        <RoundSummary
          players={resultPlayers}
          secondsUntilNext={resultsCountdown}
        />
      )}

      {!showResults && roundQuery.data && joinMutation.data && (
        <>
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Round</span>
                <div className="flex gap-2">
                  <TypingStats />
                  <RoundTimer secondsLeft={secondsLeft} />
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
