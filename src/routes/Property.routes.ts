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
      res.setHeader("Content-Type", "application/json");
      await propertyController.createProperty(req, res);
    } catch (error: any) {
      console.error("Error in property creation:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
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

        // Add new URLs to final array
        finalImageUrls = [...finalImageUrls, ...newImageUrls];
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
        console.log("Final images to be saved:", flatImages, "Original:", finalImageUrls);
        if (flatImages.length > 0) {
          req.body.images = flatImages;
        } else {
          // If invalid, do not update and return error
          return res.status(400).json({ error: "Invalid images array" });
        }
      }
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
      console.error("Error in property update:", error);
      res.status(500).json({ error: error.message });
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
  upload.single("file"),
  asyncHandler(async (req, res) => {
    await propertyController.bulkUploadProperties(req, res);
  })
);

export default propertyRouter;
