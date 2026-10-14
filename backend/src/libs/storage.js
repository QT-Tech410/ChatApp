import { v2 as cloudinary } from "cloudinary";

/**
 * Storage Service - Quản lý tệp tin đa phương tiện và lưu trữ quy mô lớn.
 * Hỗ trợ tạo chữ ký Presigned / Upload Signature để Client tải thẳng lên
 * Cloud Storage (Cloudinary/S3/R2) mà KHÔNG làm nghẽn RAM và I/O của server backend.
 */

// Sinh chữ ký upload trực tiếp từ Frontend lên Cloudinary (Client Direct Upload)
export const getUploadSignature = (folder = "chat_app/uploads") => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const paramsToSign = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  };
};

// Upload qua buffer (dành cho API upload truyền thống khi client không hỗ trợ direct)
export const uploadFileFromBuffer = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "chat_app/messages",
        resource_type: options.resourceType || "auto", // tự động nhận diện ảnh/tài liệu/video
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};
