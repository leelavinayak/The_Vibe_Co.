const express = require('express');
const router = express.Router();
const { getAllInquiries, updateInquiryStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

// Middleware to ensure the user is a provider
const isProvider = (req, res, next) => {
  if (req.user && (req.user.role === 'provider' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Provider role required.' });
  }
};

// Providers can get inquiries and update them
// Note: In a production app, we would filter inquiries by serviceId in the controller
// but for this implementation, we'll reuse the admin controller logic
router.get('/inquiries', protect, isProvider, getAllInquiries);
router.put('/inquiries/:id', protect, isProvider, updateInquiryStatus);

module.exports = router;
