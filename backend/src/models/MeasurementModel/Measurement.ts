import { modelOptions, prop, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Schema } from "mongoose";
import User from "../userModel/User";
import {
  MeasurableEntities,
  MeasurableEntityClass,
  type MeasurableEntityNames,
} from "./Entities";

@modelOptions({
  options: { automaticName: true },
})
export class Reading extends TimeStamps {
  @prop({ type: Number })
  beforeVal: number | null;

  @prop({ type: Number })
  afterVal: number | null;

  @prop({
    required: true,
    refPath: "readings.onModel", // Reminder: refPath should be from the root of the document being queried and not the nested entity
  })
  on!: Ref<MeasurableEntityClass>;

  @prop({
    required: true,
    enum: Object.keys(MeasurableEntities),
  })
  onModel!: MeasurableEntityNames;

  @prop({ type: String })
  location: string;

  @prop({ type: String })
  person: string;

  @prop({ type: String })
  description: string;
}

/**
 * 1 Measurement Per each Entity of that entity type:
 * example: if user creates 5 products for a client. 1 Measurement will have 1 reading per each product.
 */
@modelOptions({
  options: { automaticName: true },
})
class Measurement extends TimeStamps {
  readonly _id: string;

  @prop({ type: Schema.ObjectId })
  user: Ref<User>;

  @prop({ type: Schema.ObjectId })
  client: Ref<User>;

  @prop({ type: () => [Reading] })
  readings: Reading[];

  @prop({ type: String })
  type: MeasurableEntityNames;

  @prop({ type: String })
  location: string;

  @prop({ type: String })
  measurementFor: string;

  @prop({ type: String })
  person: string;

  @prop({ type: String })
  description: string;
}

export default Measurement;
