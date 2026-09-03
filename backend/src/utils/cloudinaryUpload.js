const cloudinary = require('./cloudinary');

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'cosmetics_store' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

function uploadMediaToCloudinary(buffer, resourceType = 'auto') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'chadani_chat',
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          format: result.format,
          resourceType: result.resource_type,
          bytes: result.bytes,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

module.exports = {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  uploadMediaToCloudinary,
};
