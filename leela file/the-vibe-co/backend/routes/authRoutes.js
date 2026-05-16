const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  googleLogin,
  getProfile, 
  updateProfile,
  forgotPassword,
  resetPassword,
  sendChangePasswordOTP,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);
router.post('/change-password-otp', protect, sendChangePasswordOTP);
router.post('/change-password', protect, changePassword);

module.exports = router;
