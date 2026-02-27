"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePlayersStore, type PlayerProgress } from "@/stores/players-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeRoundOptions {
  roundId: string | undefined;
  playerId: string | undefined;
  playerName: string | undefined;
}

export function useRealtimeRound({
  roundId,
  playerId,
  playerName,
}: UseRealtimeRoundOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const updatePlayer = usePlayersStore((s) => s.updatePlayer);
  const resetPlayers = usePlayersStore((s) => s.reset);

  useEffect(() => {
    if (!roundId) return;

    const supabase = createClient();
    const channel = supabase.channel(`round:${roundId}`, {
      config: { broadcast: { self: true } },
    });

    channel
      .on("broadcast", { event: "progress" }, ({ payload }) => {
        updatePlayer(payload as PlayerProgress);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channelRef.current = channel;
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
      resetPlayers();
    };
  }, [roundId, updatePlayer, resetPlayers]);

  const broadcast = useCallback(
    (typedText: string, wpm: number, accuracy: number) => {
      if (!channelRef.current || !playerId || !playerName) return;

      channelRef.current.send({
        type: "broadcast",
        event: "progress",
        payload: { playerId, playerName, typedText, wpm, accuracy },
      });
    },
    [playerId, playerName],
  );

  return { broadcast };
}
