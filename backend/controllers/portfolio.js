const { sequelize, Sequelize } = require('../models')
const db = require('../models')

const Op = Sequelize.Op

const getUserPortfolio = async (req, res) => {
    const userId = req.params.userId;
    try {
        const transactions = await db.Transaction.findAll({
            where: { user_id: userId },
            include: [{
                model: db.Property,
                attributes: [
                    'id', 'propertyName', 'propertyType', 'pricePerShare',
                    'totalShares', 'address', 'province', 'district',
                    'subDistrict', 'annualDividend', 'latitude', 'longitude' // Added these fields
                ]
            }]
        });

        let totalAssets = 0;
        const propertyHoldings = {};
        const properties = []; // New array to hold unique properties with their details

        transactions.forEach(transaction => {
            const { type, shares, Property } = transaction;
            const currentPrice = Property.pricePerShare;

            if (type === 'buy') {
                totalAssets += shares * currentPrice;
                propertyHoldings[Property.id] = (propertyHoldings[Property.id] || 0) + shares;
            } else if (type === 'sell') {
                totalAssets -= shares * currentPrice;
                propertyHoldings[Property.id] = (propertyHoldings[Property.id] || 0) - shares;
            }

            // Add property to properties array if it's not already there
            if (!properties.find(p => p.id === Property.id)) {
                properties.push({
                    ...Property.toJSON(),
                    Shares: { amount: propertyHoldings[Property.id] || 0 }
                });
            }
        });

        // Update the shares amount in properties array
        properties.forEach(property => {
            property.Shares.amount = propertyHoldings[property.id] || 0;
        });

        // Only include properties where user still has shares
        const activeProperties = properties.filter(property => property.Shares.amount > 0);

        console.log('Properties with coordinates:', activeProperties.map(p => ({
            name: p.propertyName,
            lat: p.latitude,
            lng: p.longitude
        })));

        res.status(200).json(activeProperties);
    } catch (error) {
        console.error('Error in getUserPortfolio:', error);
        res.status(500).json({ message: "Error fetching portfolio", error: error.message });
    }
};
const getPortfolioByProperty = async (req, res) => { // Gets transactions for a specific property
    const { userId, propertyId } = req.params;
    try {
        const transactions = await db.Transaction.findAll({
            where: { 
                user_id: userId,
                property_id: propertyId
            },
            include: [{ model: db.Property }]
        });

        let totalShares = 0;
        let totalInvestment = 0;

        transactions.forEach(transaction => {
            const { type, shares, amount } = transaction;
            if (type === 'buy') {
                totalShares += shares;
                totalInvestment += amount;
            } else if (type === 'sell') {
                totalShares -= shares;
                totalInvestment -= amount;
            }
        });

        const averagePurchasePrice = totalShares > 0 ? totalInvestment / totalShares : 0;

        res.status(200).json({ 
            propertyId, 
            totalShares, 
            totalInvestment, 
            averagePurchasePrice 
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching property portfolio", error: error.message });
    }
}
//Breaks down investments by category
const getInvestmentByPropertyType = async (req, res) => {
    const userId = req.params.userId;
    try {
        const transactions = await db.Transaction.findAll({
            where: { user_id: userId },
            include: [{ model: db.Property }]
        });

        const investmentByType = {
            Condo: 0,
            House: 0,
            Land: 0,
            Others: 0
        };

        transactions.forEach(transaction => {
            const { type, amount, Property } = transaction;
            const propertyType = Property.propertyType;

            if (type === 'buy') {
                investmentByType[propertyType] += amount;
            } else if (type === 'sell') {
                investmentByType[propertyType] -= amount;
            }
        });

        const totalInvestment = Object.values(investmentByType).reduce((sum, value) => sum + value, 0);

        res.status(200).json({ 
            investmentByType,
            totalInvestment
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching investment by property type", error: error.message });
    }
}

module.exports = {
    getUserPortfolio,
    getPortfolioByProperty,
    getInvestmentByPropertyType
}