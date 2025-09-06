import mongoose, { Schema, Document } from "mongoose";

export interface IRecipe extends Document {
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
}

const RecipeSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    ingredients: [{ type: String }],
    steps: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String },
    likes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    cuisine: { type: String },
    difficulty: { type: String },
    cookingTime: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.models.Recipe ||
  mongoose.model<IRecipe>("Recipe", RecipeSchema);
