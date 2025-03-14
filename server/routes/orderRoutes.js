const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Создание заказа (доступно всем)
router.post('/', orderController.createOrder);

// Получение всех заказов (только для админа)
router.get('/all', auth, adminAuth, orderController.getAllOrders);

// Получение заказов пользователя
router.get('/my', auth, orderController.getUserOrders);

// Обновление статуса заказа (только для админа)
router.patch('/:orderId/status', auth, adminAuth, orderController.updateOrderStatus);

// Получение деталей заказа
router.get('/:orderId', auth, orderController.getOrderDetails);

// Отмена заказа (требует аутентификации)
router.post('/:orderId/cancel', auth, orderController.cancelOrder);

module.exports = router; 