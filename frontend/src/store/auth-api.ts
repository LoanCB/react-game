import { LoginCredentials, LoginToken } from "./../types/auth/login";
import { api } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginToken, LoginCredentials>({
      query: (body) => ({ url: "/login", body }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
