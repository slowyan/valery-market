require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Подключаемся к той же базе данных, что и сервер
    const dbUri = process.env.NODE_ENV === 'development' 
      ? 'mongodb://localhost:27017/valery-market-dev'
      : process.env.MONGODB_URI;

    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    // Удаляем существующего администратора
    await User.deleteOne({ email: 'admin@valery-pools.com' });
    console.log('Удаляем существующего администратора');

    // Создаем нового администратора
    const admin = new User({
      email: 'admin@valery-pools.com',
      password: 'adminpass123',
      isAdmin: true
    });

    await admin.save();

    // Проверяем сохранение
    const savedAdmin = await User.findOne({ email: 'admin@valery-pools.com' });
    const passwordCheck = await savedAdmin.comparePassword('adminpass123');

    console.log('Администратор успешно создан:');
    console.log('Email:', savedAdmin.email);
    console.log('Пароль: adminpass123');
    console.log('isAdmin:', savedAdmin.isAdmin);
    console.log('ID:', savedAdmin._id);
    console.log('Проверка пароля:', passwordCheck);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin(); 