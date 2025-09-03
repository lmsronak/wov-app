import mongoose from "mongoose";
import colors from "colors";
import logger from "../logging/logger";

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("Please define the 'MONGO_URI' variable in .env file.");
    }
    const conn = await mongoose.connect(MONGO_URI);
    logger.info(`Mongo connected: ${conn.connection.host}`.yellow.bold);
  } catch (err) {
    logger.info(`[mongo]: ${err}`.red.inverse);
    process.exit(1);
  }
};

export default connectDB;
