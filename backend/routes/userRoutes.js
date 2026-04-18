const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware');
const userController = require('../controllers/userController');

router.get('/', verifyToken, isAdmin, userController.getAllUsers);

module.exports = router;