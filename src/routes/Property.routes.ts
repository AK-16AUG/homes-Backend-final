import { Router } from "express";
import PropertyController from "../controller/Property.cotroller.js";
import asyncHandler from "../utils/asyncHandler.js";
import upload from "../middleware/multer.middleware.js";
import cloudinary from "../config/cloudinary.config.js";
import streamifier from "streamifier";
import { authMiddleware, authorizeRoles } from "../middleware/Auth.middleware.js";
import sharp from "sharp";


const propertyRouter = Router();
const propertyController = new PropertyController();

const compressImage = async (fileBuffer: Buffer): Promise<Buffer> => {
  return await sharp(fileBuffer)
    .resize({
      width: 1200,
      height: 800,
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80, mozjpeg: true })
    .png({ quality: 80, compressionLevel: 8 })
    .toBuffer();
};

const uploadFromBuffer = (fileBuffer: Buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "properties" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

propertyRouter.get("/", asyncHandler(async (req, res) => {
  await propertyController.getAllProperties(req, res);
}));

propertyRouter.post("/upload-image", authMiddleware, authorizeRoles("admin", "superadmin"), upload.single("image"), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const compressedImage = await compressImage(req.file.buffer);
    const result: any = await uploadFromBuffer(compressedImage);
    return res.status(200).json({ url: result.secure_url });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}));

propertyRouter.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "superadmin"),
  upload.array("images"),

  asyncHandler(async (req, res) => {
    try {
      if (req.files && Array.isArray(req.files)) {
        const compressPromises = (req.files as Express.Multer.File[]).map(
          (file) => compressImage(file.buffer)
        );
        const compressedImages = await Promise.all(compressPromises);
        const uploadPromises = compressedImages.map((buffer) => uploadFromBuffer(buffer));
        const results = await Promise.all(uploadPromises);
        req.body.images = results.map((result: any) => result.secure_url);
      }

      // Step 2: Normalize other fields from FormData (amenities[], services[], videos[])
      const normalizeArrayField = (fieldName: string) => {
        const value = req.body[fieldName] || req.body[`${fieldName}[]`];
        if (!value) return [];
        if (Array.isArray(value)) return value.flat();
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            return [value];
          }
        }
        return [value];
      };

      req.body.amenities = normalizeArrayField('amenities');
      req.body.services = normalizeArrayField('services');
      req.body.videos = normalizeArrayField('videos');

      // Clean up the [] version from body to avoid cluttering Mongoose
      delete req.body['amenities[]'];
      delete req.body['services[]'];
      delete req.body['videos[]'];

      // Step 3: Explicitly cast numeric fields
      if (req.body.bed !== undefined) req.body.bed = Number(req.body.bed) || 0;
      if (req.body.bathroom !== undefined) req.body.bathroom = Number(req.body.bathroom) || 0;
      if (req.body.rate !== undefined) req.body.rate = String(req.body.rate);

      res.setHeader("Content-Type", "application/json");
      await propertyController.createProperty(req, res);
    } catch (error: any) {
      console.error("CRITICAL: Error in property creation route:", error);
      res.status(500).json({
        error: "Failed to create property",
        message: error.message,
        details: error.errors
      });
    }
  })
);

propertyRouter.get("/:id", asyncHandler(async (req, res) => {
  await propertyController.getPropertyById(req, res);
}));

propertyRouter.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "superadmin"),
  upload.array("images"),
  asyncHandler(async (req, res) => {
    try {
      // Debug logs
      console.log('req.files:', req.files);
      console.log('req.body:', req.body);
      let finalImageUrls: any = [];

      // Step 1: Handle existing image URLs
      if (req.body.existingImages) {
        let existingImages = [];

        // Parse existing images from request body
        if (typeof req.body.existingImages === 'string') {
          try {
            existingImages = JSON.parse(req.body.existingImages);
          } catch (e) {
            existingImages = [req.body.existingImages];
          }
        } else if (Array.isArray(req.body.existingImages)) {
          existingImages = req.body.existingImages.flat();
        }

        // Add existing URLs to final array
        finalImageUrls = [...existingImages];
      }

      // Step 2: Handle new file buffers (uploaded files)
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        // Compress the file buffers
        const compressPromises = (req.files as Express.Multer.File[]).map(
          (file) => compressImage(file.buffer)
        );
        const compressedImages = await Promise.all(compressPromises);

        // Upload compressed buffers to Cloudinary
        const uploadPromises = compressedImages.map((buffer) => uploadFromBuffer(buffer));
        const uploadResults = await Promise.all(uploadPromises);

        // Extract URLs from upload results
        const newImageUrls = uploadResults.map((result: any) => result.secure_url);

        // Prepend new URLs so they appear first (before existing images)
        finalImageUrls = [...newImageUrls, ...finalImageUrls];
      }

      // Step 3: Assign the combined array to req.body.images
      if (
        (req.body.existingImages && finalImageUrls.length > 0) ||
        (req.files && Array.isArray(req.files) && req.files.length > 0)
      ) {
        // Deep flatten and filter only valid URLs
        const flatImages = finalImageUrls.flat(Infinity).filter((url: any) =>
          typeof url === "string" && /^https?:\/\//.test(url)
        );
        console.log("Final images to be saved:", flatImages);
        // Set req.body.images to either the new list or empty array if explicitly cleared
        req.body.images = flatImages;
      } else if (req.body.hasOwnProperty('existingImages') || (req.files && Array.isArray(req.files))) {
        // If existingImages was present but empty, and no new files, it means all images were removed
        req.body.images = [];
      }

      // Step 4: Normalize other fields from FormData (amenities[], services[], videos[])
      const normalizeArrayField = (fieldName: string) => {
        const value = req.body[fieldName] || req.body[`${fieldName}[]`];
        if (!value) return [];
        if (Array.isArray(value)) return value.flat();
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            return [value];
          }
        }
        return [value];
      };

      req.body.amenities = normalizeArrayField('amenities');
      req.body.services = normalizeArrayField('services');
      req.body.videos = normalizeArrayField('videos');

      // Clean up the [] version from body to avoid cluttering Mongoose update
      delete req.body['amenities[]'];
      delete req.body['services[]'];
      delete req.body['videos[]'];

      // Step 5: Explicitly cast numeric fields to avoid validation errors
      if (req.body.bed !== undefined) req.body.bed = Number(req.body.bed) || 0;
      if (req.body.bathroom !== undefined) req.body.bathroom = Number(req.body.bathroom) || 0;
      if (req.body.rate !== undefined) req.body.rate = String(req.body.rate); // Ensure rate is a string as per schema

      // Defensive: If images is set but not a valid array, block update
      if (req.body.images && (!Array.isArray(req.body.images) || req.body.images.some((img: any) => typeof img !== "string"))) {
        console.error("Invalid images array!", req.body.images);
        return res.status(400).json({ error: "Invalid images array" });
      }

      // Log for debugging
      console.log('Final images array:', req.body.images);

      res.setHeader("Content-Type", "application/json");
      await propertyController.updateProperty(req, res);
    } catch (error: any) {
      console.error("CRITICAL: Error in property update route:", error);
      res.status(500).json({
        error: "Failed to update property",
        message: error.message,
        details: error.errors // Include Mongoose validation details if present
      });
    }
  })
);

propertyRouter.delete("/:id", authMiddleware, authorizeRoles("admin", "superadmin"), asyncHandler(async (req, res) => {
  await propertyController.deleteProperty(req, res);
}));

propertyRouter.delete("/:id/image", authMiddleware, authorizeRoles("admin", "superadmin"), asyncHandler(async (req, res) => {
  await propertyController.deletePropertyImage(req, res);
}));

propertyRouter.post(
  "/bulk-upload",
  authMiddleware,
  authorizeRoles("admin", "superadmin"),
  upload.array("file", 10),
  asyncHandler(async (req, res) => {
    await propertyController.bulkUploadProperties(req, res);
  })
);

propertyRouter.post(
  "/bulk-multi",
  authMiddleware,
  authorizeRoles("admin", "superadmin"),
  upload.array("images", 10),
  asyncHandler(async (req, res) => {
    try {
      if (req.files && Array.isArray(req.files)) {
        const compressPromises = (req.files as Express.Multer.File[]).map(
          (file) => compressImage(file.buffer)
        );
        const compressedImages = await Promise.all(compressPromises);
        const uploadPromises = compressedImages.map((buffer) => uploadFromBuffer(buffer));
        const results = await Promise.all(uploadPromises);
        req.body.uploadedImages = results.map((result: any) => result.secure_url);
      } else {
        req.body.uploadedImages = [];
      }
      res.setHeader("Content-Type", "application/json");
      await propertyController.bulkMultiEntry(req, res);
    } catch (error: any) {
      console.error("Error in bulk multi property creation:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  })
);

export default propertyRouter;
