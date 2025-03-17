const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const { adminLogin, checkAuth } = require('../controllers/authController');

// Маршрут для входа администратора
router.post('/admin/login', adminLogin);

// Маршрут для проверки аутентификации
router.get('/check', auth, checkAuth);

module.exports = router; 
 