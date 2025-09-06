import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  endpoints: (builder) => ({
    getReportedContent: builder.query<any, void>({
      query: () => "/admin",
    }),
    featureRecipe: builder.mutation<any, string>({
      query: (recipeId) => ({
        url: "/admin",
        method: "POST",
        body: { recipeId },
      }),
    }),
    // Add more endpoints as needed
  }),
});

export const { useGetReportedContentQuery, useFeatureRecipeMutation } =
  adminApi;
