const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/authMiddleware');
const { upload, processImage } = require('../middleware/uploadImage');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoriesOrder
} = require('../controllers/categoryController');

// Публичные маршруты
router.get('/', getAllCategories);

// Маршруты для администратора
router.post('/', auth, isAdmin, upload, processImage, createCategory);
router.put('/order', [auth, isAdmin, express.json()], updateCategoriesOrder);
router.put('/:id', auth, isAdmin, upload, processImage, updateCategory);
router.delete('/:id', auth, isAdmin, deleteCategory);

module.exports = router; 
 