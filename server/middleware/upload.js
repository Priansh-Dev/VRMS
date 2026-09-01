const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');
const { AppError } = require('./errorHandler');

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
];

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = config.upload.dir;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError('Invalid file type. Allowed: JPEG, PNG, WebP, PDF', 400, 'INVALID_FILE_TYPE'), false);
  }

  if (!allowedExtensions.includes(ext)) {
    return cb(new AppError('Invalid file extension', 400, 'INVALID_FILE_EXTENSION'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 3
  }
});

const uploadDocuments = upload.fields([
  { name: 'rc', maxCount: 1 },
  { name: 'ownerId', maxCount: 1 },
  { name: 'numberPlatePhoto', maxCount: 1 }
]);

module.exports = { upload, uploadDocuments, allowedMimeTypes, allowedExtensions };