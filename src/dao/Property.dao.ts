import PropertiesEntity, {
  PropertyType,
} from "../entities/Properties.entity.js";
import { logger } from "../utils/logger.js";

export default class PropertyDao {
  private Property!: typeof PropertiesEntity;
  constructor() {
    this.Property = PropertiesEntity;
  }

  async createProperty(data: Partial<PropertyType>) {
    logger.info("PropertyDao -> createProperty called", { data });
    try {
      if (data.flat_no && data.flat_no.trim() !== "") {
        const existingInfo = await this.Property.findOne({ flat_no: data.flat_no });
        if (existingInfo) {
          throw new Error(`A property with flat_no ${data.flat_no} already exists.`);
        }
      }
      if (data.images && data.images.length > 0) {
        const frontImage = data.images[0];
        const duplicateFrontImage = await this.Property.findOne({ "images.0": frontImage });
        if (duplicateFrontImage) {
          throw new Error("This image is already set as the front image for another property. Every listing must have a unique front image.");
        }
      }
      const result = await this.Property.create(data);
      logger.info("PropertyDao -> createProperty success", { id: result._id });
      return result;
    } catch (error: any) {
      logger.error("PropertyDao -> createProperty error", {
        error: error.message,
      });
      throw error;
    }
  }

  async getPropertyById(id: string) {
    logger.info("PropertyDao -> getPropertyById called", { id });
    try {
      const result = await this.Property.findById(id)
        .populate("amenities")
        .populate("services");
      if (result) {
        logger.info("PropertyDao -> getPropertyById success", { id });
      } else {
        logger.warn("PropertyDao -> getPropertyById not found", { id });
      }

      return result;
    } catch (error: any) {
      logger.error("PropertyDao -> getPropertyById error", {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  async getAllProperties(filter = {}, page = 1, limit = 10) {
    logger.info("PropertyDao -> getAllProperties called", { filter, page, limit });

    try {
      const skip = (page - 1) * limit;
      const [results, total] = await Promise.all([
        this.Property.find(filter)
          .populate("amenities")
          .populate("services")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        this.Property.countDocuments(filter)

      ]);
      logger.info("PropertyDao -> getAllProperties success", { count: results.length, total });
      return { results, total, page, limit };
    } catch (error: any) {
      logger.error("PropertyDao -> getAllProperties error", { error: error.message });
      throw error;
    }
  }

  async updateProperty(id: string, updateData: any) {
    logger.info("PropertyDao -> updateProperty called", { id, updateData });
    try {
      if (updateData.flat_no && updateData.flat_no.trim() !== "") {
        const existingInfo = await this.Property.findOne({ flat_no: updateData.flat_no, _id: { $ne: id } });
        if (existingInfo) {
          throw new Error(`A property with flat_no ${updateData.flat_no} already exists.`);
        }
      }
      if (updateData.images && updateData.images.length > 0) {
        const frontImage = updateData.images[0];
        const duplicateFrontImage = await this.Property.findOne({
          "images.0": frontImage,
          _id: { $ne: id }
        });
        if (duplicateFrontImage) {
          throw new Error("This image is already set as the front image for another property. Every listing must have a unique front image.");
        }
      }
      const result = await this.Property.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (result) {
        logger.info("PropertyDao -> updateProperty success", { id });
      } else {
        logger.warn("PropertyDao -> updateProperty not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("PropertyDao -> updateProperty error", {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  async deleteProperty(id: string) {
    logger.info("PropertyDao -> deleteProperty called", { id });
    try {
      const result = await this.Property.findByIdAndDelete(id);

      if (result) {
        logger.info("PropertyDao -> deleteProperty success", { id });
      } else {
        logger.warn("PropertyDao -> deleteProperty not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("PropertyDao -> deleteProperty error", {
        id,
        error: error.message,
      });
      throw error;
    }
  }
}
