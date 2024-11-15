const { sequelize, Sequelize } = require('../models')
const db = require('../models')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Op = Sequelize.Op

const getAllUser = async (req, res) => {
    const allUser = await db.User.findAll()
    res.status(200).send(allUser)
}

const getUserById = async (req, res) => {
    const targetId = req.params.id
    const targetUser = await db.User.findOne({ where: { id: targetId } })
    res.status(200).send(targetUser)
}

const createUser = async (req, res) => {
    try {
        const { email, firstName, lastName, password, idNumber, address, province, district, subDistrict, zipCode, role } = req.body;

        // Check if user already exists
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' }); //400 -> bad request, error from user input 
        }

        // Validate password
        if (password.length < 8 || password.length > 16 || !/\d/.test(password)) {
            return res.status(400).json({
                message: 'Password must be between 8 and 16 characters long and contain at least one number'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await db.User.create({
            email,
            firstName,
            lastName,
            password: hashedPassword,
            idNumber,
            address,
            province,
            district,
            subDistrict,
            zipCode,
            role: role || 'user'
        });

        // Check if JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            },
            token
        });
    } catch (error) {
        console.error('Error in createUser:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    const targetId = req.params.id
    const { email, firstName, lastName, password, idNumber, address, province, district, subDistrict, zipCode, role } = req.body
    await db.User.update({
        email: email,
        firstName: firstName,
        lastName: lastName,
        password: password,
        idNumber: idNumber,
        address: address,
        province: province,
        district: district,
        subDistrict: subDistrict,
        zipCode: zipCode,
        role: role
    }, {
        where: { id: targetId }
    })
    res.status(200).send({ msg: `User id ${targetId} was updated` })
}

const deleteUser = async (req, res) => {
    const targetId = req.params.id
    await db.User.destroy({
        where: { id: targetId }
    })
    res.status(204).send()
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; //get email, pass from body
        const user = await db.User.findOne({ where: { email } });//find email in db
        if (!user || !(await bcrypt.compare(password, user.password))) { //if no email or wrong pass return error
            return res.status(401).json({ message: 'Invalid email or password' }); //401 -> invalid creadential
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login successful',
            user: { id: user.id, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await db.User.findByPk(req.userId, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile' });
    }
};

module.exports = {
    getAllUser,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    getProfile
}