const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Токен не предоставлен'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Неверный формат токена'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Проверяем, что для админских маршрутов используется токен с флагом isAdmin
    if (req.baseUrl.includes('/admin') && !decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен. Требуется админский токен.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Срок действия токена истек'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Ошибка аутентификации'
    });
  }
};

module.exports = auth; 