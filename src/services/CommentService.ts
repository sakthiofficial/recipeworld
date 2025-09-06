import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";

export class CommentService {
  async getComments(recipeId: string) {
    await connectDB();
    return Comment.find({ recipe: recipeId }).populate("user");
  }
  async addComment(recipeId: string, data: any) {
    await connectDB();
    return Comment.create({ ...data, recipe: recipeId });
  }
  async deleteComment(commentId: string) {
    await connectDB();
    return Comment.findByIdAndDelete(commentId);
  }
}
