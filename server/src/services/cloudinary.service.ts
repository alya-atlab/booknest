import cloudinary from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

export const uploadImageToCloudinary = async (
  buffer: Buffer,
  folder: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error || !result?.secure_url) {
          return reject(new ApiError( "Image upload failed", 500));
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(buffer);
  });
};