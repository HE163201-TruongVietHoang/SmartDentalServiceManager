const multer = require("multer");
const router = require("express").Router();
const storage = multer.memoryStorage();

// Giới hạn file
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg" , "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only PNG, JPG, JPEG files are allowed"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter
});

module.exports = upload;
