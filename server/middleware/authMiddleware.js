const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Необходима авторизация'
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

    req.user = user;
    next();
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(401).json({
      success: false,
      message: 'Ошибка авторизации'
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Необходима авторизация'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен. Требуются права администратора'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Ошибка при проверке прав администратора:', error);
    res.status(401).json({
      success: false,
      message: 'Ошибка авторизации'
    });
  }
};

module.exports = { auth, isAdmin }; 
 