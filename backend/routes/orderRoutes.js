const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware');
const orderController = require('../controllers/orderController');

router.post('/checkout', verifyToken, orderController.checkout);
router.get('/my', verifyToken, orderController.getMyOrders);
router.delete('/my/:id', verifyToken, orderController.deleteMyOrder);
router.get('/', verifyToken, isAdmin, orderController.getAll);
router.put('/:id/status', verifyToken, isAdmin, orderController.updateStatus);

module.exports = router;