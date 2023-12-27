import { Schema, model } from "mongoose";

const brandSchema = new Schema({
  brandName: {
    type: String,
    unique: true
  },
});

export default model("brands", brandSchema);
