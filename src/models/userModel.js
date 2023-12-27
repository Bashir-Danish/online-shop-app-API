import { mongoose, Schema, model } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
  },
  coverImg: {
    type: String,
    default: "/uploads/users/coverImg.jpg",
  },
  profile: {
    type: String,
    default: "/uploads/users/user.webp",
  },
  wishList: [],
  address: {
    type: String,
  },
  password: {
    type: String,
  },
});

export default model("users", userSchema);
