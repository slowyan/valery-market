const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Проверка аутентификации. Заголовки:', req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Отсутствует заголовок Authorization');
      return res.status(401).json({
        success: false,
        message: 'Необходима авторизация'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Токен не найден в заголовке');
      return res.status(401).json({
        success: false,
        message: 'Токен не найден'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Токен декодирован:', decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('Пользователь не найден:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(401).json({
      success: false,
      message: 'Ошибка аутентификации'
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    console.log('Проверка прав администратора для пользователя:', req.user);
    
    if (!req.user.isAdmin) {
      console.log('Доступ запрещен: пользователь не является администратором');
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    next();
  } catch (error) {
    console.error('Ошибка при проверке прав администратора:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

module.exports = { auth, isAdmin }; 
 