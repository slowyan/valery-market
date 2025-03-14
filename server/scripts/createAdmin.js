require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    // Подключаемся к базе данных
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Данные администратора
    const adminData = {
      email: 'admin@valery-pools.com',
      password: 'adminpass123',
      name: 'Administrator',
      isAdmin: true,
      phone: '+7 (999) 999-99-99'
    };

    // Проверяем, существует ли уже администратор
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Удаляем существующего администратора');
      await User.deleteOne({ email: adminData.email });
    }

    // Создаем нового администратора
    const admin = new User(adminData);
    
    // Сохраняем администратора (пароль будет хэширован автоматически через middleware)
    await admin.save();
    
    // Проверяем, что администратор создан
    const createdAdmin = await User.findOne({ email: adminData.email });
    console.log('Администратор успешно создан:');
    console.log('Email:', adminData.email);
    console.log('Пароль:', adminData.password);
    console.log('isAdmin:', createdAdmin.isAdmin);
    console.log('ID:', createdAdmin._id);
    
    // Проверяем, что пароль правильно хэширован
    const isPasswordValid = await createdAdmin.comparePassword(adminData.password);
    console.log('Проверка пароля:', isPasswordValid);
    
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    process.exit(1);
  }
};

createAdmin(); 