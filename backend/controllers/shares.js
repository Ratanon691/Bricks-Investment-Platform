const { sequelize, Sequelize } = require('../models');
const db = require('../models');

const Op = Sequelize.Op;

const getUserShares = async (req, res) => {
    try {
        const userId = req.user.id; 
        const shares = await db.Shares.findAll({
            where: { userId: userId },
            include: [{ 
                model: db.Property,
                as: 'property',
                attributes: ['propertyName', 'propertyType', 'pricePerShare'] 
            }]
        });        
        res.status(200).json(shares);
    } catch (error) {
        console.error('Error fetching user shares:', error);
        res.status(500).json({ message: 'Failed to fetch user shares', error: error.message });
    }
};

const getUserSharesForProperty = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { propertyId } = req.params;
        const shares = await db.Shares.findOne({
            where: { userId: userId, propertyId: propertyId },
            include: [{ 
                model: db.Property,
                as: 'property',
                attributes: ['propertyName', 'propertyType', 'pricePerShare'] 
            }]
        });        
        if (shares) {
            res.status(200).json({ shares: shares.amount });
        } else {
            res.status(200).json({ shares: 0 });
        }
    } catch (error) {
        console.error('Error fetching user shares for property:', error);
        res.status(500).json({ message: 'Failed to fetch user shares', error: error.message });
    }
};

const updateShares = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id; 
        const { propertyId } = req.params;
        const { amount, averagePurchasePrice } = req.body;
        
        const [shares, created] = await db.Shares.findOrCreate({
            where: { userId: userId, propertyId: propertyId },
            defaults: { amount: 0, averagePurchasePrice: 0 },
            transaction: t
        });

        shares.amount = amount;
        shares.averagePurchasePrice = averagePurchasePrice;
        await shares.save({ transaction: t });

        await t.commit();
        res.status(200).json(shares);
    } catch (error) {
        await t.rollback();
        console.error('Error updating shares:', error);
        res.status(500).json({ message: 'Failed to update shares', error: error.message });
    }
};

const getPortfolioValue = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Calculating portfolio value for user:', userId);

        
        const shares = await db.Shares.findAll({
            where: { userId: userId },
            include: [{
                model: db.Property,
                as: 'property', 
                attributes: ['id', 'pricePerShare', 'propertyName'],
                required: true 
            }],
            raw: true 
        });

        console.log('Found shares:', shares); 

        const portfolioValue = shares.reduce((total, share) => {
            const shareValue = parseFloat(share['property.pricePerShare']) * share.amount;
            return total + shareValue;
        }, 0);

        console.log('Calculated portfolio value:', portfolioValue); 
        res.status(200).json({ 
            portfolioValue: portfolioValue,
            shares: shares 
        });
    } catch (error) {
        console.error('Error calculating portfolio value:', error);
        res.status(500).json({ 
            message: 'Error calculating portfolio value',
            error: error.message,
            portfolioValue: 0 
        });
    }
};

const getUserProperties = async (req, res) => {
    try {     
        const userId = req.user.id;       
        const userProperties = await db.Property.findAll({
            include: [{
                model: db.Shares,
                as: 'propertyShares',
                where: { 
                    userId: userId,
                    amount: {
                        [db.Sequelize.Op.gt]: 0  // Only get properties where user owns shares
                    }
                },
                attributes: ['amount']
            }],
            attributes: [
                'id',
                'propertyType',
                'propertyName',
                'pricePerShare',
                'propertyValuation',
                'totalShares',
                'address',
                'province',
                'district',
                'subDistrict',
                'zipCode',
                'annualDividend',
                'size',
                'bedrooms',
                'bathrooms'
            ]
        });

        // Format the response to match frontend expectations
        const formattedProperties = userProperties.map(property => {
            const plainProperty = property.get({ plain: true });
            return {
                ...plainProperty,
                Shares: plainProperty.propertyShares[0], 
                propertyShares: undefined 
            };
        });

        res.status(200).json(formattedProperties);
    } catch (error) {
        console.error('Error fetching user properties:', error);
        res.status(500).json({ 
            message: 'Failed to fetch user properties', 
            error: error.message 
        });
    }
};

module.exports = {
    getUserShares,
    getUserSharesForProperty,
    updateShares,
    getPortfolioValue,
    getUserProperties
};