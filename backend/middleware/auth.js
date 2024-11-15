// middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../models');

exports.verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
    
        if (!token) {
            console.log('No token provided');
            return res.status(403).json({ message: 'No token provided' });
        }
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await db.User.findByPk(decoded.id);
        
        if (!user) {
            console.log('User not found:', decoded.id);
            return res.status(404).json({ message: 'User not found' });
        }

        // Set id/user
        req.userId = user.id;
        req.user = user;
        
        console.log('Token verified for user:', user.id);
        next();
    } catch (err) {
        console.log('Token verification failed:', err);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

exports.isAdmin = async (req, res, next) => {
    try {
        const user = req.user; // Use the already fetched user
        if (user.role !== 'admin') {
            console.log('Non-admin user attempted admin action:', user.id);
            return res.status(403).json({ message: 'Require Admin Role!' });
        }
        console.log('Admin verified:', user.id);
        next();
    } catch (error) {
        console.error('Error in isAdmin middleware:', error);
        res.status(500).json({ message: 'Unable to validate User role!' });
    }
};

exports.isUser = async (req, res, next) => {
    try {
        const user = req.user; // Use the already fetched user
        if (user.role === 'guest') {
            console.log('Guest user attempted action:', user.id);
            return res.status(403).json({ message: 'Require User Role!' });
        }
        console.log('User verified:', user.id);
        next();
    } catch (error) {
        console.error('Error in isUser middleware:', error);
        res.status(500).json({ message: 'Unable to validate User role!' });
    }
};