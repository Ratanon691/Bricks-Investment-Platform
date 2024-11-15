const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shares');
const { verifyToken, isUser } = require('../middleware/auth');

router.get('/', verifyToken, isUser, shareController.getUserShares);
router.get('/property/:propertyId', verifyToken, isUser, shareController.getUserSharesForProperty);
router.put('/property/:propertyId', verifyToken, isUser, shareController.updateShares);
router.get('/portfolio-value', verifyToken, isUser, shareController.getPortfolioValue);
router.get('/user-properties', verifyToken, isUser, shareController.getUserProperties);

module.exports = router;