// utils/cloudinaryRemoveImage.js
import cloudinary from "../config/cloudinary.config.js";

export async function deleteCloudinaryImage(publicId:any) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: "image" }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}
