const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware');
const userController = require('../controllers/userController');

router.get('/me', verifyToken, userController.getMe);
router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.post('/', verifyToken, isAdmin, userController.createUserByAdmin);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;