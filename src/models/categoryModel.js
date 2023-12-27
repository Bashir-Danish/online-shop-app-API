import { Schema, model } from "mongoose";

const categorySchema = new Schema({
  category: {
    type: String,
    unique: true,
  },
  parent: {
    type: [
      {
        name:String
      }
    ]
  },
  open: {
    type: Boolean,
    default:false
  }
});

export default model("categories", categorySchema);
