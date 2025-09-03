import jwt, { JwtPayload } from "jsonwebtoken";
import UserModel from "../models/userModel";
import { Request, Response, NextFunction } from "express";
import User from "../models/userModel/User";
import logger from "../logging/logger";
import Subscription from "../models/subscriptionModel/Subscription";
import expressAsyncHandler from "express-async-handler";

interface UserMetaJwtPayload extends JwtPayload {
  id: string;
}

export interface AuthenticatedRequest extends Request<any> {
  user?: User;
}

const protect = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;
    token = req.cookies.jwt;

    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    try {
      let JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        throw new Error("Please add 'JWT_SECRET' variable in your .env file");
      }
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as UserMetaJwtPayload;
          req.user = (await UserModel.findById(decoded.id)
            .select("-password")
            .populate({
              path: "subscription",
              strictPopulate: false,
              populate: {
                path: "plan",
                strictPopulate: false,
              },
            })) as User;

          if (!req.user) {
            res.status(404);
            throw new Error("User not found");
          }
          next();
        } catch (error) {
          res.status(401);
          throw new Error("Not Authorized, token failed");
        }
      } else {
        res.status(401);
        throw new Error("Not Authorized, no token");
      }
    } catch (err) {
      // console.log("Error: ", err);
      // throw err;
      // res.send(err);
      res.status(401);
      throw err;
    }
  }
);

const admin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user?.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not Authorized as an Admin");
  }
};

const subscriptionActive = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.isAdmin) {
    next();
    return;
  }

  const subscription = req.user?.subscription as Subscription | undefined;

  if (!subscription || !subscription.endDate) {
    res.status(403);
    throw new Error("Your Subscription has Ended.");
  }

  if (subscription.status === "pending") {
    res.status(403);
    throw new Error("Your Subscription will be approved soon");
  }

  if (subscription.status === "rejected") {
    res.status(403);
    throw new Error(
      "Your Subscription is rejected please contact admin to resolve"
    );
  }

  if (new Date(subscription.endDate.toString()) < new Date()) {
    res.status(403);
    throw new Error("Your Subscription has Ended.");
  }
  next();
};

export { protect, admin, subscriptionActive };
