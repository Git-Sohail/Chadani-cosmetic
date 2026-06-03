const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authenticateUser, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCategories);
router.post('/', authenticateUser, isAdmin, createCategory);
router.put('/:id', authenticateUser, isAdmin, updateCategory);
router.delete('/:id', authenticateUser, isAdmin, deleteCategory);

module.exports = router;
