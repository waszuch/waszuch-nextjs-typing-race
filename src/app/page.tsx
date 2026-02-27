"use client";

import { Suspense } from "react";
import { useGame } from "@/hooks/use-game";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SentenceDisplay } from "@/components/sentence-display";
import { TypingInput } from "@/components/typing-input";
import { TypingStats } from "@/components/typing-stats";
import { PlayersTable } from "@/components/players-table";
import { RoundTimer } from "@/components/round-timer";
import { RoundSummary } from "@/components/round-summary";

export default function Home() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto mt-32 h-48 w-full max-w-3xl" />}>
      <GamePage />
    </Suspense>
  );
}

function GamePage() {
  const {
    isLoading,
    roundPhase,
    resultPlayers,
    resultsCountdown,
    roundData,
    playerData,
    playerStats,
    secondsLeft,
    isJoined,
  } = useGame();

  const showResults = roundPhase === "results";

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Typing Race</h1>

      {isLoading && <Skeleton className="h-48 w-full" />}

      {playerData && (
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{playerData.name}</Badge>
          {playerStats && playerStats.roundsPlayed > 0 && (
            <span className="text-sm text-muted-foreground">
              Avg {playerStats.avgWpm} WPM · {Math.round(playerStats.avgAccuracy * 100)}% accuracy ·{" "}
              {playerStats.roundsPlayed} rounds
            </span>
          )}
        </div>
      )}

      {showResults && (
        <RoundSummary players={resultPlayers} secondsUntilNext={resultsCountdown} />
      )}

      {!showResults && roundData && isJoined && (
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
