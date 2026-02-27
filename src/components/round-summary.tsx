"use client";

import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlayerProgress } from "@/stores/players-store";

interface RoundSummaryProps {
  players: PlayerProgress[];
  secondsUntilNext: number;
}

export function RoundSummary({ players, secondsUntilNext }: RoundSummaryProps) {
  const ranked = [...players].sort((a, b) => b.wpm - a.wpm);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Round Results</span>
          <Badge variant="outline" className="tabular-nums">
            Next round in {secondsUntilNext}s
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ranked.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No players this round.
          </p>
        ) : (
          <div className="space-y-2">
            {ranked.map((player, i) => (
              <div
                key={player.playerId}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  i === 0 ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground w-6 text-center">
                    {i === 0 ? <Trophy className="h-5 w-5 text-yellow-500" /> : `${i + 1}`}
                  </span>
                  <span className="font-medium">{player.playerName}</span>
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary">{player.wpm} WPM</Badge>
                  <Badge variant="outline">
                    {Math.round(player.accuracy * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
