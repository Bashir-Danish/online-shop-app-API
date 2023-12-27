import { Router } from "express";
import { catchAsync } from "../middleware.js";
import fs from "fs";
import path from "path";
import Product from "../models/productModel.js";
import mongoose from "mongoose";
const productRouter = Router();

productRouter.get(
  "/match/:category",
  catchAsync(async (req, res) => {
    let products = await Product.find({ category: req.params.category });
    if (products.length > 1) {
      res.status(200).json({
        success: true,
        products,
      });
    } else {
      res.status(404).json({ message: "Product not Found" });
    }
  })
);
productRouter.get(
  "/match/:category",
  catchAsync(async (req, res) => {
    let products = await Product.find({ category: req.params.category });
    if (products.length > 1) {
      res.status(200).json({
        success: true,
        products,
      });
    } else {
      res.status(404).json({ message: "Product not Found" });
    }
  })
);
productRouter.get(
  "/all",
  catchAsync(async (req, res) => {
    let products;
    let filter = {};
    let sort = {};
    // filter
    if (req.query.category) filter.category = req.query.category;
    if (req.query.subcategory) filter.subCategory = req.query.subcategory;
    if (req.query.brand) filter.brand = req.query.brand;
    if (req.query.price) filter.price = { $lt: parseInt(req.query.price) };
    if (req.query.name) filter.name = req.query.name;
    // sort
    if (req.query.sort) {
      if (req.query.sort == "newest") sort = { createdAt: -1 };
      if (req.query.sort == "high") sort = { price: -1 };
      if (req.query.sort == "low") sort = { price: 1 };
    }
    let offset = 0;
    let count = await Product.find(filter).sort(sort).count();
    if (count > 24) {
      offset = parseInt(req.query.offset);
    }
    products = await Product.find(filter)
      .sort(sort)
      .skip(offset * 24)
      .limit(24);
    res.status(200).json({
      success: true,
      products,
      count,
    });
  })
);
productRouter.get(
  "/search/:name",
  catchAsync(async (req, res) => {
    let products = await Product.find({
      name: new RegExp(req.params.name, "gi"),
    }).exec();

    if (products.length) {
      res.status(200).json({
        success: true,
        products,
      });
    } else {
      res.status(404).json({ message: "Product not Found" });
    }
  })
);

productRouter.post(
  "/new",
  catchAsync(async (req, res) => {
    let { name, price, brand, category, subCategory, Specifications } =
      req.body;
    Specifications = Specifications.map((obj, i) => {
      return {
        name: obj[0],
        value: obj[1],
      };
    });
    let id = new mongoose.Types.ObjectId().toHexString();
    let product = await Product.create({
      _id: id,
      name,
      brand,
      price,
      category,
      subCategory,
      Specifications,
    });
    res.status(201).json({
      success: true,
      product,
    });
  })
);

productRouter.get(
  "/:id",
  catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product == 0) {
      res.status(404).send({ message: "Product Not Found" });
    } else {
      res.status(200).send({ product });
    }
  })
);
productRouter.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    const dir = path.resolve(
      path.dirname("") + `/src/uploads/${req.params.id}`
    );
    if (product) {
      fs.rm(dir, { recursive: true }, (err) => {
        if (err) {
          throw err;
        }
        console.log(`${dir} is deleted!`);
      });
      res.status(200).send({ product });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

export default productRouter;
