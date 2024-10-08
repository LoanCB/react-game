import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "./store";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const user = (getState() as RootState).user;

    if (!user) return headers;

    headers.set("Authorization", `Bearer ${user.token}`);
    return headers;
  },
});

export const api = createApi({
  baseQuery: baseQuery,
  tagTypes: [],
  endpoints: () => ({}),
});
