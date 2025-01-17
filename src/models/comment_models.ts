import mongoose from "mongoose";

export interface iComment {
  comment: string;
  postId: string;
  owner: string;
}

const commentsSchema = new mongoose.Schema<iComment>({
  comment: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    ref: "posts",
    required: true,
  },
  owner: {
    type: String,
    ref: "users",
    required: true,
  },
});

const commentsModel = mongoose.model<iComment>("comments", commentsSchema);

export default commentsModel;
