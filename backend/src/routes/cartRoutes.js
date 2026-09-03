const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  mergeCart
} = require('../controllers/cartController');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all cart endpoints
router.use(authenticateUser);

router.get('/', getCart);
router.post('/', addToCart);
router.post('/merge', mergeCart);
router.put('/:id', updateCartItem);
router.delete('/:id', deleteCartItem);

module.exports = router;
