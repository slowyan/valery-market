const Product = require('../models/Product');
const Category = require('../models/Category');

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