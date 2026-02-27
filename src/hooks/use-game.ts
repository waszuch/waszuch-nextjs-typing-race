"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { useTRPC } from "@/lib/trpc/client";
import { useTypingStore } from "@/stores/typing-store";
import { usePlayersStore, type PlayerProgress } from "@/stores/players-store";
import { useRealtimeRound } from "./use-realtime-round";
import { useRoundTimer } from "./use-round-timer";

const RESULTS_DURATION = 8;

type RoundPhase = "playing" | "saving" | "results";

export function useGame() {
  const { user, isLoading: authLoading } = useAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const setSentence = useTypingStore((s) => s.setSentence);
  const resetTyping = useTypingStore((s) => s.reset);
  const typedText = useTypingStore((s) => s.typedText);
  const wpm = useTypingStore((s) => s.wpm);
  const accuracy = useTypingStore((s) => s.accuracy);
  const resetPlayers = usePlayersStore((s) => s.reset);

  const [roundPhase, setRoundPhase] = useState<RoundPhase>("playing");
  const [resultPlayers, setResultPlayers] = useState<PlayerProgress[]>([]);
  const [resultsCountdown, setResultsCountdown] = useState(RESULTS_DURATION);
  const [joinedRoundId, setJoinedRoundId] = useState<string | null>(null);

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

  const { broadcast } = useRealtimeRound({
    roundId: roundQuery.data?.id,
    playerId: playerMutation.data?.id,
    playerName: playerMutation.data?.name,
  });

  const handleRoundTransition = useCallback(() => {
    setRoundPhase("playing");
    setJoinedRoundId(null);
    resetTyping();
    resetPlayers();
    queryClient.invalidateQueries({ queryKey: trpc.round.getActive.queryKey() });
    if (playerMutation.data) {
      queryClient.invalidateQueries({
        queryKey: trpc.player.getStats.queryKey({ playerId: playerMutation.data.id }),
      });
    }
  }, [resetTyping, resetPlayers, queryClient, trpc, playerMutation.data]);

  const handleTimeUp = useCallback(() => {
    if (!roundQuery.data || !playerMutation.data || roundPhase !== "playing") return;
    setRoundPhase("saving");

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
            setJoinedRoundId(null);
            setRoundPhase("playing");
            queryClient.invalidateQueries({ queryKey: trpc.round.getActive.queryKey() });
          },
          onError: () => {
            setRoundPhase("playing");
          },
        },
      );
      return;
    }

    setResultPlayers(finalPlayers);
    setResultsCountdown(RESULTS_DURATION);
    setRoundPhase("results");

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
  }, [
    roundPhase,
    roundQuery.data,
    playerMutation.data,
    endRoundMutation,
    saveProgressMutation,
    resetTyping,
    resetPlayers,
    queryClient,
    trpc,
  ]);

  const { secondsLeft } = useRoundTimer({
    startTime: roundQuery.data?.startTime,
    duration: roundQuery.data?.duration,
    onTimeUp: handleTimeUp,
  });

  useEffect(() => {
    if (roundPhase !== "results") return;
    const interval = setInterval(() => {
      setResultsCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [roundPhase]);

  useEffect(() => {
    if (roundPhase === "results" && resultsCountdown === 0) {
      handleRoundTransition();
    }
  }, [roundPhase, resultsCountdown, handleRoundTransition]);

  useEffect(() => {
    if (!user || playerMutation.data || playerMutation.isPending) return;
    playerMutation.mutate();
  }, [user, playerMutation.data, playerMutation.isPending, playerMutation.mutate]);

  useEffect(() => {
    const roundId = roundQuery.data?.id;
    const playerId = playerMutation.data?.id;
    if (!roundId || !playerId || roundPhase !== "playing") return;
    if (joinedRoundId === roundId || joinMutation.isPending) return;
    joinMutation.mutate(
      { roundId, playerId },
      { onSuccess: () => setJoinedRoundId(roundId) },
    );
  }, [
    roundQuery.data?.id,
    playerMutation.data?.id,
    roundPhase,
    joinedRoundId,
    joinMutation.isPending,
    joinMutation.mutate,
  ]);

  useEffect(() => {
    if (roundQuery.data && roundPhase === "playing") {
      setSentence(roundQuery.data.sentence);
    }
  }, [roundQuery.data, setSentence, roundPhase]);

  useEffect(() => {
    if (roundPhase === "playing") {
      broadcast(typedText, wpm, accuracy);
    }
  }, [typedText, wpm, accuracy, broadcast, roundPhase]);

  return {
    isLoading: authLoading || roundQuery.isLoading || playerMutation.isPending,
    roundPhase,
    resultPlayers,
    resultsCountdown,
    roundData: roundQuery.data,
    playerData: playerMutation.data,
    playerStats: playerStatsQuery.data,
    secondsLeft,
    isJoined: joinedRoundId === roundQuery.data?.id,
  };
}
