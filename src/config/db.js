import mongoose from "mongoose";
import { config } from "dotenv";
config();

const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log("Connected to DB");
    });
};
mongoose.set("strictQuery", false);

export default connectDatabase;
