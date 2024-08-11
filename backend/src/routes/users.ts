//to create new user this route made

import express, { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { check, validationResult } from "express-validator";
import verifyToken from "../middleware/auth";

const router = express.Router();
//route to get the curr logged in user, we dont need to know the id of the curr logged in user and we check userid from cookie
router.get("/me", verifyToken, async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select("-password"); //for security purpose we only get userid, not password
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

router.post(
  "/register",
  //this is middleware which first checks for "firstName" if exists else returns "First Name is required", also checks for isstring
  //we check for conditions here only as if we get error lets resolve here only before  creating token/.. as they are expensive
  [
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString(),
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
      min: 6,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    try {
      let user = await User.findOne({
        email: req.body.email,
      });

      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      user = new User(req.body);
      await user.save();
      
      //code to create the token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d",
        }
      );

      res.cookie("auth_token", token, {
        httpOnly: true, //can only be accessed on the server
        secure: process.env.NODE_ENV === "production", //only accept cookies over https(use this in production), but for dev as localhost not have setup thus use current line, if we in production this returns true=> secure, else not secure
        maxAge: 86400000, //save as authtoken expires in(unit is ms)
      });
      return res.status(200).send({ message: "User registered OK" });
    } catch (error) { 
      console.log(error);
      res.status(500).send({ message: "Something went wrong" }); //this error usually occurs from mongo, or when some keys are exposed
    }
  }
);

export default router;
