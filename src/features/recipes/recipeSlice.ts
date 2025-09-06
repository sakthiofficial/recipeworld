import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Client-side recipe type (without Mongoose Document complexity)
export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  author: string;
  image?: string;
  likes: number;
  comments: string[];
  cuisine?: string;
  difficulty?: string;
  cookingTime?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface RecipeState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
}

const initialState: RecipeState = {
  recipes: [],
  loading: false,
  error: null,
};

export const recipeSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    setRecipes(state, action: PayloadAction<Recipe[]>) {
      state.recipes = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setRecipes, setLoading, setError } = recipeSlice.actions;
export default recipeSlice.reducer;
