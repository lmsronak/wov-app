import { getModelForClass } from "@typegoose/typegoose"
import User from "./User"
import mongoose from "mongoose"

const UserModel = mongoose.models.User || getModelForClass(User)
export default UserModel
