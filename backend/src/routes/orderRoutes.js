const express = require('express');
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus
} = require('../controllers/orderController');
const { authenticateUser, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply auth to all endpoints
router.use(authenticateUser);

router.post('/', placeOrder);
router.get('/my-orders', getMyOrders);
router.get('/', isAdmin, getAllOrders);
router.get('/:id', getOrderDetails);
router.put('/:id/status', isAdmin, updateOrderStatus);

module.exports = router;
