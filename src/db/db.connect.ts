import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv"
dotenv.config()
const dbConnect = async () => {
  try {
    await mongoose.connect(`${process.env.URI}`);
    logger.info("DB CONNECTED.......");

    // Attempt to drop the old unique index on property_name if it exists
    try {
      await mongoose.connection.collection('properties').dropIndex("property_name_1");
      logger.info("Dropped old property_name_1 index");
    } catch (indexError: any) {
      if (indexError.code !== 27) { // 27 is IndexNotFound
        logger.debug("Index property_name_1 not found or already dropped.");
      }
    }
  } catch (error: any) {
    logger.debug(error);
    logger.error("Unable to connect to DB");
    throw new Error("Database connection failed");
  }
};

export default dbConnect;
