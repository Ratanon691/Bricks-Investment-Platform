const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);

// Protected routes
router.get('/profile', authMiddleware.verifyToken, userController.getProfile);
router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getAllUser);
router.get('/:id', authMiddleware.verifyToken, authMiddleware.isUser, userController.getUserById);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isUser, userController.updateUser);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.deleteUser);

module.exports = router;