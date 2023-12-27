import { Schema, model } from "mongoose";

const priceSchema = new Schema({
  price: {
    type: Number,
    unique: true,
  },
});

export default model("prices", priceSchema);
