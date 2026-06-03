const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { authenticateUser, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticateUser, isAdmin, createProduct);
router.put('/:id', authenticateUser, isAdmin, updateProduct);
router.delete('/:id', authenticateUser, isAdmin, deleteProduct);

module.exports = router;
