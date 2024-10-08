import { LoginCredentials, LoginToken } from "./../types/auth/login";
import { CreatedUser, RegisterCredentials } from "./../types/auth/register";
import { api } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginToken, LoginCredentials>({
      query: (body) => ({ url: "/login", body, method: "POST" }),
    }),
    register: builder.mutation<CreatedUser, RegisterCredentials>({
      query: (body) => ({ url: "/register", body, method: "POST" }),
    }),
    logout: builder.mutation<{ logout: boolean }, void>({
      query: () => ({ url: "/logout", method: "POST" }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
