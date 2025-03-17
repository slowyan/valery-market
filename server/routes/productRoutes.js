const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, isAdmin } = require('../middleware/authMiddleware');
const { upload, processImage } = require('../middleware/uploadImage');
const {
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
} = require('../controllers/productController');

// Публичные маршруты
router.get('/categories', getCategories);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/search', searchProducts);
router.get('/', getAllProducts);
router.get('/:id', getProductDetails);

// Маршруты для админ-панели (требуют аутентификации и прав админа)
router.post('/', [auth, isAdmin], upload, processImage, createProduct);
router.put('/:id', [auth, isAdmin], upload, processImage, updateProduct);
router.delete('/:id', [auth, isAdmin], deleteProduct);
router.patch('/:id/availability', [auth, isAdmin], updateProductAvailability);

// Управление категориями (только для админа)
router.post('/categories', [auth, isAdmin], upload, processImage, createCategory);
router.put('/categories/:id', [auth, isAdmin], upload, processImage, updateCategory);
router.delete('/categories/:id', [auth, isAdmin], deleteCategory);

// Маршрут для загрузки файлов
router.post('/upload', [auth, isAdmin], upload, processImage, uploadImages);

module.exports = router; 