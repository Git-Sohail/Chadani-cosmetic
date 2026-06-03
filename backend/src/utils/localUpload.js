const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function getPublicBaseUrl() {
  const fromEnv = process.env.BACKEND_PUBLIC_URL || process.env.API_PUBLIC_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
}

function saveImageBuffer(buffer, originalName = 'image') {
  ensureUploadDir();

  const ext = path.extname(originalName).toLowerCase();
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  fs.writeFileSync(filePath, buffer);

  return `${getPublicBaseUrl()}/uploads/${filename}`;
}

module.exports = { saveImageBuffer, UPLOAD_DIR };
