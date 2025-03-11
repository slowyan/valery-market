const adminAuth = (req, res, next) => {
  // Проверяем, что пользователь аутентифицирован и имеет права администратора
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Доступ запрещен. Требуются права администратора.'
    });
  }
  next();
};

module.exports = adminAuth; 