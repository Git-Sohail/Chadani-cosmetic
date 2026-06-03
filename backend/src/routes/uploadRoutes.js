const express = require('express');
const multer = require('multer');
const { authenticateUser, isAdmin } = require('../middleware/auth');
const { upload, storeImage } = require('../utils/imageStorage');

const router = express.Router();

router.post('/multiple', authenticateUser, isAdmin, (req, res) => {
  upload.array('images', 12)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.files?.length) {
        return res.status(400).json({ error: 'No image files uploaded.' });
      }

      const urls = [];
      const errors = [];

      for (const file of req.files) {
        try {
          const { url } = await storeImage(file);
          urls.push(url);
        } catch (fileError) {
          errors.push(file.originalname || 'image');
          console.error('Multi-upload file error:', fileError);
        }
      }

      if (!urls.length) {
        return res.status(500).json({
          error: 'Failed to upload images. Check file size (max 5MB) and format.',
        });
      }

      res.status(200).json({
        urls,
        uploaded: urls.length,
        failed: errors.length,
        failedFiles: errors,
      });
    } catch (error) {
      console.error('Multi upload route error:', error);
      res.status(500).json({
        error: error.message || 'Failed to upload images.',
      });
    }
  });
});

router.post('/', authenticateUser, isAdmin, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
      }

      const { url, storage } = await storeImage(req.file);
      res.status(200).json({ url, storage });
    } catch (error) {
      console.error('Upload route error:', error);
      res.status(500).json({
        error: error.message || 'Failed to upload image. Try again or paste an image URL.',
      });
    }
  });
});

module.exports = router;
