import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Comment"],
  endpoints: (builder) => ({
    getComments: builder.query<any[], string>({
      query: (recipeId) => `/comments?recipeId=${recipeId}`,
      providesTags: ["Comment"],
    }),
    addComment: builder.mutation<
      any,
      { recipeId: string; text: string; user: string }
    >({
      query: ({ recipeId, text, user }) => ({
        url: "/comments",
        method: "POST",
        body: { recipeId, text, user },
      }),
      invalidatesTags: ["Comment"],
    }),
    deleteComment: builder.mutation<any, string>({
      query: (commentId) => ({
        url: `/comments?id=${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comment"],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
