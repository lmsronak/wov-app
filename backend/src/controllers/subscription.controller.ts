import { Request, Response } from "express";
import SubscriptionModel from "../models/subscriptionModel";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { Types } from "mongoose";
import UserModel from "../models/userModel";
import PlanModel from "../models/planModel";
import { PlanInterval } from "../models/planModel/Plan";

/**
 * @desc Get Subscriptions for Logged-in User
 * @route GET /api/subscription
 * @access Private
 */
const getSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subscriptions = await SubscriptionModel.find({
      user: req.user?._id,
    }).sort({ createdAt: -1 }); // newest first

    if (!subscriptions || subscriptions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No subscriptions found" });
    }

    return res.status(200).json({ success: true, subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * @desc Create New Subscription (pending approval)
 * @route POST /api/subscription
 * @access Public
 */
const createSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { plan, amount, duration, features, paymentMethod, transactionId } =
      req.body;

    if (!plan || !amount || !duration || !paymentMethod || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required subscription details",
      });
    }

    // Check for existing active or pending subscription
    const existing = await SubscriptionModel.findOne({
      user: req.user?._id,
      status: { $in: ["active", "pending"] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active or pending subscription. Please wait until it is approved or expires.",
      });
    }

    // Get start and end date
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (duration.toLowerCase() === "month") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (duration.toLowerCase() === "year") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid duration provided. Must be "month" or "year".',
      });
    }

    const subscription = await SubscriptionModel.create({
      user: req.user?._id,
      plan,
      amount,
      duration,
      features,
      paymentMethod,
      transactionId,
      startDate,
      endDate,
      status: "pending",
      remarks: ["Waiting for admin approval"],
    });

    return res.status(201).json({
      success: true,
      message: "Subscription request submitted. Awaiting admin approval.",
      subscription,
    });
  } catch (error) {
    console.error("Subscription Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create subscription",
    });
  }
};

/**
 * @desc Update Subscription
 * @route PUT /api/subscription
 * @access Admin
 */
const updateSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      subscriptionId,
      plan,
      amount,
      duration,
      features,
      paymentMethod,
      transactionId,
      startDate,
      endDate,
      status,
      remarks,
    } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ message: "subscriptionId is required" });
    }

    const updateFields: any = {};

    if (plan) updateFields.plan = plan;
    if (amount) updateFields.amount = amount;
    if (duration) updateFields.duration = duration;
    if (features) updateFields.features = features;
    if (paymentMethod) updateFields.paymentMethod = paymentMethod;
    if (transactionId) updateFields.transactionId = transactionId;
    if (startDate) updateFields.startDate = startDate;
    if (endDate) updateFields.endDate = endDate;
    if (status) updateFields.status = status;
    if (remarks) updateFields.remarks = remarks;

    const subscription = await SubscriptionModel.findByIdAndUpdate(
      subscriptionId,
      updateFields,
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc Get All Subscriptions (Admin only)
 * @route GET /api/subscription?all=true
 * @access Admin
 */
const getAllSubscriptions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Optional: ensure only admins can access this route
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const subscriptions = await SubscriptionModel.find({})
      .populate("user", "name email") // only populate required fields
      .sort({ createdAt: -1 }); // newest first

    return res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error("Error fetching all subscriptions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const applySubscription = async (req: Request, res: Response) => {
  try {
    const { userId, planId, paymentMethod, transactionId } = req.body;

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ message: "Invalid user or plan ID" });
    }

    const user = await UserModel.findById(userId).populate("subscription");
    if (!user) return res.status(404).json({ message: "User not found" });

    const plan = await PlanModel.findById(planId);
    if (!plan || plan.deleted) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const existingSub = user.subscription as any;

    if (existingSub) {
      const now = new Date();
      const isActive =
        existingSub.status === "active" &&
        (!existingSub.endDate || existingSub.endDate > now);

      if (isActive) {
        return res.status(400).json({
          message:
            "Active subscription found. Please wait for it to expire before applying again.",
        });
      }

      if (existingSub.status === "pending") {
        // Optional: Allow replacing a pending subscription
        await SubscriptionModel.findByIdAndDelete(existingSub._id); // clean up old
      }
    }

    // const now = new Date();
    // const endDate = new Date(
    //   duration === "month"
    //     ? now.setMonth(now.getMonth() + 1)
    //     : now.setFullYear(now.getFullYear() + 1)
    // );

    const now = new Date();
    const endDate = new Date(
      (plan.interval as PlanInterval) === "monthly"
        ? now.setMonth(now.getMonth() + 1)
        : plan.interval === "3months"
        ? now.setMonth(now.getMonth() + 3)
        : plan.interval === "6months"
        ? now.setMonth(now.getMonth() + 6)
        : plan.interval === "9months"
        ? now.setMonth(now.getMonth() + 9)
        : plan.interval === "yearly"
        ? now.setFullYear(now.getFullYear() + 1)
        : plan.interval === "custom"
        ? now.setDate(now.getDate() + (plan.customInterval ?? 0))
        : now.getTime()
    );

    const newSubscription = await SubscriptionModel.create({
      user: user._id,
      plan: plan._id,
      features: plan.features,
      paymentMethod,
      transactionId,
      status: "pending",
      startDate: new Date(),
      endDate,
    });

    user.subscription = newSubscription._id;
    await user.save();

    res.status(201).json({
      message: "Subscription applied successfully",
      subscription: newSubscription,
    });
  } catch (error) {
    console.error("Apply subscription error:", error);
    res.status(500).json({ message: "Failed to apply subscription", error });
  }
};

export {
  createSubscription,
  updateSubscription,
  getSubscription,
  getAllSubscriptions,
};
