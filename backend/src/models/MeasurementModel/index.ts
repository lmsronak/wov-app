import { getModelForClass } from "@typegoose/typegoose"
import Measurement, { Reading } from "./Measurement"
import { Chakra, Energy, Gland, Organ, Product, Space } from "./Entities"
import mongoose from "mongoose"

const MeasurementModel =
  mongoose.models.Measurement || getModelForClass(Measurement)

export const ChakraModel = mongoose.models.Chakra || getModelForClass(Chakra)
export const EnergyModel = mongoose.models.Energy || getModelForClass(Energy)
export const GlandModel = mongoose.models.Gland || getModelForClass(Gland)
export const OrganModel = mongoose.models.Organ || getModelForClass(Organ)
export const SpaceModel = mongoose.models.Space || getModelForClass(Space)
export const ProductModel = mongoose.models.Product || getModelForClass(Product)

export const ReadingModel = mongoose.models.Reading || getModelForClass(Reading)

export default MeasurementModel
