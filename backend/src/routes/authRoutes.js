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
} = require('../controllers/authController');
const { startGoogleAuth, googleCallback } = require('../controllers/googleAuthController');
const { authenticateUser, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/google', startGoogleAuth);
router.get('/google/callback', googleCallback);

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);
router.post('/profile/avatar', authenticateUser, updateProfileAvatar);
router.delete('/profile/avatar', authenticateUser, removeProfileAvatar);
router.get('/users/count', authenticateUser, isAdmin, getUserCount);
router.get('/customers', authenticateUser, isAdmin, getAllCustomers);

module.exports = router;
