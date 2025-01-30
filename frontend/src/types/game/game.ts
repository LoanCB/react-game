export enum GameState {
  PENDING = "pending",
  PLAYING = "playing",
  FINISHED = "finished",
}

export interface IGame {
  id: string;
  state: GameState;
  creatorId: string;
  winnerId: string;
  private: boolean;
  currentBet: number;
  createdAt: string;
  updatedAt: string;
}
