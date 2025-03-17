require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config');

const deleteAdmins = async () => {
  try {
    // Подключаемся к базе данных
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Удаляем всех администраторов
    await User.deleteMany({ isAdmin: true });
    console.log('Все администраторы успешно удалены');
    
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при удалении администраторов:', error);
    process.exit(1);
  }
};

deleteAdmins(); 
 