import { Request, Response } from "express";
import PropertyServices from "../services/Property.service.js";
import PropertyModel from "../entities/Properties.entity.js";
import statusCode from "../common/constant/StatusCode.js";
import errorResponse from "../common/constant/Error.js";
import * as xlsx from "xlsx";

const propertyService = new PropertyServices();

export default class PropertyController {
  async bulkUploadProperties(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(statusCode.BAD_REQUEST).json({
          message: "No file uploaded",
        });
      }

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = xlsx.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        return res.status(statusCode.BAD_REQUEST).json({
          message: "Excel sheet is empty",
        });
      }

      let successCount = 0;
      let skipCount = 0;
      const errors = [];

      for (const row of rows) {
        try {
          // Clean the row data to match model expectations
          const cleanRow = {
            property_name: row.property_name?.toString(),
            description: row.description?.toString(),
            rate: row.rate?.toString(),
            category: row.category?.toString()?.toLowerCase(),
            perPersonPrice: row.perPersonPrice?.toString(),
            totalCapacity: row.totalCapacity?.toString(),
            furnishing_type: row.furnishing_type?.toString(),
            city: row.city?.toString(),
            state: row.state?.toString(),
            address: row.address?.toString(),
            flat_no: row.flat_no?.toString(),
            area: row.area?.toString(),
            bed: Number(row.bed) || 0,
            bathroom: Number(row.bathroom) || 0,
            availability: row.availability === "false" ? false : true,
          };

          // Check for duplicate based on specific unique fields
          const duplicateQuery: any = {
            property_name: cleanRow.property_name,
            city: cleanRow.city,
          };

          // Only include flat_no in query if it's provided
          if (cleanRow.flat_no) {
            duplicateQuery.flat_no = cleanRow.flat_no;
          }

          const isDuplicate = await PropertyModel.findOne(duplicateQuery);

          if (isDuplicate) {
            skipCount++;
            continue;
          }

          await propertyService.createProperty(cleanRow);
          successCount++;
        } catch (err: any) {
          errors.push({ row, error: err.message });
        }
      }

      return res.status(statusCode.OK).json({
        message: "Bulk upload completed",
        summary: {
          total: rows.length,
          success: successCount,
          skipped: skipCount,
          failed: errors.length,
        },
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

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
