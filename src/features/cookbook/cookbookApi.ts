import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const cookbookApi = createApi({
  reducerPath: "cookbookApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({
    getCookbooks: builder.query<any, string>({
      query: (userId) => `/cookbook?userId=${userId}`,
    }),
    addRecipeToCookbook: builder.mutation<
      any,
      { cookbookId: string; recipeId: string }
    >({
      query: ({ cookbookId, recipeId }) => ({
        url: "/cookbook",
        method: "POST",
        body: { cookbookId, recipeId },
      }),
    }),
    // Add more endpoints as needed
  }),
});

export const { useGetCookbooksQuery, useAddRecipeToCookbookMutation } =
  cookbookApi;
