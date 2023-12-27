import { Router } from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Product from "../models/productModel.js";

import { catchAsync } from "../middleware.js";
import User from "../models/userModel.js";

const userRouter = Router();
userRouter.get('/',)

let savedCode = {};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER_NAME,
    pass: process.env.PASS,
  },
});

// ----- send Register code ----- //

userRouter.post(
  "/sendOtp",
  catchAsync(async (req, res) => {
    let email = req.body.email;
    const foundUser = await User.findOne({ email: req.body.email });
    if (foundUser) {
      return res.status(500).send({ message: "Email already exist!" });
    } else {
      let otp = "";
      for (let i = 0; i < 4; i++) {
        otp += parseInt(Math.floor(Math.random() * 10));
      }
      var options = {
        from: process.env.USER_NAME,
        to: `${email}`,
        subject: "Verification Code",
        html: `<p>Enter the otp: ${otp} to verify your email address</p>`,
      };
      transporter.sendMail(options, (error, info) => {
        if (error) {
          console.log(error);
          // res.status(500).send({error});
        } else {
          savedCode[email] = otp;
          setTimeout(() => {
            savedCode[req.body.email] = "";
            delete savedCode.email;
          }, 60000);
        }
      });
      res.status(200).send("Email sent");
    }
  })
);

// ----- verify the code ----- //

userRouter.post(
  "/verify",
  catchAsync((req, res) => {
    const { code, email } = req.body;
    // console.log(savedCode[email]);
    // console.log(code);
    if (savedCode[email] == code) {
      res.status(200).send("Verified");
    } else {
      res.status(500).send("Invalid OTP");
    }
  })
);

// ----- verify the uses token ----- //

userRouter.get(
  "/auth",
  catchAsync(async (req, res) => {
    if (req.headers.authorization) {
      const { userId } = jwt.verify(
        req.headers.authorization,
        process.env.SECRET
      );
      let user = await User.findById(userId).populate(
        "wishList",
        "name price img"
      );
      if (!user) {
        res.status(404).send({ message: "User Not Found" });
      } else {
        if (jwt.verify(req.headers.authorization, process.env.SECRET)) {
          user = { ...user }._doc;
          delete user.password;
          return res.status(200).send({ message: "auth", user });
        }
      }
    } else {
      return res.status(401).send({ message: "unAuthorization" });
    }
  })
);
// ----- Register ----- //

userRouter.post(
  "/register",
  catchAsync(async (req, res) => {
    const { name, lastName, email, phone, address, password } = req.body;

    const newUser = new User({
      username: name,
      lastName: lastName,
      email: email,
      phone: phone,
      address: address,
      password: bcrypt.hashSync(password),
    });
    const userData = await newUser.save();

    let token = jwt.sign({ userId: newUser._id }, process.env.SECRET, {
      expiresIn: 60,
    });
    let user = { ...userData }._doc;
    delete newUser.password;
    res.status(201).json({
      user,
      token,
    });
  })
);

// ----- send login code ----- //

userRouter.post(
  "/loginOtp",
  catchAsync(async (req, res) => {
    let email = req.body.email;
    const foundUser = await User.findOne({
      email: req.body.email.toLowerCase(),
    });
    if (!foundUser) {
      return res
        .status(500)
        .send({ message: "You haven't already registered" });
    } else {
      let otp = "";
      for (let i = 0; i < 4; i++) {
        otp += parseInt(Math.floor(Math.random() * 10));
      }
      var options = {
        from: process.env.USER_NAME,
        to: `${email}`,
        subject: "Verification Code",
        html: `<p>Enter the otp: ${otp} to verify your email address</p>`,
      };
      transporter.sendMail(options, (error, info) => {
        if (error) {
          res.status(500).send(error);
        } else {
          savedCode[email] = otp;
          setTimeout(() => {
            savedCode[req.body.email] = "";
            delete savedCode.email;
          }, 60000);
        }
      });
      res.status(200).send("Email sent");
    }
  })
);

// ----- Login ----- //

userRouter.post(
  "/login",
  catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).send({ message: "User Not Found" });
    } else {
      const isMatch = bcrypt.compareSync(password, user.password);
      if (isMatch) {
        let token = jwt.sign({ userId: user._id }, process.env.SECRET, {
          expiresIn: 86400,
        });
        let newUser = { ...user }._doc;
        delete newUser.password;
        res.status(200).send({
          user,
          token,
        });
      } else {
        res.status(400).send({
          msg: "password isn't correct",
        });
      }
    }
  })
);

// ----- send login code ----- //

// userRouter.post(
//   "/loginOtp",
//   catchAsync(async (req, res) => {
//     let email = req.body.email;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).send({ message: "You haven't registered before" });
//     } else {
//       let otp = "";
//       for (let i = 0; i < 6; i++) {
//         otp += Math.floor(Math.random() * 10);
//       }
//       var options = {
//         from: process.env.USER_NAME,
//         to: `${email}`,
//         subject: "Reset Password OTP",
//         html: `<p>Enter the otp: ${otp} to verify your email address</p>`,
//       };
//       transporter.sendMail(options, function (error, info) {
//         if (error) {
//           res.status(500).send(error);
//         } else {
//           savedCode[email] = otp;

//           setTimeout(() => {
//             savedCode[req.body.email] = "";
//           }, 60000);

//           res.send("Email sent: " + info.response);
//         }
//       });
//     }
//   })
// );

// ----- Reset Password ----- //

userRouter.post(
  "/resetPass",
  catchAsync(async (req, res) => {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (!user)
      return res.status(200).send({
        message: "your password has been reset successfully",
      });

    user.password = bcrypt.hashSync(password);
    await user.save();

    res.status(200).send({
      message: "your password has been reset successfully",
    });
  })
);

// ----- Change Password ----- //

userRouter.post(
  "/changePass",
  catchAsync(async (req, res) => {
    const { id, currentPass, newPass } = req.body;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).send({ message: "User Not Found" });
    } else {
      const isMatch = bcrypt.compareSync(currentPass, user.password);
      if (isMatch) {
        user.password = bcrypt.hashSync(newPass);
        await user.save();
        res.status(200).send({
          message: "your password has been changed successfully",
        });
      } else {
        res.status(400).send({
          message: "Current password isn't correct",
        });
      }
    }
  })
);

// ----- Get all user ----- //

userRouter.get(
  "/all",
  catchAsync(async (req, res) => {
    const users = await User.find();

    if (users == 0) {
      res.status(404).send({ message: "Users Not Found" });
    } else {
      res.status(200).send({ users });
    }
  })
);

// ----- add to wishlist ----- //

userRouter.post(
  "/addToWish",
  catchAsync(async (req, res) => {
    const { id, wishlist } = req.body;
    let user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "user doesn't exist",
      });
    }
    user.wishList = wishlist;
    user.save();

    res.status(200).json({
      success: true,
      // message: "Wishlist has been updated to -->",
      // list: user.wishList,
    });
  })
);
userRouter.post(
  "/wishlist",
  catchAsync(async (req, res) => {
    const { wishlist } = req.body;
    console.log(wishlist);
    let products = await Product.find().select({
      brand: 0,
      category: 0,
      subCategory: 0,
      Specifications: 0,
    });
    products = products.filter((el) => {
      return wishlist.includes(el._id.toString());
    });
    res.status(200).json({
      success: true,
      products: products,
      // message: "Wishlist has been updated to -->",
      // list: user.wishList,
    });
  })
);
export default userRouter;
