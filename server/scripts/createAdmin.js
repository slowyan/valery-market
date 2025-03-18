const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Подключаемся к базе данных
    const dbUri = process.env.MONGO_URI;
    console.log('URI базы данных:', dbUri); // Для отладки

    if (!dbUri) {
      throw new Error('MONGO_URI не определен в файле .env');
    }

    await mongoose.connect(dbUri);
    console.log('Подключено к MongoDB');

    // Создаем администратора
    const adminData = {
      phone: '79999999999',
      email: 'admin@valery-pools.com',
      password: 'adminpass123',
      role: 'admin',
      isAdmin: true
    };

    // Проверяем существование администратора
    let admin = await User.findOne({ phone: adminData.phone });
    
    if (admin) {
      console.log('Администратор уже существует, обновляем данные...');
      Object.assign(admin, adminData);
      await admin.save();
    } else {
      console.log('Создаем нового администратора...');
      admin = new User(adminData);
      await admin.save();
    }

    console.log('Администратор успешно создан/обновлен:');
    console.log('Телефон:', admin.phone);
    console.log('Email:', admin.email);
    console.log('Пароль: adminpass123');
    console.log('Роль:', admin.role);
    console.log('isAdmin:', admin.isAdmin);
    console.log('ID:', admin._id);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

createAdmin(); 