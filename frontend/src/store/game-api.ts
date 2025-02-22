import { GameStats, IGame } from "../types/game/game";
import { api } from "./api";

export const gameApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createGame: builder.mutation<IGame, string>({
      query: (userId) => ({ url: "/game", body: { userId }, method: "POST" }),
    }),
    gamesList: builder.query<IGame[], void>({
      query: () => "/game",
    }),
    gameStats: builder.query<GameStats, string>({
      query: (userId) => ({
        url: "/game/stats",
        params: { userId },
      }),
    }),
  }),
});

export const { useCreateGameMutation, useGamesListQuery, useGameStatsQuery } =
  gameApi;
