const express = require('express');
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  getUserCount,
  getAllCustomers,
  getMe,
  updateProfile,
  updateProfileAvatar,
  removeProfileAvatar,
  changePassword,
} = require('../controllers/authController');
const { startGoogleAuth, googleCallback } = require('../controllers/googleAuthController');
const { authenticateUser, isAdmin } = require('../middleware/auth');
const { authLimiter, loginLimiter, otpLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/google', authLimiter, startGoogleAuth);
router.get('/google/callback', googleCallback);

router.post('/register', authLimiter, register);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/login', loginLimiter, login);
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);
router.post('/profile/avatar', authenticateUser, updateProfileAvatar);
router.delete('/profile/avatar', authenticateUser, removeProfileAvatar);
router.put('/profile/password', authenticateUser, changePassword);
router.get('/users/count', authenticateUser, isAdmin, getUserCount);
router.get('/customers', authenticateUser, isAdmin, getAllCustomers);

module.exports = router;
