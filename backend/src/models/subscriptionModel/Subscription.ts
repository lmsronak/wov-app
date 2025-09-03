// import { modelOptions, prop, Ref } from '@typegoose/typegoose'
// import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
// import mongoose, { Mongoose, ObjectId, Schema } from 'mongoose'
// import Pricing from '../pricingModel/Pricing'
// import User from '../userModel/User'

// @modelOptions({
//   options: { automaticName: true },
// })
// class Subscription extends TimeStamps {
//   readonly _id: string

//   @prop({
//     type: mongoose.Schema.Types.ObjectId,
//     ref: () => User,
//     required: true,
//   })
//   user: Ref<User>

//   @prop({ type: String })
//   status: 'pending' | 'active' | 'ended' | 'suspended'

//   @prop({ type: Schema.ObjectId, ref: () => Pricing })
//   pricing: Ref<Pricing>

//   @prop({ type: Date })
//   startDate: Date

//   @prop({ type: Date })
//   endDate: Date

//   @prop({ type: String })
//   transactionId: string

//   @prop({ type: [String] })
//   remarks: string[]
// }

// export default Subscription

import { modelOptions, prop, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import mongoose, { Schema } from "mongoose";
import User from "../userModel/User";
import Plan from "../planModel/Plan";

@modelOptions({
  options: { automaticName: true },
})
class Subscription extends TimeStamps {
  readonly _id: string;

  @prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Plan })
  plan?: Ref<Plan>;

  @prop({ type: String })
  paymentMethod?: string; // e.g., 'online', 'cash'

  @prop({ type: String })
  transactionId?: string;

  @prop({ type: String })
  status: "pending" | "approved" | "rejected";

  @prop({ type: Date })
  startDate?: Date;

  @prop({ type: Date })
  endDate?: Date;

  @prop({ type: [String] })
  remarks: string[];

  @prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export default Subscription;
