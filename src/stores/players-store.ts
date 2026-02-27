import { create } from "zustand";

export interface PlayerProgress {
  playerId: string;
  playerName: string;
  typedText: string;
  wpm: number;
  accuracy: number;
}

interface PlayersState {
  players: Record<string, PlayerProgress>;
  updatePlayer: (data: PlayerProgress) => void;
  reset: () => void;
}

export const usePlayersStore = create<PlayersState>((set) => ({
  players: {},

  updatePlayer: (data) =>
    set((state) => ({
      players: { ...state.players, [data.playerId]: data },
    })),

  reset: () => set({ players: {} }),
}));
