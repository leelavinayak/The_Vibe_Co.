const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type (Allow images and PDFs)
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPG, PNG, WEBP) and PDFs are allowed!'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// @desc    Upload an image/pdf (Authenticated users: Admin, Provider, and Standard Users)
// @route   POST /api/upload
router.post('/', protect, (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || err });
    }
    const file = req.files && req.files[0];
    if (!file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    res.send({
      message: 'File uploaded successfully',
      url: `/uploads/${file.filename}`
    });
  });
});

// @desc    Upload an image (Public - for provider applications)
// @route   POST /api/upload/public
router.post('/public', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || err });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    res.send({
      message: 'Image uploaded successfully',
      url: `/uploads/${req.file.filename}`
    });
  });
});

module.exports = router;
