const Category = require('../models/Category');

// Получение всех категорий
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении категорий'
    });
  }
};

// Создание новой категории
const createCategory = async (req, res) => {
  try {
    console.log('Получены данные:', {
      body: req.body,
      file: req.file,
      headers: req.headers
    });

    const { name, description } = req.body;

    // Проверяем наличие названия
    if (!name || !name.trim()) {
      console.log('Отсутствует название категории');
      return res.status(400).json({
        success: false,
        message: 'Название категории обязательно'
      });
    }

    // Проверяем уникальность названия
    const normalizedName = name.trim().toLowerCase();
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
    });

    if (existingCategory) {
      console.log('Категория с таким названием уже существует:', existingCategory);
      return res.status(400).json({
        success: false,
        message: 'Категория с таким названием уже существует'
      });
    }

    // Создаем новую категорию
    const categoryData = {
      name: name.trim(),
      description: description ? description.trim() : ''
    };

    // Добавляем изображение, если оно загружено
    if (req.file) {
      categoryData.image = `/uploads/${req.file.filename}`;
      console.log('Добавлено изображение:', categoryData.image);
    }

    console.log('Создание категории с данными:', categoryData);

    const category = new Category(categoryData);
    await category.save();

    console.log('Категория успешно создана:', category);

    return res.status(201).json({
      success: true,
      message: 'Категория успешно создана',
      category
    });
  } catch (error) {
    console.error('Ошибка при создании категории:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log('Ошибка валидации:', messages);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      console.log('Дубликат ключа:', error.keyValue);
      return res.status(400).json({
        success: false,
        message: 'Категория с таким названием уже существует'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Ошибка при создании категории'
    });
  }
};

// Обновление категории
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении категории'
    });
  }
};

// Удаление категории
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    res.json({
      success: true,
      message: 'Категория успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении категории'
    });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
}; 
 