const { sequelize, Sequelize } = require('../models');
const db = require('../models');

const Op = Sequelize.Op;

const getAllTransaction = async (req, res) => {
    try {
        const allTransaction = await db.Transaction.findAll();
        res.status(200).json(allTransaction);
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
    }
};

const getBuyTransaction = async (req, res) => {
    try {
        const buyTransaction = await db.Transaction.findAll({ where: { type: ['buy', 'Buy'] } });
        res.status(200).json(buyTransaction);
    } catch (error) {
        console.error('Error fetching buy transactions:', error);
        res.status(500).json({ message: 'Failed to fetch buy transactions', error: error.message });
    }
};

const getSellTransaction = async (req, res) => {
    try {
        const sellTransaction = await db.Transaction.findAll({ where: { type: ['sell', 'Sell'] } });
        res.status(200).json(sellTransaction);
    } catch (error) {
        console.error('Error fetching sell transactions:', error);
        res.status(500).json({ message: 'Failed to fetch sell transactions', error: error.message });
    }
};

const createTransaction = async (req, res) => {
  const t = await sequelize.transaction();

  try {
      console.log('Received transaction request:', req.body);
      const { type, shares, amount, propertyId, userId } = req.body;

      console.log('Validating user with ID:', userId);  

      const user = await db.User.findByPk(userId);
      console.log('User found:', user ? `ID: ${user.id}, Role: ${user.role}` : 'Not found');
      if (!user) {
          console.log('User not found');
          await t.rollback();
          return res.status(404).json({ message: 'User not found' });
      }
      if (user.role !== 'user') {
          console.log('Invalid user role:', user.role);
          await t.rollback();
          return res.status(403).json({ message: 'Unauthorized' });
      }

      // Get property
      const property = await db.Property.findByPk(propertyId);
      console.log('Property found:', property ? `ID: ${property.id}, Available shares: ${property.availableShares}` : 'Not found');
      if (!property) {
          console.log('Property not found');
          await t.rollback();
          return res.status(404).json({ message: 'Property not found' });
      }

      // Validate available shares amount
      if (type.toLowerCase() === 'buy' && shares > property.availableShares) {
          console.log('Not enough shares available');
          await t.rollback();
          return res.status(400).json({ message: 'Not enough shares available' });
      }

      // Get or create user shares
      let userShares = await db.Shares.findOne({
          where: { userId: userId, propertyId: propertyId },
          transaction: t
      });

      console.log('Existing user shares:', userShares ? userShares.amount : 'None');
      if (!userShares) {
          userShares = await db.Shares.create({
              userId: userId,
              propertyId: propertyId,
              amount: 0
          }, { transaction: t });
          console.log('Created new user shares record');
      }

      // Update user shares
      if (type.toLowerCase() === 'buy') {
          userShares.amount += shares;
          property.availableShares -= shares;
          console.log(`Buying ${shares} shares`);
      } else {
          if (userShares.amount < shares) {
              console.log('Not enough shares to sell');
              await t.rollback();
              return res.status(400).json({ message: 'Not enough shares to sell' });
          }
          userShares.amount -= shares;
          property.availableShares += shares;
          console.log(`Selling ${shares} shares`);
      }

      await userShares.save({ transaction: t });
      await property.save({ transaction: t });

      // Create transaction
      const newTransaction = await db.Transaction.create({
          type,
          shares,
          amount,
          property_id: propertyId,
          user_id: userId
      }, { transaction: t });

      console.log('New transaction created:', newTransaction.id);
      await t.commit();
      console.log('Transaction committed successfully');
      res.status(201).json(newTransaction);
  } catch (error) {
      await t.rollback();
      console.error('Error creating transaction:', error);
      res.status(500).json({ message: 'Failed to create transaction', error: error.message });
  }
};

const getUserTransactions = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const userId = req.user.id;
        console.log('Fetching transactions for user:', userId);

        const transactions = await db.Transaction.findAll({
            where: { user_id: userId },
            include: [{
                model: db.Property,
                as: 'Property',
                attributes: ['id', 'propertyName', 'pricePerShare']
            }],
            order: [['createdAt', 'DESC']]
        });

        // Calc amount and fee for each transaction
        const processedTransactions = transactions.map(transaction => {
            const rawTransaction = transaction.get({ plain: true });
            const totalAmount = parseFloat(rawTransaction.amount);
            const actualAmount = totalAmount / 1.02; 
            const fee = totalAmount - actualAmount; 

            return {
                ...rawTransaction,
                actualAmount: Math.round(actualAmount * 100) / 100, // Round to 2 decimal places
                fee: Math.round(fee * 100) / 100 
            };
        });
        res.status(200).json(processedTransactions);
    } catch (error) {
        console.error('Error fetching user transactions:', error);
        res.status(500).json({ 
            message: 'Failed to fetch transactions', 
            error: error.message,
            transactions: []
        });
    }
};
const getUserSharesForProperty = async (req, res) => {
    try {
        const { userId, propertyId } = req.params;

        const buyShares = await db.Transaction.sum('shares', {
            where: { user_id: userId, property_id: propertyId, type: ['buy', 'Buy'] }
        }) || 0;

        const sellShares = await db.Transaction.sum('shares', {
            where: { user_id: userId, property_id: propertyId, type: ['sell', 'Sell'] }
        }) || 0;

        const userShares = buyShares - sellShares;

        res.status(200).json({ shares: userShares });
    } catch (error) {
        console.error('Error fetching user shares for property:', error);
        res.status(500).json({ message: 'Failed to fetch user shares', error: error.message });
    }
};

module.exports = {
    getAllTransaction,
    getBuyTransaction,
    getSellTransaction,
    createTransaction,
    getUserTransactions,
    getUserSharesForProperty
};