const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware');
const {
  getAllOrders,
  getOrderDetails,
  createOrder,
  updateOrderStatus
} = require('../controllers/orderController');

// Маршруты для администратора
router.get('/admin', isAdmin, getAllOrders);
router.get('/admin/:id', isAdmin, getOrderDetails);
router.put('/admin/:id/status', isAdmin, updateOrderStatus);

// Публичные маршруты
router.post('/', createOrder);

module.exports = router; 