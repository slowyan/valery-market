const jwt = require('jsonwebtoken');
const config = require('../config');

// Генерация случайного кода
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Создание JWT токена
const generateToken = (userId) => {
    return jwt.sign({ userId }, config.jwtSecret, {
        expiresIn: '30d'
    });
};

// Middleware для проверки JWT токена
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Требуется авторизация' });
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Неверный токен' });
    }
};

module.exports = {
    generateVerificationCode,
    generateToken,
    authMiddleware
}; 