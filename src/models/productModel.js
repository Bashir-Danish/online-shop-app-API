import { model, Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    img: {
      type: [],
    },
    brand: {
      type: String,
    },
    category: {
      type: String,
    },
    subCategory: {
      type: String,
    },
    Specifications: {
      type: [
        {
          name: { type: String },
          value: { type: String },
        },
      ],
    },
  },
  { timestamps: true }
);
export default model("products", productSchema);
