require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const config = require('../config');

const categories = [
  {
    name: 'Фильтры',
    description: 'Фильтры для бассейнов различных типов'
  },
  {
    name: 'Насосы',
    description: 'Насосы для бассейнов'
  },
  {
    name: 'Химия',
    description: 'Химические средства для обработки воды'
  },
  {
    name: 'Аксессуары',
    description: 'Различные аксессуары для бассейнов'
  }
];

const createCategories = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Подключено к MongoDB');

    // Удаляем существующие категории
    await Category.deleteMany({});
    console.log('Существующие категории удалены');

    // Создаем новые категории
    const createdCategories = await Category.insertMany(categories);
    console.log('Созданы новые категории:');
    createdCategories.forEach(category => {
      console.log(`- ${category.name} (${category._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Ошибка при создании категорий:', error);
    process.exit(1);
  }
};

createCategories(); 
 