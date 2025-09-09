import { Request, Response } from "express";
import PropertyServices from "../services/Property.service.js";
import statusCode from "../common/constant/StatusCode.js";
import errorResponse from "../common/constant/Error.js";

const propertyService = new PropertyServices();

export default class PropertyController {
  async createProperty(req: Request, res: Response) {
    try {
      const property = await propertyService.createProperty(req.body);
      return res
        .status(statusCode.CREATED)
        .json({ message: "Property created", property });
    } catch (error: any) {
      return res.status(statusCode.BAD_REQUEST).json({
        error: errorResponse.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getPropertyById(req: Request, res: Response) {
    try {
      const property = await propertyService.getPropertyById(req.params.id);
      return res.status(statusCode.OK).json(property);
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.PROPERTY_NOT_FOUND,
        message: error.message,
      });
    }
  }

  async getAllProperties(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, ...filter } = req.query;
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const properties = await propertyService.getAllProperties(filter, pageNum, limitNum);
      return res.status(statusCode.OK).json(properties);
    } catch (error: any) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async updateProperty(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(statusCode.BAD_REQUEST).json({
          error: errorResponse.INVALID_ID,
          message: "Property ID is required",
        });
      }

      // Remove existingImages from updateData if present
      if ('existingImages' in updateData) {
        delete updateData.existingImages;
        
      }

      const updatedProperty = await propertyService.updateProperty(
        id,
        updateData
      );

      if (!updatedProperty) {
        return res.status(statusCode.NOT_FOUND).json({
          error: errorResponse.PROPERTY_NOT_FOUND,
          message: "Property not found",
        });
      }

      return res.status(statusCode.OK).json({
        message: "Property updated successfully",
        data: updatedProperty,
      });
    } catch (error: any) {
      console.error("Error updating property:", error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.PROPERTY_UPDATE_FAILED,
        message: error.message || "Failed to update property",
      });
    }
  }

  async deleteProperty(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(statusCode.BAD_REQUEST).json({
          error: errorResponse.INVALID_ID,
          message: "Property ID is required",
        });
      }

      const deletedProperty = await propertyService.deleteProperty(id);

      if (!deletedProperty) {
        return res.status(statusCode.NOT_FOUND).json({
          error: errorResponse.PROPERTY_NOT_FOUND,
          message: "Property not found",
        });
      }

      return res.status(statusCode.OK).json({
        message: "Property deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting property:", error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.PROPERTY_DELETE_FAILED,
        message: error.message || "Failed to delete property",
      });
    }
  }

  async deletePropertyImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;
      if (!id || !imageUrl) {
        return res.status(statusCode.BAD_REQUEST).json({
          error: errorResponse.BAD_REQUEST,
          message: "Property ID and imageUrl are required",
        });
      }
      await propertyService.deletePropertyImage(id, imageUrl);
      return res.status(statusCode.OK).json({
        message: "Image deleted from property successfully",
      });
    } catch (error: any) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }
}
