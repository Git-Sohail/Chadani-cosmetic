const multer = require('multer');
const { isCloudinaryConfigured, uploadMediaToCloudinary } = require('./cloudinaryUpload');
const { saveMediaBuffer } = require('./localUpload');

const ALLOWED_MIME_TYPES = {
  // Images (Max 5 MB)
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  // Videos (Max 20 MB)
  'video/mp4': 'video',
  'video/webm': 'video',
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: (req, file, cb) => {
    const mediaType = ALLOWED_MIME_TYPES[file.mimetype];
    if (!mediaType) {
      return cb(
        new Error('Unsupported file type. Please attach a valid JPG, PNG, WebP image or MP4, WebM video.'),
        false
      );
    }
    cb(null, true);
  },
});

async function storeChatMedia(file) {
  const mediaType = ALLOWED_MIME_TYPES[file.mimetype] || (file.mimetype.startsWith('video/') ? 'video' : 'image');

  // Enforce 5MB limit for images
  if (mediaType === 'image' && file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image size exceeds maximum allowed limit of 5 MB.');
  }

  const preferLocal = process.env.UPLOAD_STORAGE === 'local';
  const useCloudinary = !preferLocal && isCloudinaryConfigured();

  if (useCloudinary) {
    try {
      const result = await uploadMediaToCloudinary(file.buffer, mediaType === 'video' ? 'video' : 'image');
      return {
        url: result.url,
        mediaType,
        mediaName: file.originalname,
        mediaSize: file.size,
        storage: 'cloudinary',
      };
    } catch (err) {
      console.warn('Cloudinary chat media upload failed, falling back to local storage:', err.message || err);
    }
  }

  const url = saveMediaBuffer(file.buffer, file.originalname);
  return {
    url,
    mediaType,
    mediaName: file.originalname,
    mediaSize: file.size,
    storage: 'local',
  };
}

module.exports = {
  uploadChatMediaMulter: upload,
  storeChatMedia,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
};

