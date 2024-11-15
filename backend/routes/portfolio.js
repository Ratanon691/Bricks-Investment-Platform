const express = require('express')
const router = express.Router()
const portfolioController = require('../controllers/portfolio')

router.get('/user/:userId', portfolioController.getUserPortfolio)
router.get('/user/:userId/property/:propertyId', portfolioController.getPortfolioByProperty)
router.get('/user/:userId/investment-by-type', portfolioController.getInvestmentByPropertyType)

module.exports = router