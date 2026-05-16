const express = require('express');
const router = express.Router();
const { 
  applyAsProvider, 
  getApplications, 
  updateApplicationStatus 
} = require('../controllers/providerController');
const { protect, admin } = require('../middleware/auth');

// Public route to apply
router.post('/apply', applyAsProvider);

// Admin only routes
router.get('/applications', protect, admin, getApplications);
router.put('/applications/:id', protect, admin, updateApplicationStatus);

module.exports = router;
