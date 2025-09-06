import { connectDB } from "@/lib/db";
import Cookbook from "@/models/Cookbook";

export class CookbookService {
  async getCookbooks(userId: string) {
    await connectDB();
    return Cookbook.find({ user: userId }).populate("recipes");
  }
  async addRecipeToCookbook(cookbookId: string, recipeId: string) {
    await connectDB();
    return Cookbook.findByIdAndUpdate(
      cookbookId,
      { $addToSet: { recipes: recipeId } },
      { new: true }
    ).populate("recipes");
  }
  async removeRecipeFromCookbook(cookbookId: string, recipeId: string) {
    await connectDB();
    return Cookbook.findByIdAndUpdate(
      cookbookId,
      { $pull: { recipes: recipeId } },
      { new: true }
    ).populate("recipes");
  }
}
