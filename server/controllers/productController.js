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
    const products = await Product.find({ category: req.params.categoryId })
      .populate('category')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Ошибка при получении продуктов категории:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении продуктов категории'
    });
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
    const products = await Product.find()
      .populate('category')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Ошибка при получении продуктов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении продуктов'
    });
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

// Получение продукта по ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Продукт не найден'
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Ошибка при получении продукта:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении продукта'
    });
  }
};

// Создать новый продукт
const createProduct = async (req, res) => {
  try {
    console.log('Создание продукта. Данные:', {
      body: req.body,
      file: req.file
    });

    const {
      name,
      description,
      price,
      category,
      inStock,
      infiniteStock,
      discount
    } = req.body;

    // Проверяем обязательные поля
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Название, цена и категория обязательны'
      });
    }

    // Проверяем наличие изображения
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Изображение продукта обязательно'
      });
    }

    // Формируем путь к изображению относительно сервера
    const imagePath = `/uploads/${req.file.filename}`;
    console.log('Путь к изображению:', imagePath);

    const product = new Product({
      name: name.trim(),
      description: description ? description.trim() : '',
      price: Number(price),
      category,
      image: imagePath,
      inStock: inStock === 'true',
      infiniteStock: infiniteStock === 'true',
      discount: discount ? Number(discount) : 0
    });

    console.log('Сохранение продукта:', product);

    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('category');

    console.log('Продукт успешно создан:', populatedProduct);

    res.status(201).json({
      success: true,
      message: 'Продукт успешно создан',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Ошибка при создании продукта:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании продукта'
    });
  }
};

// Обновить продукт
const updateProduct = async (req, res) => {
  try {
    console.log('Обновление продукта. Данные:', {
      body: req.body,
      file: req.file,
      params: req.params
    });

    const {
      name,
      description,
      price,
      category,
      inStock,
      infiniteStock,
      discount
    } = req.body;

    const updateData = {};
    
    if (name) updateData.name = name.trim();
    if (description) updateData.description = description.trim();
    if (price) updateData.price = Number(price);
    if (category) updateData.category = category;
    if (typeof inStock !== 'undefined') updateData.inStock = inStock === 'true';
    if (typeof infiniteStock !== 'undefined') updateData.infiniteStock = infiniteStock === 'true';
    if (typeof discount !== 'undefined') updateData.discount = Number(discount);

    // Если загружено новое изображение
    if (req.file) {
      // Формируем путь к изображению относительно сервера
      updateData.image = `/uploads/${req.file.filename}`;
      console.log('Новое изображение:', updateData.image);

      // Получаем старый продукт для удаления старого изображения
      const oldProduct = await Product.findById(req.params.id);
      if (oldProduct && oldProduct.image) {
        const oldImagePath = path.join(__dirname, '..', oldProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log('Старое изображение удалено:', oldImagePath);
        }
      }
    }

    console.log('Данные для обновления:', updateData);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Продукт не найден'
      });
    }

    console.log('Продукт успешно обновлен:', product);

    res.json({
      success: true,
      message: 'Продукт успешно обновлен',
      product
    });
  } catch (error) {
    console.error('Ошибка при обновлении продукта:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении продукта'
    });
  }
};

// Удалить продукт
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Продукт не найден'
      });
    }

    res.json({
      success: true,
      message: 'Продукт успешно удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении продукта:', error);
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

// Удалить изображение продукта
const deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Получаем продукт
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Продукт не найден'
      });
    }

    // Если у продукта есть изображение
    if (product.image) {
      // Удаляем файл
      const imagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Изображение удалено:', imagePath);
      }

      // Обновляем продукт
      product.image = null;
      await product.save();
    }

    res.json({
      success: true,
      message: 'Изображение успешно удалено'
    });
  } catch (error) {
    console.error('Ошибка при удалении изображения:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении изображения'
    });
  }
};

module.exports = {
  getCategories,
  getProductsByCategory,
  searchProducts,
  getAllProducts,
  getProductDetails,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  createCategory,
  updateCategory,
  deleteCategory,
  updateProductAvailability,
  deleteProductImage
}; 