import { getModelForClass } from "@typegoose/typegoose";
import Plan from "./Plan";
import mongoose from "mongoose";

const PlanModel = mongoose.models.Plan || getModelForClass(Plan);

export default PlanModel;
