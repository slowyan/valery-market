const Category = require('../models/Category');
const fs = require('fs').promises;
const path = require('path');

// Получение всех категорий
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ order: 1, _id: 1 })
      .lean()
      .exec();
    
    console.log('Отправка категорий:', categories.map(c => ({
      id: c._id,
      name: c.name,
      order: c.order
    })));
    
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

    // Проверяем наличие изображения
    if (!req.file || !req.body.image) {
      console.log('Отсутствует изображение');
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

    // Получаем максимальный порядок
    const maxOrder = await Category.findOne().sort('-order').select('order');
    const nextOrder = maxOrder ? maxOrder.order + 1 : 0;

    // Создаем новую категорию
    const categoryData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      image: req.body.image,
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

    // Если произошла ошибка и было загружено изображение, удаляем его
    if (req.body.image) {
      try {
        const imagePath = path.join(__dirname, '..', req.body.image);
        await fs.unlink(imagePath);
      } catch (unlinkError) {
        console.error('Ошибка при удалении изображения:', unlinkError);
      }
    }

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
    console.log('Обновление категории. Данные:', {
      body: req.body,
      file: req.file,
      params: req.params
    });

    const oldCategory = await Category.findById(req.params.id);
    if (!oldCategory) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    const updateData = { ...req.body };
    
    // Если есть порядок, преобразуем его в число
    if (updateData.order !== undefined) {
      updateData.order = parseInt(updateData.order);
    }
    
    // Если загружено новое изображение
    if (req.file && req.body.image) {
      // Удаляем старое изображение
      if (oldCategory.image) {
        try {
          const oldImagePath = path.join(__dirname, '..', oldCategory.image);
          await fs.unlink(oldImagePath);
        } catch (unlinkError) {
          console.error('Ошибка при удалении старого изображения:', unlinkError);
        }
      }
      updateData.image = req.body.image;
    }

    console.log('Обновление категории с данными:', updateData);

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Категория успешно обновлена:', category);

    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    
    // Если произошла ошибка и было загружено новое изображение, удаляем его
    if (req.file && req.body.image) {
      try {
        const imagePath = path.join(__dirname, '..', req.body.image);
        await fs.unlink(imagePath);
      } catch (unlinkError) {
        console.error('Ошибка при удалении изображения:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении категории'
    });
  }
};

// Обновление порядка категорий
const updateCategoriesOrder = async (req, res) => {
  try {
    console.log('Обновление порядка категорий. Тело запроса:', JSON.stringify(req.body, null, 2));
    console.log('Заголовки запроса:', req.headers);

    const { categories } = req.body;
    
    // Проверка наличия данных
    if (!categories || !Array.isArray(categories)) {
      console.error('Некорректные данные:', req.body);
      return res.status(400).json({
        success: false,
        message: 'Неверный формат данных. Ожидается массив categories'
      });
    }

    // Проверка структуры данных и преобразование типов
    const validatedCategories = categories.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`Элемент ${index} не является объектом`);
      }

      const id = String(item.id);
      const order = Number(item.order);

      if (!id || isNaN(order)) {
        throw new Error(`Некорректные данные в элементе ${index}: id=${id}, order=${order}`);
      }

      return { id, order };
    });

    console.log('Валидированные данные:', validatedCategories);

    // Обновляем порядок для каждой категории последовательно
    for (const { id, order } of validatedCategories) {
      console.log(`Обновление категории ${id} на позицию ${order}`);
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { order },
        { new: true }
      );
      
      if (!updatedCategory) {
        throw new Error(`Категория с ID ${id} не найдена`);
      }
    }

    // Получаем обновленный список категорий
    const updatedCategories = await Category.find()
      .sort({ order: 1, _id: 1 })
      .lean()
      .exec();

    console.log('Обновленный порядок категорий:', 
      updatedCategories.map(c => ({
        id: c._id,
        name: c.name,
        order: c.order
      }))
    );

    res.json({
      success: true,
      message: 'Порядок категорий обновлен',
      categories: updatedCategories
    });
  } catch (error) {
    console.error('Ошибка при обновлении порядка категорий:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Ошибка при обновлении порядка категорий'
    });
  }
};

// Удаление категории
const deleteCategory = async (req, res) => {
  try {
    console.log('Удаление категории:', req.params.id);

    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    // Удаляем изображение категории
    if (category.image) {
      try {
        const imagePath = path.join(__dirname, '..', category.image);
        await fs.unlink(imagePath);
      } catch (unlinkError) {
        console.error('Ошибка при удалении изображения:', unlinkError);
      }
    }

    await category.deleteOne();

    console.log('Категория успешно удалена');

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
  updateCategoriesOrder,
  deleteCategory
}; 
 