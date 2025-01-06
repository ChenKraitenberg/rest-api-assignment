import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for the Comment document
export interface IComment extends Document {
  postId: mongoose.Types.ObjectId; // Reference to the Post model
  content: string; // Comment content
  author?: string; // Comment author (optional)
  createdAt?: Date; // Date when the comment was created
}

// Schema definition
const commentSchema: Schema<IComment> = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true }, // Reference to Post model
  content: { type: String, required: true }, // Comment content
  author: { type: String }, // Comment author
  createdAt: { type: Date, default: Date.now }, // Default to current date
});

// Create model
const Comments: Model<IComment> = mongoose.model<IComment>(
  "Comments",
  commentSchema
);

export default Comments;
