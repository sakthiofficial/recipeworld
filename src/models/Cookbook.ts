import mongoose, { Schema, Document } from "mongoose";

export interface ICookbook extends Document {
  user: string;
  recipes: string[];
  name: string;
}

const CookbookSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Cookbook ||
  mongoose.model<ICookbook>("Cookbook", CookbookSchema);
