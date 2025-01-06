import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for the Post document
export interface IPost extends Document {
  title: string; // Title of the post
  content: string; // Content of the post
  owner: string; // Owner of the post
}

// Schema definition
const postSchema: Schema<IPost> = new mongoose.Schema({
  title: { type: String, required: true }, // Title of the post
  content: { type: String, required: true }, // Content of the post
  owner: { type: String, required: true }, // Owner of the post
});

// Create model
const Posts: Model<IPost> = mongoose.model<IPost>("Posts", postSchema);

export default Posts;
