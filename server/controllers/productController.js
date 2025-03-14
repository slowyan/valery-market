const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

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
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении категорий' });
  }
};

// Получить товары по категории
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { search, minPrice, maxPrice, sort } = req.query;

    let query = { category: categoryId };

    // Поиск по названию или описанию
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Фильтрация по цене
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Сортировка
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'name_asc':
          sortOption = { name: 1 };
          break;
        case 'name_desc':
          sortOption = { name: -1 };
          break;
      }
    }

    const products = await Product.find(query)
      .sort(sortOption)
      .populate('category', 'name');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении товаров' });
  }
};

// Получить детали товара
exports.getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId)
      .populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении информации о товаре' });
  }
};

// Поиск товаров
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).populate('category', 'name');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при поиске товаров' });
  }
};

// Получение всех товаров
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товаров'
    });
  }
};

// Получение товара по ID
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId)
      .populate('category');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Ошибка при получении товара:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товара'
    });
  }
};

// Обновление доступности товара
exports.updateProductAvailability = async (req, res) => {
  try {
    const { productId } = req.params;
    const { isAvailable } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { isAvailable },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Ошибка при обновлении доступности товара:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении доступности товара'
    });
  }
};

// Создание нового товара (для админа)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, specifications } = req.body;

    // Проверка обязательных полей
    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Все обязательные поля должны быть заполнены'
      });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      image,
      specifications: specifications || [],
      isAvailable: true
    });

    await product.save();

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Ошибка при создании товара:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании товара'
    });
  }
};

// Обновление товара (для админа)
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    // Проверяем существование товара
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    // Если загружено новое изображение, удаляем старое
    if (updateData.image && product.image !== updateData.image) {
      deleteImage(product.image);
    }

    // Обновляем только разрешенные поля
    const allowedFields = ['name', 'description', 'price', 'category', 'image', 'specifications', 'isAvailable'];
    Object.keys(updateData).forEach(key => {
      if (!allowedFields.includes(key)) {
        delete updateData[key];
      }
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    ).populate('category');

    res.json({
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Ошибка при обновлении товара:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении товара'
    });
  }
};

// Удаление товара (для админа)
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    // Удаляем изображение товара
    deleteImage(product.image);

    await Product.findByIdAndDelete(productId);

    res.json({
      success: true,
      message: 'Товар успешно удален'
    });
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении товара'
    });
  }
};

// Создание новой категории (для админа)
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Название категории обязательно'
      });
    }

    const category = new Category({ name });
    await category.save();

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании категории'
    });
  }
};

// Удаление категории (для админа)
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Проверяем, есть ли товары в этой категории
    const productsCount = await Product.countDocuments({ category: categoryId });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя удалить категорию, содержащую товары'
      });
    }

    const category = await Category.findByIdAndDelete(categoryId);
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