import PropertyDao from "../dao/Property.dao.js";
import { PropertyType } from "../entities/Properties.entity.js";
import { logger } from "../utils/logger.js";
 import { deleteCloudinaryImage } from "../utils/deleteImageCloudinary.js";
function isValidCategory(category: any): boolean {
  return ["rent", "sale"].includes(category);
}

function isValidFurnishingType(type: any): boolean {
  return ["Semi-furnished", "Fully furnished", "Raw"].includes(type);
}

function isValidLocation(location: any): boolean {
  return (
    location &&
    location.type === "Point" &&
    Array.isArray(location.coordinates) &&
    location.coordinates.length === 2 &&
    location.coordinates.every((n: any) => typeof n === "number")
  );
}

export default class PropertyServices {
  private propertyDao: PropertyDao;

  constructor() {
    this.propertyDao = new PropertyDao();
  }

  async createProperty(data: Partial<PropertyType>) {
    try {
      logger.info("PropertyServices -> createProperty called", { data });

      // Required fields check
      const requiredFields = [
        "property_name",
        "description",
        "rate",
        "category",
        "furnishing_type",
        "city",
        "state",
        "area"
      ];
      for (const field of requiredFields) {
        if (!data[field as keyof PropertyType]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Enum checks
      if (!isValidCategory(data.category)) {
        throw new Error("Invalid category. Must be 'rent' or 'sale'.");
      }
      if (!isValidFurnishingType(data.furnishing_type)) {
        throw new Error(
          "Invalid furnishing_type. Must be 'Semi-furnished', 'Fully furnished', or 'Raw'."
        );
      }

      // Location check
      // if (!isValidLocation(data.location)) {
      //   throw new Error(
      //     "Invalid location. Must be GeoJSON Point with [longitude, latitude]."
      //   );
      // }

      const property = await this.propertyDao.createProperty(data);
      if (!property) {
        throw new Error("Failed to create property");
      }
      return property;
    } catch (error: any) {
      logger.error("PropertyServices -> createProperty error", {
        error: error.message,
      });
      throw new Error(error.message || "Failed to create property");
    }
  }

  async getPropertyById(id: string) {
    try {
      logger.info("PropertyServices -> getPropertyById called", { id });
      const property = await this.propertyDao.getPropertyById(id);
      if (!property) {
        throw new Error("Property not found");
      }
      return property;
    } catch (error: any) {
      logger.error("PropertyServices -> getPropertyById error", {
        id,
        error: error.message,
      });
      throw new Error(error.message || "Failed to get property");
    }
  }

  async getAllProperties(filter = {}, page = 1, limit = 10) {
    try {
      logger.info("PropertyServices -> getAllProperties called", { filter, page, limit });
      const properties = await this.propertyDao.getAllProperties(filter, page, limit);
      return properties;
    } catch (error: any) {
      logger.error("PropertyServices -> getAllProperties error", {
        error: error.message,
      });
      throw new Error(error.message || "Failed to get properties");
    }
  }

  async updateProperty(id: string, data: Partial<PropertyType>) {
    try {
      logger.info("PropertyServices -> updateProperty called", { id, data });
      // Remove existingImages from data if present
      if ('existingImages' in data) {
        delete (data as any).existingImages;
      }
      // Ensure images is an array of strings
      if (data.images && !Array.isArray(data.images)) {
        data.images = [data.images] as any;
      }
      const property = await this.propertyDao.updateProperty(id, data);
      if (!property) {
        throw new Error("Property not found");
      }
      return property;
    } catch (error: any) {
      logger.error("PropertyServices -> updateProperty error", {
        id,
        error: error.message,
      });
      throw new Error(error.message || "Failed to update property");
    }
  }



async deleteProperty(id: string) {
  // Helper: extract public_id (e.g., "properties/abcdefg") from URL
  function extractPublicIdFromUrl(url: string): string | null {
    // Matches ".../upload/v1234567890/properties/abcdef...xyz.png"
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)\./);
    if (!match) return null;
    return match[1];
  }

  try {
    logger.info("PropertyServices -> deleteProperty called", { id });

    // Get property document (still in DB)
    const property: any = await this.propertyDao.getPropertyById(id);
    if (!property) {
      throw new Error("Property not found");
    }
    console.log(property);

    // Delete each image in Cloudinary if images is an array of URLs
    if (Array.isArray(property.images)) {
      for (const imgUrl of property.images) {
        const public_id = extractPublicIdFromUrl(imgUrl);
        if (public_id) {
          try {
            await deleteCloudinaryImage(public_id);
            logger.info(`Deleted Cloudinary image: ${public_id}`);
          } catch (err) {
            logger.warn(`Failed to delete Cloudinary image ${public_id}: ${err}`);
          }
        }
      }
    }

    // Now delete the property from DB
    const deletedProp = await this.propertyDao.deleteProperty(id);
    if (!deletedProp) {
      throw new Error("Property not found or could not be deleted after image removal");
    }
    return deletedProp;

  } catch (error: any) {
    logger.error("PropertyServices -> deleteProperty error", {
      id,
      error: error.message,
    });
    throw new Error(error.message || "Failed to delete property");
  }
}

  async deletePropertyImage(id: string, imageUrl: string) {
    // Helper: extract public_id (e.g., "properties/abcdefg") from URL
    function extractPublicIdFromUrl(url: string): string | null {
      const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)\./);
      if (!match) return null;
      return match[1];
    }
    try {
      logger.info("PropertyServices -> deletePropertyImage called", { id, imageUrl });
      // Remove imageUrl from property images array
      const property = await this.propertyDao.getPropertyById(id);
      if (!property) {
        throw new Error("Property not found");
      }
      if (!Array.isArray(property.images) || !property.images.includes(imageUrl)) {
        throw new Error("Image URL not found in property");
      }
      // Remove image from images array
      const updatedImages = property.images.filter((img: string) => img !== imageUrl);
      await this.propertyDao.updateProperty(id, { images: updatedImages });
      // Delete from Cloudinary
      const public_id = extractPublicIdFromUrl(imageUrl);
      if (public_id) {
        try {
          await deleteCloudinaryImage(public_id);
          logger.info(`Deleted Cloudinary image: ${public_id}`);
        } catch (err) {
          logger.warn(`Failed to delete Cloudinary image ${public_id}: ${err}`);
        }
      }
      return true;
    } catch (error: any) {
      logger.error("PropertyServices -> deletePropertyImage error", {
        id,
        imageUrl,
        error: error.message,
      });
      throw new Error(error.message || "Failed to delete property image");
    }
  }


}