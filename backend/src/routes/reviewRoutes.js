const express = require('express');
const {
  getProductReviews,
  getAllReviews,
  canReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { authenticateUser, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/product/:productId', getProductReviews);

// Admin
router.get('/', authenticateUser, isAdmin, getAllReviews);

// Authenticated
router.get('/product/:productId/can-review', authenticateUser, canReview);
router.post('/product/:productId', authenticateUser, createReview);
router.put('/:reviewId', authenticateUser, updateReview);
router.delete('/:reviewId', authenticateUser, deleteReview);

module.exports = router;
