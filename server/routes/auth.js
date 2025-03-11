const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Отправка кода подтверждения
router.post('/send-code', authController.sendCode);

// Проверка кода и авторизация
router.post('/verify-code', authController.verifyCode);

// Регистрация
router.post('/register', authController.register);

// Вход для пользователей
router.post('/login', authController.login);

// Вход для администраторов
router.post('/admin/login', authController.adminLogin);

module.exports = router; 