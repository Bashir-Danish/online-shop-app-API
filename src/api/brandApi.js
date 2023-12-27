import { Router } from "express";
import { catchAsync } from "../middleware.js";
import Brand from "../models/brandModel.js";

const brandRouter = Router();

brandRouter.get(
  "/all",
  catchAsync(async (req, res) => {
    const brands = await Brand.find();

    if (brands == 0) {
      res.status(404).send({ message: "Brands Not Found" });
    } else {
      res.status(200).send({ brands });
    }
  })
);
brandRouter.post(
  "/new",
  catchAsync(async (req, res) => {
    const newBrand = new Brand({
      brandName: req.body.brand,
    });
    await newBrand.save();
    res.status(200).send({ newBrand });
  })
);
// brandRouter.post(
//   "/new",
//   catchAsync(async (req, res) => {
//     const { many } = req.body;
//     const man = many.map((ma) => {
//       return { brandName: ma };
//     });
//     console.log(man);
//     await Brand.insertMany(man);
//     res.status(200).send({ success: true });
//   })
// );
export default brandRouter;
