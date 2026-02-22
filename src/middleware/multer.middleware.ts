import multer from "multer";
import path from "path";
import { Request, Response, NextFunction } from "express";

// Define custom file type with Express's Multer.File
interface MulterFile extends Express.Multer.File {
  buffer: Buffer;
}

// Type for the callback function
type FileFilterCallback = multer.FileFilterCallback;

// Store files in memory for direct upload to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: MulterFile,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    // Also allow by extension if mimetype check fails (sometimes browser specific)
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, and Excel files are allowed."));
    }
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (use numeric value directly)
    files: 10 // Maximum 10 files (use numeric value directly)
  }
});

// Custom error handling middleware for Multer
export const handleMulterErrors = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    return res.status(400).json({
      error: err.code === 'LIMIT_FILE_SIZE'
        ? 'File size too large. Max 10MB allowed'
        : err.message
    });
  } else if (err instanceof Error) {
    // Other errors
    return res.status(400).json({ error: err.message });
  }
  next();
};

export default upload;