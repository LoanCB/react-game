import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { goToLogin } from "@src/config/navigation";
import { RootState } from "./store";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const user = (getState() as RootState).user;

    if (user?.token) {
      headers.set("Authorization", `Bearer ${user.token}`);
    }

    return headers;
  },
});

const logoutErrorCodes = ["FST_JWT_AUTHORIZATION_TOKEN_EXPIRED"];
interface ApiError {
  statusCode: number;
  code: string;
  error: string;
  message: string;
}

const baseQueryWithCatchErrors: typeof baseQuery = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error?.data) {
    const errorData = result.error.data as ApiError;

    if (logoutErrorCodes.includes(errorData.code)) {
      localStorage.removeItem("user");
      goToLogin();
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithCatchErrors,
  tagTypes: [],
  endpoints: () => ({}),
});
