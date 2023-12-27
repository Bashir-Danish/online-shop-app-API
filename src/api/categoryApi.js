import { Router } from "express";
import { catchAsync } from "../middleware.js";
import Category from "../models/categoryModel.js";

const categoriesRouter = Router();

categoriesRouter.get(
  "/all",
  catchAsync(async (req, res) => {
    const category = await Category.find();
    res.status(200).send({ category });
  })
);

categoriesRouter.post(
  "/new",
  catchAsync(async (req, res) => {
    let { category, parent } = req.body;
    parent = parent.map((obj) => {
      return {
        name: obj,
      };
    });
    const newCat = new Category({
      category: category,
      parent: parent,
    });
    await newCat.save();
    res.status(200).send({ newCat });
  })
);

export default categoriesRouter;
