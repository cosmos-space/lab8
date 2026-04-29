// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', productController.getAllProducts);
// Public product detail for shop page
router.get('/public/:id', productController.getProductById);
// Admin-only detail (if needed)
router.get('/:id', verifyToken, isAdmin, productController.getProductById);
router.post('/', verifyToken, isAdmin, upload.single('image'), productController.createProduct);
router.put('/:id/stock', verifyToken, isAdmin, productController.updateStock);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

// Archived and hard delete routes
router.get('/archived', verifyToken, isAdmin, productController.getArchivedProducts);
router.delete('/:id/hard', verifyToken, isAdmin, productController.hardDeleteProduct);

module.exports = router;