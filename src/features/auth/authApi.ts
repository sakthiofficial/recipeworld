import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface AuthResponse {
  success: boolean;
  message: string;
  code?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  token?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    credentials: "include", // Include cookies in requests
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (data) => ({
        url: "/auth",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (data) => ({
        url: "/auth",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "/auth",
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    getCurrentUser: builder.query<AuthResponse, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
      // Reduce cache time for more responsive auth state
      keepUnusedDataFor: 5, // 5 seconds instead of default 60
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authApi;
