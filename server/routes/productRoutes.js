const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/authMiddleware');
const { uploadImage, processImage } = require('../middleware/uploadImage');
const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage
} = require('../controllers/productController');

// Публичные маршруты
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProductById);

// Защищенные маршруты (требуют аутентификации и прав админа)
router.post('/', auth, isAdmin, uploadImage, createProduct);
router.put('/:id', auth, isAdmin, uploadImage, updateProduct);
router.delete('/:id', auth, isAdmin, deleteProduct);
router.delete('/:id/image', auth, isAdmin, deleteProductImage);

module.exports = router; 