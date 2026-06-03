const multer = require('multer');
const { isCloudinaryConfigured, uploadBufferToCloudinary } = require('./cloudinaryUpload');
const { saveImageBuffer } = require('./localUpload');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

async function storeImage(file) {
  const preferLocal = process.env.UPLOAD_STORAGE === 'local';
  const useCloudinary = !preferLocal && isCloudinaryConfigured();

  if (useCloudinary) {
    try {
      const url = await uploadBufferToCloudinary(file.buffer);
      return { url, storage: 'cloudinary' };
    } catch (error) {
      console.warn(
        'Cloudinary upload failed, using local storage:',
        error?.message || error
      );
    }
  }

  const url = saveImageBuffer(file.buffer, file.originalname);
  return { url, storage: 'local' };
}

module.exports = { upload, storeImage };
