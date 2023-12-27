import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { config } from "dotenv";
import { notFound, errorHandler } from "./middleware.js";
import connectDatabase from "./config/db.js";
import fileUpload from "express-fileupload";
import path from "path";
import bodyParser from "body-parser";
// import routers
import userRouter from "./api/userApi.js";
import brandRouter from "./api/brandApi.js";
import priceRouter from "./api/priceApi.js";
import categoryRouter from "./api/categoryApi.js";
import productRouter from "./api/productApi.js";
import Product from "./models/productModel.js";
import { mkdir } from "fs";

config();
connectDatabase();

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors("*"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(
  "/uploads",
  express.static(path.join(path.dirname(""), "./src/uploads/"))
);

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});
app.post("/api/v1/upload",async function (req, res, next) {
  let uploadPath = [];

  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }
    const files = req.files.file;
    console.log(files)
    for (let i = 0; i < files.length; i++) {
      mkdir(
        path.resolve(path.dirname("") + `/src/uploads/${req.body.id}`),
        function (err) {
          if (err) {
            if (err.code == "EEXIST") return null;
            else return err;
          } else return null;
        }
      );
      const file = files[i];
      let ext = file.name.split(".").filter(Boolean).slice(1).join(".");
      let filePath = path.resolve(
        path.dirname("") + `/src/uploads/${req.body.id}/img` + i + "." + ext
      );
      file.mv(filePath, function (err) {
        if (err) return res.status(500).send(err);
      });
      uploadPath.push(`/uploads/${req.body.id}/img` + i + "." + ext);
    }
    if (uploadPath) {
     await Product.findByIdAndUpdate(req.body.id, { img:uploadPath  })
    }
    res.json({
      message: "File uploaded!",
      uploadPath,
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/brands", brandRouter);
app.use("/api/v1/price", priceRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/product", productRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
