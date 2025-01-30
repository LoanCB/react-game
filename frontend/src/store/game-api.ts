import { IGame } from "./../types/game/game";
import { api } from "./api";

export const gameApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createGame: builder.mutation<IGame, string>({
      query: (userId) => ({ url: "/game", body: { userId }, method: "POST" }),
    }),
    gamesList: builder.query<IGame[], void>({
      query: () => "/game",
    }),
  }),
});

export const { useCreateGameMutation, useGamesListQuery } = gameApi;
