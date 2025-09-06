import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AuthUtils } from "@/lib/authUtils";

export const recipeApi = createApi({
  reducerPath: "recipeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");

      // Add authentication token if available
      const token = AuthUtils.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Recipe"],
  endpoints: (builder) => ({
    getRecipes: builder.query<any[], void>({
      query: () => "/recipes",
      providesTags: ["Recipe"],
    }),
    getRecipeById: builder.query<any, string>({
      query: (id) => `/recipes?id=${id}`,
      providesTags: (result, error, id) => [{ type: "Recipe", id }],
    }),
    createRecipe: builder.mutation<any, any>({
      query: (data) => ({
        url: "/recipes",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Recipe"],
    }),
    updateRecipe: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/recipes?id=${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Recipe", id }],
    }),
    deleteRecipe: builder.mutation<any, string>({
      query: (id) => ({
        url: `/recipes?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Recipe"],
    }),
  }),
});

export const {
  useGetRecipesQuery,
  useGetRecipeByIdQuery,
  useCreateRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
} = recipeApi;
