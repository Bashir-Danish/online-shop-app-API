import { Router } from "express";
import { catchAsync } from "../middleware.js";
import Price from "../models/priceModel.js";

const priceRouter = Router();

priceRouter.get(
  "/all",
  catchAsync(async (req, res) => {
    const price = await Price.find();

    res.status(200).send({ price });
  })
);

priceRouter.post(
  "/new",
  catchAsync(async (req, res) => {
    const newPrice = new Price({
      price: req.body.price,
    });
    await newPrice.save();
    res.status(200).send({ newPrice });
  })
);

export default priceRouter;
