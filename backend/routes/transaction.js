const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction');
const { verifyToken, isUser } = require('../middleware/auth');

router.post('/', verifyToken, isUser, transactionController.createTransaction);
router.get('/', verifyToken, isUser, transactionController.getUserTransactions);
router.get('/buy', verifyToken, isUser, transactionController.getBuyTransaction);
router.get('/sell', verifyToken, isUser, transactionController.getSellTransaction);
router.get('/user/:userId/property/:propertyId/shares', verifyToken, isUser, transactionController.getUserSharesForProperty); // Get user shares for a specific property
router.get('/all', verifyToken, isUser, transactionController.getAllTransaction);

module.exports = router;