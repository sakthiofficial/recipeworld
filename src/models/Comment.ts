import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  user: string;
  recipe: string;
  text: string;
  likes: number;
}

const CommentSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipe: { type: Schema.Types.ObjectId, ref: "Recipe", required: true },
    text: { type: String, required: true },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", CommentSchema);
