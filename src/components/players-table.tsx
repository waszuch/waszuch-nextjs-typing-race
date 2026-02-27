"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { usePlayersStore, type PlayerProgress } from "@/stores/players-store";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortKey = "playerName" | "wpm" | "accuracy";
type SortDir = "asc" | "desc";

function useSortParams() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortBy = (searchParams.get("sortBy") as SortKey) || "wpm";
  const sortDir = (searchParams.get("sortDir") as SortDir) || "desc";

  const toggleSort = (key: SortKey) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortBy === key) {
      params.set("sortDir", sortDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", key);
      params.set("sortDir", "desc");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return { sortBy, sortDir, toggleSort };
}

function sortPlayers(
  players: PlayerProgress[],
  sortBy: SortKey,
  sortDir: SortDir,
): PlayerProgress[] {
  return [...players].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortDir === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });
}

export function PlayersTable() {
  const players = usePlayersStore((s) => s.players);
  const { sortBy, sortDir, toggleSort } = useSortParams();

  const sorted = useMemo(
    () => sortPlayers(Object.values(players), sortBy, sortDir),
    [players, sortBy, sortDir],
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Waiting for players...
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Live progress</TableHead>
          <TableHead>
            <SortButton
              label="Player"
              active={sortBy === "playerName"}
              dir={sortDir}
              onClick={() => toggleSort("playerName")}
            />
          </TableHead>
          <TableHead>
            <SortButton
              label="WPM"
              active={sortBy === "wpm"}
              dir={sortDir}
              onClick={() => toggleSort("wpm")}
            />
          </TableHead>
          <TableHead>
            <SortButton
              label="Accuracy"
              active={sortBy === "accuracy"}
              dir={sortDir}
              onClick={() => toggleSort("accuracy")}
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((player) => (
          <TableRow key={player.playerId}>
            <TableCell className="max-w-[200px] truncate font-mono text-xs">
              {player.typedText || "—"}
            </TableCell>
            <TableCell className="font-medium">{player.playerName}</TableCell>
            <TableCell>{player.wpm}</TableCell>
            <TableCell>{Math.round(player.accuracy * 100)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={onClick}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
      {active && (
        <span className="ml-1 text-xs text-muted-foreground">
          {dir === "asc" ? "↑" : "↓"}
        </span>
      )}
    </Button>
  );
}
