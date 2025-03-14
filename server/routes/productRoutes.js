const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { upload, processImage } = require('../middleware/uploadImage');

// Публичные маршруты
router.get('/categories', productController.getCategories);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/search', productController.searchProducts);
router.get('/', productController.getAllProducts);
router.get('/:productId', productController.getProductDetails);

// Маршруты для админ-панели (требуют аутентификации и прав админа)
router.post('/', [auth, adminAuth, upload, processImage], productController.createProduct);
router.put('/:productId', [auth, adminAuth, upload, processImage], productController.updateProduct);
router.delete('/:productId', auth, adminAuth, productController.deleteProduct);
router.patch('/:productId/availability', auth, adminAuth, productController.updateProductAvailability);

// Управление категориями (только для админа)
router.post('/categories', auth, adminAuth, productController.createCategory);
router.delete('/categories/:categoryId', auth, adminAuth, productController.deleteCategory);

module.exports = router; 