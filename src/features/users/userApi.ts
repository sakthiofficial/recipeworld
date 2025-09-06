import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUser: builder.query<any, string>({
      query: (userId) => `/users?userId=${userId}`,
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),
    followUser: builder.mutation<any, { userId: string; targetId: string }>({
      query: ({ userId, targetId }) => ({
        url: "/users/follow",
        method: "POST",
        body: { userId, targetId },
      }),
      invalidatesTags: ["User"],
    }),
    unfollowUser: builder.mutation<any, { userId: string; targetId: string }>({
      query: ({ userId, targetId }) => ({
        url: "/users/unfollow",
        method: "POST",
        body: { userId, targetId },
      }),
      invalidatesTags: ["User"],
    }),
    getFollowers: builder.query<any[], string>({
      query: (userId) => `/users/followers?userId=${userId}`,
    }),
    getFollowing: builder.query<any[], string>({
      query: (userId) => `/users/following?userId=${userId}`,
    }),
  }),
});

export const {
  useGetUserQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
} = userApi;
