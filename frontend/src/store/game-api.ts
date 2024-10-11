import { api } from "./api";

export const gameApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createGame: builder.mutation<{ gameId: number }, string>({
      query: (userId) => ({ url: "/game", body: { userId }, method: "POST" }),
    }),
  }),
});

export const { useCreateGameMutation } = gameApi;
