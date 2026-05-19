const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserDetails,
  updateUser, 
  createUser,
  deleteUser,
  createAdminInit,
  createAdminVerify,
  getAllInquiries, 
  updateInquiryStatus, 
  getAllReviews, 
  updateReviewStatus,
  deleteReview 
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes here are protected and require admin role
router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.post('/users/create-admin-init', createAdminInit);
router.post('/users/create-admin', createAdminVerify);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/inquiries', getAllInquiries);
router.put('/inquiries/:id', updateInquiryStatus);

router.get('/reviews', getAllReviews);
router.put('/reviews/:id', updateReviewStatus);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
