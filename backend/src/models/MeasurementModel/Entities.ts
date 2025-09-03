import { modelOptions, prop } from "@typegoose/typegoose";
import User from "../userModel/User";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Schema } from "mongoose";

export type MeasurableEntityNames = keyof typeof MeasurableEntities;
export type MeasurableEntityClass = InstanceType<
  (typeof MeasurableEntities)[MeasurableEntityNames]
>;

export const typeToCollectionMap: Record<MeasurableEntityNames, string> = {
  Energy: "energy",
  Chakra: "chakras",
  Product: "products",
  Gland: "glands",
  Organ: "organs",
  Space: "spaces",
};

export class Entity extends TimeStamps {
  readonly _id: string;

  @prop({ type: String })
  name!: string;

  @prop({ type: Schema.ObjectId, ref: () => User })
  user!: User;

  @prop({ type: Schema.ObjectId, ref: () => User })
  client!: User;

  @prop({ type: String })
  type: MeasurableEntityNames;
}

@modelOptions({
  options: { automaticName: true },
  // schemaOptions: {
  //   collection: "energies",
  // },
})
export class Energy extends Entity {}

@modelOptions({
  options: { automaticName: true },
  // schemaOptions: {
  //   collection: "chakras",
  // },
})
export class Chakra extends Entity {}
@modelOptions({
  options: { automaticName: true },
  // schemaOptions: {
  //   collection: "organs",
  // },
})
export class Organ extends Entity {}
@modelOptions({
  options: { automaticName: true },
  // schemaOptions: {
  //   collection: "glands",
  // },
})
export class Gland extends Entity {}

@modelOptions({
  options: { automaticName: true },
  // schemaOptions: {
  //   collection: "spaces",
  // },
})
export class Space extends Entity {}

@modelOptions({
  options: { automaticName: true },
  // schemaOptions: {
  //   collection: "products",
  // },
})
export class Product extends Entity {}

export const MeasurableEntities = {
  Energy,
  Chakra,
  Organ,
  Gland,
  Space,
  Product,
} as const;
