import { connectDB } from "@/lib/db";
import Recipe from "@/models/Recipe";

export class AdminService {
  async getReportedContent() {
    await connectDB();
    return Recipe.find({ reported: true });
  }
  async featureRecipe(recipeId: string) {
    await connectDB();
    return Recipe.findByIdAndUpdate(
      recipeId,
      { featured: true },
      { new: true }
    );
  }
  async removeReportedContent(contentId: string) {
    await connectDB();
    return Recipe.findByIdAndDelete(contentId);
  }
}
