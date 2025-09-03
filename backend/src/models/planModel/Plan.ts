import { modelOptions, prop } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { ObjectId } from "mongoose";

export type PlanInterval =
  | "monthly"
  | "3months"
  | "6months"
  | "9months"
  | "yearly"
  | "custom";

@modelOptions({
  options: { automaticName: true },
})
class Plan extends TimeStamps {
  readonly _id: string;

  @prop({ type: String })
  name: string;

  @prop({ type: String })
  description: string;

  @prop({ type: String })
  interval: PlanInterval;

  @prop({ type: Number })
  customInterval?: number;

  @prop({ type: () => [String] })
  features?: string[];

  @prop({ type: Number })
  priceInRupees: number;

  @prop({ type: Number })
  durationInDays: number;

  @prop({ type: Boolean, default: true })
  isVisibleToStudents: boolean;

  @prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export default Plan;
