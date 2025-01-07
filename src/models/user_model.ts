import mongoose from "mongoose";

export interface iUser {
  email: string;
  password: string;
  _id?: string;
  //refreshTokens?: string[]
}

const userSchema = new mongoose.Schema<iUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // refreshTokens
});

const userModel = mongoose.model<iUser>("users", userSchema);

export default userModel;
