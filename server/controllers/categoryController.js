const Category = require('../models/Category');

// Получение всех категорий
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении категорий'
    });
  }
};

// Получение категории по ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }
    res.json(category);
  } catch (error) {
    console.error('Ошибка при получении категории:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении категории'
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

    // Проверяем наличие изображения
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Изображение категории обязательно'
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

    // Получаем максимальный order
    const maxOrderCategory = await Category.findOne().sort('-order');
    const nextOrder = maxOrderCategory ? maxOrderCategory.order + 1 : 0;

    // Создаем новую категорию
    const categoryData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      image: `/uploads/${req.file.filename}`,
      order: nextOrder
    };

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
    const { name, description } = req.body;
    const updateData = {
      name,
      description
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// Обновление порядка категорий
const updateCategoriesOrder = async (req, res) => {
  try {
    console.log('Обновление порядка категорий. Полученные данные:', req.body);
    
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      console.log('Ошибка: данные не являются массивом');
      return res.status(400).json({
        success: false,
        message: 'Неверный формат данных. Ожидается массив категорий.'
      });
    }

    // Проверяем, что все ID существуют
    const categoryIds = categories.map(cat => cat._id);
    console.log('ID категорий для обновления:', categoryIds);

    const existingCategories = await Category.find({ _id: { $in: categoryIds } });
    console.log('Найденные категории:', existingCategories.map(cat => ({ _id: cat._id, name: cat.name })));

    if (existingCategories.length !== categories.length) {
      console.log('Ошибка: не все категории найдены');
      return res.status(400).json({
        success: false,
        message: 'Некоторые категории не найдены'
      });
    }

    // Обновляем порядок для каждой категории
    const updatePromises = categories.map((cat, index) => {
      console.log(`Обновление категории ${cat._id} на позицию ${index}`);
      return Category.findByIdAndUpdate(
        cat._id,
        { order: index },
        { new: true }
      );
    });

    const updatedCategories = await Promise.all(updatePromises);
    console.log('Категории успешно обновлены:', 
      updatedCategories.map(cat => ({ _id: cat._id, name: cat.name, order: cat.order }))
    );

    // Получаем обновленный список категорий
    const sortedCategories = await Category.find().sort({ order: 1 });

    res.json({
      success: true,
      message: 'Порядок категорий успешно обновлен',
      categories: sortedCategories
    });
  } catch (error) {
    console.error('Ошибка при обновлении порядка категорий:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении порядка категорий'
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoriesOrder
}; 
 