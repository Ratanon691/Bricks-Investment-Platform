const db = require('../models');
const bcrypt = require('bcrypt');
require('dotenv').config();

// array of admin
const adminUsers = [
    {
        email: 'admin@bricks.com',
        firstName: 'Admin',
        lastName: 'Rattanon',
        password: 'Ratanon691',
        idNumber: '1234567890123',
        address: 'Bricks Admin Office',
        province: 'Bangkok',
        district: 'Watthana',
        subDistrict: 'Khlong Toei Nuea',
        zipCode: '10110'
    },{
        email: 'admin2@bricks.com',  
        firstName: 'Admin2',
        lastName: 'LastName',
        password: 'AdminPassword123',  
        idNumber: '1234567890124',    
        address: 'Bricks Admin Office 2',
        province: 'Bangkok',
        district: 'Watthana',
        subDistrict: 'Khlong Toei Nuea',
        zipCode: '10110'
    }
    //add another Obj to create another admin
];

async function createAdminUsers() {
    try {
        for (const adminData of adminUsers) {
            // Check if admin already exists
            const existingAdmin = await db.User.findOne({
                where: { email: adminData.email }
            });

            if (existingAdmin) {
                console.log(`Admin user ${adminData.email} already exists`);
                continue;
            }

            // Create admin account
            const hashedPassword = await bcrypt.hash(adminData.password, 10);
            
            const adminUser = await db.User.create({
                ...adminData,
                password: hashedPassword,
                role: 'admin'
            });
            //log list of admin created
            console.log('----------------------------------------');
            console.log(`Admin user ${adminData.email} created successfully!`);
            console.log(`Email: ${adminData.email}`);
            console.log(`Password: ${adminData.password}`);
            console.log('----------------------------------------');
        }
    } catch (error) {
        console.error('Error creating admin users:', error);
    }
    process.exit(0);
}

createAdminUsers();
//run  node script/createAdmin.js in terminal