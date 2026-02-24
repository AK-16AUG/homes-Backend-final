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
      const uploadedFiles = (
        Array.isArray((req as any).files)
          ? (req as any).files
          : req.file
            ? [req.file]
            : []
      ) as Express.Multer.File[];

      if (uploadedFiles.length === 0) {
        return res.status(statusCode.BAD_REQUEST).json({
          message: "No file uploaded",
        });
      }

      let successCount = 0;
      let skipCount = 0;
      let totalRows = 0;
      const errors: any[] = [];

      const normalizeCategory = (value: any): "rent" | "sale" | "pg" => {
        const raw = String(value || "").trim().toLowerCase();
        if (raw === "rent" || raw === "sale" || raw === "pg") return raw;
        return "rent";
      };

      const normalizeFurnishing = (
        value: any
      ): "Semi-furnished" | "Fully furnished" | "Raw" => {
        const raw = String(value || "").trim().toLowerCase();
        if (raw === "semi-furnished" || raw === "semi furnished") return "Semi-furnished";
        if (raw === "fully furnished" || raw === "fully-furnished") return "Fully furnished";
        if (raw === "raw") return "Raw";
        return "Semi-furnished";
      };

      for (const file of uploadedFiles) {
        const workbook = xlsx.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = xlsx.utils.sheet_to_json(sheet);

        totalRows += rows.length;

        for (const [index, row] of rows.entries()) {
          const rowNumber = index + 2;
          try {
            // Skip completely empty rows
            if (!row || Object.keys(row).length === 0) {
              continue;
            }

            const generatedName = `Property ${Date.now()}-${rowNumber}`;

            const cleanRow = {
              property_name: row.property_name?.toString()?.trim() || generatedName,
              description: row.description?.toString()?.trim() || "No description provided",
              rate: row.rate?.toString()?.trim() || "0",
              category: normalizeCategory(row.category),
              perPersonPrice: row.perPersonPrice?.toString()?.trim() || "0",
              totalCapacity: row.totalCapacity?.toString()?.trim() || "0",
              furnishing_type: normalizeFurnishing(row.furnishing_type),
              city: row.city?.toString()?.trim() || "Unknown City",
              state: row.state?.toString()?.trim() || "Unknown State",
              address: row.address?.toString()?.trim() || "",
              flat_no: row.flat_no?.toString()?.trim() || `AUTO-${rowNumber}`,
              area: row.area?.toString()?.trim() || "Unknown Area",
              bed: Number(row.bed) || 0,
              bathroom: Number(row.bathroom) || 0,
              availability: row.availability === "false" ? false : true,
            };

            const isDuplicate = await PropertyModel.findOne({
              property_name: cleanRow.property_name,
              city: cleanRow.city,
              state: cleanRow.state,
              flat_no: cleanRow.flat_no,
            });

            if (isDuplicate) {
              skipCount++;
              continue;
            }

            await propertyService.createProperty(cleanRow);
            successCount++;
          } catch (err: any) {
            const rawMessage = err?.message || "Unknown error";
            const lowered = String(rawMessage).toLowerCase();
            let fix = "Check this row values and try again.";

            if (lowered.includes("duplicate")) {
              fix = "Change property_name/flat_no/city/state combination or remove duplicate row.";
            } else if (lowered.includes("category")) {
              fix = "Use category as rent, sale, or pg.";
            } else if (lowered.includes("furnishing")) {
              fix = "Use furnishing_type as Semi-furnished, Fully furnished, or Raw.";
            } else if (lowered.includes("cast") || lowered.includes("number")) {
              fix = "Ensure numeric fields like bed, bathroom, and rate have valid numbers.";
            }

            errors.push({
              file: file.originalname,
              rowNumber,
              row,
              reason: rawMessage,
              fix,
            });
          }
        }
      }

      if (totalRows === 0) {
        return res.status(statusCode.BAD_REQUEST).json({
          message: "Excel sheet is empty",
        });
      }

      return res.status(statusCode.OK).json({
        message: "Bulk upload completed",
        summary: {
          total: totalRows,
          success: successCount,
          skipped: skipCount,
          failed: errors.length,
          files: uploadedFiles.length,
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

  async bulkMultiEntry(req: Request, res: Response) {
    try {
      const { entries, randomizeImages } = req.body;
      const uploadedImages = req.body.uploadedImages || [];

      if (!entries) {
        return res.status(statusCode.BAD_REQUEST).json({
          message: "No entries provided",
        });
      }

      let parsedEntries: any[] = [];
      try {
        parsedEntries = JSON.parse(entries);
      } catch (err) {
        return res.status(statusCode.BAD_REQUEST).json({
          message: "Invalid entries format. Expected JSON string.",
        });
      }

      if (!Array.isArray(parsedEntries) || parsedEntries.length === 0) {
        return res.status(statusCode.BAD_REQUEST).json({
          message: "Entries must be a non-empty array",
        });
      }

      // Check duplicates within the array
      const flatNumbers = parsedEntries.map(e => e.flat_no).filter(Boolean);
      const uniqueFlatNumbers = new Set(flatNumbers);
      if (flatNumbers.length !== uniqueFlatNumbers.size) {
        return res.status(statusCode.BAD_REQUEST).json({
          message: "Duplicate flat_no found within the provided entries",
        });
      }

      // Check duplicates against the DB
      const existingFlats = await PropertyModel.find({
        flat_no: { $in: flatNumbers }
      }).select("flat_no");

      if (existingFlats.length > 0) {
        const existingNos = existingFlats.map(f => f.flat_no).join(", ");
        return res.status(statusCode.BAD_REQUEST).json({
          message: `The following flat_no already exist in the database: ${existingNos}`,
        });
      }

      const shuffleArray = (array: any[]) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
      };

      const normalizeCategory = (value: any): "rent" | "sale" | "pg" => {
        const raw = String(value || "").trim().toLowerCase();
        if (raw === "rent" || raw === "sale" || raw === "pg") return raw;
        return "rent";
      };

      const normalizeFurnishing = (
        value: any
      ): "Semi-furnished" | "Fully furnished" | "Raw" => {
        const raw = String(value || "").trim().toLowerCase();
        if (raw === "semi-furnished" || raw === "semi furnished") return "Semi-furnished";
        if (raw === "fully-furnished" || raw === "fully furnished") return "Fully furnished";
        if (raw === "raw") return "Raw";
        return "Semi-furnished";
      };

      const propertiesToInsert = [];

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

      for (const entry of parsedEntries) {
        let entryImages = [...uploadedImages];
        if (randomizeImages === 'true' || randomizeImages === true) {
          entryImages = shuffleArray(entryImages);
        }

        const propertyData = {
          property_name: entry.property_name,
          description: entry.description,
          rate: entry.rate,
          category: normalizeCategory(entry.category),
          furnishing_type: normalizeFurnishing(entry.furnishing_type),
          city: entry.city,
          state: entry.state,
          address: entry.address,
          flat_no: entry.flat_no,
          area: entry.area,
          bed: Number(entry.bed) || 0,
          bathroom: Number(entry.bathroom) || 0,
          availability: entry.availability !== false,
          perPersonPrice: entry.perPersonPrice,
          totalCapacity: entry.totalCapacity,
          latitude: entry.latitude,
          longitude: entry.longitude,
          amenities: entry.amenities || [],
          services: entry.services || [],
          videos: entry.videos || [],
          images: entryImages,
        };

        for (const field of requiredFields) {
          if (!propertyData[field as keyof typeof propertyData]) {
            return res.status(statusCode.BAD_REQUEST).json({ message: `Missing required field: ${field} for property ${entry.property_name || 'unknown'}` });
          }
        }

        propertiesToInsert.push(propertyData);
      }

      // Perform a bulk insert to avoid Serverless Function timeouts on Vercel
      const createdProperties = await PropertyModel.insertMany(propertiesToInsert);

      return res.status(statusCode.CREATED).json({
        message: "Successfully created multiple entries",
        properties: createdProperties,
      });
    } catch (error: any) {
      console.error("Bulk multi entry error:", error);
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
