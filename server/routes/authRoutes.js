const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { adminLogin, checkAuth } = require('../controllers/authController');
const authController = require('../controllers/authController');

// Маршрут для входа администратора
router.post('/admin/login', adminLogin);

// Маршрут для проверки аутентификации
router.get('/check', auth, checkAuth);

// Маршрут для отправки кода подтверждения
router.post('/send-code', authController.sendCode);

// Маршрут для проверки кода
router.post('/verify-code', authController.verifyCode);

module.exports = router; 
 