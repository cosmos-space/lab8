const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware');
const userController = require('../controllers/userController');

router.get('/me', verifyToken, userController.getMe);
router.put('/me', verifyToken, userController.updateMe);
router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.post('/', verifyToken, isAdmin, userController.createUserByAdmin);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);
router.put('/:id/role', verifyToken, isAdmin, userController.updateUserRole);

// Archived and hard delete routes
router.get('/archived', verifyToken, isAdmin, userController.getArchivedUsers);
router.delete('/:id/hard', verifyToken, isAdmin, userController.hardDeleteUser);

module.exports = router;