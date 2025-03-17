const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/authMiddleware');
const { uploadImage, processImage } = require('../middleware/uploadImage');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoriesOrder
} = require('../controllers/categoryController');

// Публичные маршруты
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Защищенные маршруты (только для админов)
router.post('/', auth, isAdmin, uploadImage, processImage, createCategory);

// Маршрут для обновления порядка категорий (должен быть перед /:id)
router.put('/order', auth, isAdmin, updateCategoriesOrder);

// Маршруты для обновления и удаления категорий
router.put('/:id', auth, isAdmin, uploadImage, processImage, updateCategory);
router.delete('/:id', auth, isAdmin, deleteCategory);

module.exports = router; 
 