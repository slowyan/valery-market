const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Функция для удаления файла изображения
const deleteImage = (imagePath) => {
  if (!imagePath) return;
  
  // Получаем путь к файлу относительно директории uploads
  const filename = imagePath.split('/').pop();
  const filepath = path.join(__dirname, '../uploads', filename);
  
  // Удаляем файл, если он существует
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

// Получить все категории
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить продукты по категории
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId }).populate('category');
    res.json(products);
  } catch (error) {
    console.error('Ошибка при получении продуктов по категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Поиск продуктов
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).populate('category');
    res.json(products);
  } catch (error) {
    console.error('Ошибка при поиске продуктов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить все продукты
const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query).populate('category');
    res.json(products);
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получить детали продукта
const getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    res.json(product);
  } catch (error) {
    console.error('Ошибка при получении продукта:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать новый продукт
const createProduct = async (req, res) => {
  try {
    console.log('Получены данные:', {
      body: req.body,
      files: req.files ? req.files.length : 0
    });

    const { name, description, price, category, specifications, existingImages } = req.body;
    
    // Проверяем обязательные поля
    if (!name || !price || !category) {
      console.log('Отсутствуют обязательные поля:', { name, price, category });
      return res.status(400).json({
        success: false,
        message: 'Название, цена и категория обязательны для заполнения'
      });
    }

    // Проверяем корректность цены
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      console.log('Некорректная цена:', price);
      return res.status(400).json({
        success: false,
        message: 'Цена должна быть положительным числом'
      });
    }

    // Проверяем существование категории
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      console.log('Категория не найдена:', category);
      return res.status(400).json({
        success: false,
        message: 'Указанная категория не существует'
      });
    }

    // Обработка изображений
    let images = [];
    
    // Добавляем существующие изображения
    if (existingImages) {
      const existingImagesArray = Array.isArray(existingImages) 
        ? existingImages 
        : [existingImages];
      images = [...existingImagesArray];
      console.log('Добавлены существующие изображения:', images);
    }
    
    // Добавляем новые загруженные изображения
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
      console.log('Добавлены новые изображения:', newImages);
    }

    // Обработка характеристик
    let parsedSpecs = [];
    if (specifications) {
      try {
        parsedSpecs = JSON.parse(specifications);
        if (!Array.isArray(parsedSpecs)) {
          console.log('Некорректный формат характеристик:', specifications);
          throw new Error('Характеристики должны быть массивом');
        }
        // Проверяем структуру каждой характеристики
        parsedSpecs = parsedSpecs.filter(spec => 
          spec && typeof spec === 'object' && 
          spec.name && spec.value && 
          spec.name.trim() && spec.value.trim()
        );
        console.log('Обработанные характеристики:', parsedSpecs);
      } catch (e) {
        console.log('Ошибка при парсинге характеристик:', e);
        return res.status(400).json({
          success: false,
          message: 'Неверный формат характеристик'
        });
      }
    }

    const productData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      price: numericPrice,
      category,
      specifications: parsedSpecs,
      images
    };

    console.log('Создание продукта с данными:', productData);

    const product = new Product(productData);
    await product.save();
    
    // Получаем продукт с populated категорией для ответа
    const populatedProduct = await Product.findById(product._id).populate('category');

    console.log('Продукт успешно создан:', populatedProduct);

    return res.status(201).json({
      success: true,
      message: 'Товар успешно создан',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Подробная ошибка при создании продукта:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Проверяем тип ошибки
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Неверный формат данных'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Ошибка при создании товара. Пожалуйста, проверьте введенные данные.'
    });
  }
};

// Обновить продукт
const updateProduct = async (req, res) => {
  try {
    console.log('Получены данные для обновления:', {
      body: req.body,
      files: req.files ? req.files.length : 0,
      params: req.params
    });

    const { name, description, price, category, specifications, existingImages } = req.body;
    
    // Проверяем обязательные поля
    if (!name || !price || !category) {
      console.log('Отсутствуют обязательные поля:', { name, price, category });
      return res.status(400).json({
        success: false,
        message: 'Название, цена и категория обязательны для заполнения'
      });
    }

    // Проверяем корректность цены
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      console.log('Некорректная цена:', price);
      return res.status(400).json({
        success: false,
        message: 'Цена должна быть положительным числом'
      });
    }

    // Находим текущий продукт
    const currentProduct = await Product.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Продукт не найден'
      });
    }

    // Обработка изображений
    let images = [];
    
    // Обрабатываем существующие изображения
    let parsedExistingImages = [];
    if (existingImages) {
      try {
        parsedExistingImages = JSON.parse(existingImages);
        console.log('Сохраняемые существующие изображения:', parsedExistingImages);
        
        // Находим изображения, которые нужно удалить
        const imagesToDelete = currentProduct.images.filter(img => 
          !parsedExistingImages.includes(`${config.baseUrl}${img}`)
        );
        
        // Удаляем файлы изображений, которые больше не нужны
        for (const imgPath of imagesToDelete) {
          try {
            const fullPath = path.join(__dirname, '..', imgPath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
              console.log('Удалено изображение:', fullPath);
            }
          } catch (unlinkError) {
            console.error('Ошибка при удалении изображения:', unlinkError);
          }
        }

        // Добавляем оставшиеся существующие изображения
        images = parsedExistingImages.map(img => 
          img.replace(`${config.baseUrl}`, '')
        );
      } catch (e) {
        console.error('Ошибка при обработке существующих изображений:', e);
      }
    }
    
    // Добавляем новые загруженные изображения
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
      console.log('Добавлены новые изображения:', newImages);
    }

    // Обработка характеристик
    let parsedSpecs = [];
    if (specifications) {
      try {
        parsedSpecs = JSON.parse(specifications);
        if (!Array.isArray(parsedSpecs)) {
          console.log('Некорректный формат характеристик:', specifications);
          throw new Error('Характеристики должны быть массивом');
        }
        // Проверяем структуру каждой характеристики
        parsedSpecs = parsedSpecs.filter(spec => 
          spec && typeof spec === 'object' && 
          spec.name && spec.value && 
          spec.name.trim() && spec.value.trim()
        );
        console.log('Обработанные характеристики:', parsedSpecs);
      } catch (e) {
        console.log('Ошибка при парсинге характеристик:', e);
        return res.status(400).json({
          success: false,
          message: 'Неверный формат характеристик'
        });
      }
    }

    const updateData = {
      name: name.trim(),
      description: description ? description.trim() : '',
      price: numericPrice,
      category,
      specifications: parsedSpecs,
      images
    };

    console.log('Обновление продукта с данными:', updateData);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category');

    console.log('Продукт успешно обновлен:', updatedProduct);

    res.json({
      success: true,
      message: 'Товар успешно обновлен',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Ошибка при обновлении продукта:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Неверный формат данных'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении товара'
    });
  }
};

// Удалить продукт
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('Попытка удаления продукта:', productId);

    if (!productId) {
      console.log('ID продукта отсутствует в запросе');
      return res.status(400).json({
        success: false,
        message: 'ID продукта не указан'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log('Продукт не найден:', productId);
      return res.status(404).json({
        success: false,
        message: 'Продукт не найден'
      });
    }

    // Удаляем изображения продукта
    if (product.images && product.images.length > 0) {
      for (const imagePath of product.images) {
        try {
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log('Удалено изображение:', fullPath);
          }
        } catch (unlinkError) {
          console.error('Ошибка при удалении изображения:', unlinkError);
        }
      }
    }

    await product.deleteOne();
    console.log('Продукт успешно удален:', productId);

    res.json({
      success: true,
      message: 'Продукт успешно удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении продукта:', {
      error: error.message,
      stack: error.stack,
      productId: req.params.productId
    });
    
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении продукта'
    });
  }
};

// Загрузка изображений
const uploadImages = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Не выбраны файлы для загрузки' });
    }

    const urls = files.map(file => `/uploads/${file.filename}`);
    res.json({ urls });
  } catch (error) {
    console.error('Ошибка при загрузке изображений:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Создать категорию
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Проверяем наличие файла
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Изображение категории обязательно'
      });
    }

    const image = `/uploads/${req.file.filename}`;

    // Проверяем уникальность названия
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Категория с таким названием уже существует'
      });
    }

    const category = new Category({
      name,
      description,
      image
    });

    await category.save();
    
    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Ошибка при создании категории'
    });
  }
};

// Обновить категорию
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name, description },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    res.json(category);
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удалить категорию
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByIdAndDelete(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    // Удаляем ссылки на категорию из продуктов
    await Product.updateMany(
      { category: categoryId },
      { $unset: { category: "" } }
    );

    res.json({ message: 'Категория успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновить доступность продукта
const updateProductAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const productId = req.params.productId;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Параметр isAvailable должен быть булевым значением'
      });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { isAvailable },
      { new: true }
    ).populate('category');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Продукт не найден'
      });
    }

    res.json({
      success: true,
      message: 'Доступность продукта обновлена',
      product
    });
  } catch (error) {
    console.error('Ошибка при обновлении доступности продукта:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении доступности продукта'
    });
  }
};

module.exports = {
  getCategories,
  getProductsByCategory,
  searchProducts,
  getAllProducts,
  getProductDetails,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  createCategory,
  updateCategory,
  deleteCategory,
  updateProductAvailability
}; 