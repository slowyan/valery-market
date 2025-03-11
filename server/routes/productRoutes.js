const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Получить все категории
router.get('/categories', productController.getCategories);

// Получить товары по категории
router.get('/category/:categoryId', productController.getProductsByCategory);

// Получить детали товара
router.get('/:productId', productController.getProductDetails);

// Поиск товаров
router.get('/search', productController.searchProducts);

module.exports = router; 