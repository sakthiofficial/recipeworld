import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { AuthUtils } from "@/lib/authUtils";

export const baseApi = createApi({
  reducerPath: "baseApi",
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
  endpoints: () => ({}),
});
