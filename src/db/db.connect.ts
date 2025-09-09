import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv"
dotenv.config()
const dbConnect = async () => {
  try {
    await mongoose.connect(`${process.env.URI}`);
    logger.info("DB CONNECTED.......");
  } catch (error: any) {
    logger.debug(error);
    logger.error("Unable to connect to DB");
    throw new Error("Database connection failed");
  }
};

export default dbConnect;
