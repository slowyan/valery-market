const express = require('express');
const router = express.Router();
const { isAdmin, auth } = require('../middleware/authMiddleware');
const {
  getAllOrders,
  getOrderDetails,
  createOrder,
  updateOrderStatus,
  getUserOrders
} = require('../controllers/orderController');

// Маршруты для администратора
router.get('/admin', isAdmin, getAllOrders);
router.get('/admin/:id', isAdmin, getOrderDetails);
router.put('/admin/:id/status', isAdmin, updateOrderStatus);

// Маршруты для авторизованных пользователей
router.get('/user', auth, getUserOrders);

// Публичные маршруты
router.post('/', createOrder);
router.get('/:id', getOrderDetails);

module.exports = router; 