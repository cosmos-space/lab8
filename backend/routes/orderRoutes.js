const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware');
const orderController = require('../controllers/orderController');

router.post('/checkout', verifyToken, orderController.checkout);
router.put('/:id/status', verifyToken, isAdmin, orderController.updateStatus);

module.exports = router;