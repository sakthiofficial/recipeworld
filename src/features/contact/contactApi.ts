import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AuthUtils } from "@/lib/authUtils";

export const contactApi = createApi({
  reducerPath: "contactApi",
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
  tagTypes: ["Contact"],
  endpoints: (builder) => ({
    submitContact: builder.mutation<any, any>({
      query: (data) => ({
        url: "/contact",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
});

export const { useSubmitContactMutation } = contactApi;
