import { connectDB } from "@/lib/db";
import Recipe, { IRecipe } from "@/models/Recipe";

export class RecipeService {
  async getRecipes(params?: any) {
    await connectDB();
    // Ensure User model is loaded for population
    await import("@/models/User");
    return Recipe.find(params || {}).populate("author", "name email avatar");
  }

  async getRecipesByAuthor(authorId: string) {
    await connectDB();
    // Ensure User model is loaded for population
    await import("@/models/User");
    return Recipe.find({ author: authorId }).populate(
      "author",
      "name email avatar"
    );
  }
  async createRecipe(data: any) {
    await connectDB();
    const recipe = await Recipe.create(data);
    return recipe.populate("author", "name email avatar");
  }
  async getRecipeById(id: string) {
    await connectDB();
    return Recipe.findById(id).populate("author", "name email avatar");
  }
  async updateRecipe(id: string, data: Partial<IRecipe>) {
    await connectDB();
    return Recipe.findByIdAndUpdate(id, data, { new: true }).populate(
      "author",
      "name email avatar"
    );
  }
  async deleteRecipe(id: string) {
    await connectDB();
    return Recipe.findByIdAndDelete(id);
  }

  async likeRecipe(id: string) {
    await connectDB();
    const recipe = await Recipe.findById(id);
    if (!recipe) throw new Error("Recipe not found");

    recipe.likes = (recipe.likes || 0) + 1;
    await recipe.save();
    return recipe.populate("author", "name email avatar");
  }

  async unlikeRecipe(id: string) {
    await connectDB();
    const recipe = await Recipe.findById(id);
    if (!recipe) throw new Error("Recipe not found");

    recipe.likes = Math.max((recipe.likes || 0) - 1, 0);
    await recipe.save();
    return recipe.populate("author", "name email avatar");
  }
}
