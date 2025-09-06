import { configureStore } from "@reduxjs/toolkit";
import { recipeApi } from "@/features/recipes/recipeApi";
import { authApi } from "@/features/auth/authApi";
import { cookbookApi } from "@/features/cookbook/cookbookApi";
import { commentApi } from "@/features/comments/commentApi";
import { userApi } from "@/features/users/userApi";
import { adminApi } from "@/features/admin/adminApi";
import { contactApi } from "@/features/contact/contactApi";
import recipeReducer from "@/features/recipes/recipeSlice";
import authReducer from "@/features/auth/authSlice";

export const store = configureStore({
  reducer: {
    [recipeApi.reducerPath]: recipeApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [cookbookApi.reducerPath]: cookbookApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    recipes: recipeReducer,
    auth: authReducer,
    // ...add slices here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      recipeApi.middleware,
      authApi.middleware,
      cookbookApi.middleware,
      commentApi.middleware,
      userApi.middleware,
      adminApi.middleware,
      contactApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
