require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config');

const createAdmin = async () => {
  try {
    // Подключаемся к базе данных
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Данные администратора
    const adminData = {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Administrator',
      isAdmin: true,
      phone: '+7 (999) 999-99-99'
    };

    // Проверяем, существует ли уже администратор
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Администратор с таким email уже существует');
      process.exit(0);
    }

    // Создаем нового администратора
    const admin = new User(adminData);
    await admin.save();

    console.log('Администратор успешно создан:');
    console.log('Email:', adminData.email);
    console.log('Пароль:', adminData.password);
    
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    process.exit(1);
  }
};

createAdmin(); 