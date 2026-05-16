const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, admin, provider } = require('../middleware/auth');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// @desc    Upload an image (Admin/Provider)
// @route   POST /api/upload
router.post('/', protect, provider, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }
  res.send({
    message: 'Image uploaded',
    url: `/uploads/${req.file.filename}`
  });
});

// @desc    Upload an image (Public - for provider applications)
// @route   POST /api/upload/public
router.post('/public', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }
  res.send({
    message: 'Image uploaded',
    url: `/uploads/${req.file.filename}`
  });
});

module.exports = router;
