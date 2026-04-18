// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', productController.getAllProducts);
router.post('/', verifyToken, isAdmin, upload.single('image'), productController.createProduct);

module.exports = router;