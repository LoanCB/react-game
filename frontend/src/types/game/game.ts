export enum GameState {
  PENDING = "pending",
  PLAYING = "playing",
  FINISHED = "finished",
}

export interface IGame {
  id: string;
  winnerScore: number;
  state: GameState;
  creatorId: string;
  winnerId: string;
  private: boolean;
}
