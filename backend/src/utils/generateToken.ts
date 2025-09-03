import { Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel";
// import dotenv

const generateToken = async (res: Response, userId: string) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("Please define 'JWT_SECRET' environment variable in .env");
  }
  const token = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: process.env.NODE_ENV === "production" ? "60d" : "1d",
  });
  console.log("generating token");

  const user = await UserModel.findById(userId);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge:
      process.env.NODE_ENV === "production"
        ? 24 * 60 * 60 * 1000 * 60
        : 24 * 60 * 60 * 1000,
    // maxAge: 1000 * 10,
  });

  res.cookie("userInfo", user, {
    httpOnly: false,
    secure: false,
    sameSite: "strict",
    maxAge:
      process.env.NODE_ENV === "production"
        ? 24 * 60 * 60 * 1000 * 60
        : 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
