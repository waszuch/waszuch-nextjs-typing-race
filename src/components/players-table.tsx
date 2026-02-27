"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
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

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

function useTableParams() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortBy = (searchParams.get("sortBy") as SortKey) || "wpm";
  const sortDir = (searchParams.get("sortDir") as SortDir) || "desc";

  const setParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      params.set(k, v);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setParams({ sortDir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      setParams({ sortBy: key, sortDir: "desc" });
    }
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
  const { sortBy, sortDir, toggleSort } = useTableParams();
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(0);

  const sorted = useMemo(
    () => sortPlayers(Object.values(players), sortBy, sortDir),
    [players, sortBy, sortDir],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Waiting for players...
      </p>
    );
  }

  return (
    <div className="space-y-3">
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
          {paginated.map((player) => (
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

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Rows:</span>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <Button
              key={size}
              variant={pageSize === size ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-8 p-0"
              onClick={() => {
                setPageSize(size);
                setPage(0);
              }}
            >
              {size}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span>
            {safePage + 1} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={safePage === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
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
