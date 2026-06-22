// Order routes — includes new order count for admin badge
const express = require('express');
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
  getNewOrderCount,
  deleteOrder,
} = require('../controllers/orderController');
const { authenticateUser, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateUser);

router.post('/', placeOrder);
router.get('/my-orders', getMyOrders);
router.get('/new-count', isAdmin, getNewOrderCount);
router.get('/', isAdmin, getAllOrders);
router.get('/:id', getOrderDetails);
router.put('/:id/status', isAdmin, updateOrderStatus);
router.delete('/:id', isAdmin, deleteOrder);

module.exports = router;
