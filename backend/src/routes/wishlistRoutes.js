const express = require('express');
const {
  getWishlist,
  addToWishlist,
  deleteFromWishlist
} = require('../controllers/wishlistController');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateUser);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:id', deleteFromWishlist);

module.exports = router;
