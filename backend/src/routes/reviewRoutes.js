const express = require('express');
const {
  getProductReviews,
  canReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/product/:productId', getProductReviews);

// Authenticated
router.get('/product/:productId/can-review', authenticateUser, canReview);
router.post('/product/:productId', authenticateUser, createReview);
router.put('/:reviewId', authenticateUser, updateReview);
router.delete('/:reviewId', authenticateUser, deleteReview);

module.exports = router;
