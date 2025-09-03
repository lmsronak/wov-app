import { getModelForClass } from "@typegoose/typegoose";
import Subscription from "./Subscription";
import mongoose from "mongoose";

const SubscriptionModel =
  mongoose.models.Subscription || getModelForClass(Subscription);

export default SubscriptionModel;
