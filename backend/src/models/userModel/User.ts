import { modelOptions, pre, prop, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongoose";
import mongoose from "mongoose";
import Subscription from "../subscriptionModel/Subscription";

export const UserRoles = {
  STUDENT: "student",
  CLIENT: "client",
  ADMIN: "admin",
} as const;

export enum UserStatusType {
  Pending = "pending",
  Rejected = "rejected",
  Approved = "approved",
}

export type UserRolesType = (typeof UserRoles)[keyof typeof UserRoles];

@pre<User>("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})
@modelOptions({
  options: { automaticName: true },
})
class User extends TimeStamps {
  readonly _id: string;

  @prop({ type: String })
  name: string;

  @prop({ type: String, required: true, trim: true, unique: false })
  email: string;

  @prop({ type: String })
  password: string;

  @prop({ type: Number, required: true })
  phone: number;

  @prop({ type: () => [String] })
  roles: UserRolesType[];

  @prop({ type: String, required: true, default: "pending" })
  status: UserStatusType;

  @prop({ type: Boolean, default: false })
  isAdmin: boolean;

  @prop({ type: mongoose.Schema.Types.ObjectId, default: null })
  isClientOf: mongoose.Schema.Types.ObjectId;

  @prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Subscription })
  subscription: Ref<Subscription>;

  @prop({ type: String, default: false })
  tempSecret?: string;

  @prop({ type: String, default: false })
  mfaSecret?: string;

  @prop({ type: Boolean, default: false })
  mfaEnabled: boolean;

  public async matchPassword(enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

export default User;
