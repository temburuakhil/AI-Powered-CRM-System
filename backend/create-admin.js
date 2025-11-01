const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bput-hackathon';

const createAdminUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@bput.com',
      password: 'Admin@123', // Change this password after first login
      fullName: 'System Administrator',
      role: 'admin'
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('Username: admin');
    console.log('Email: admin@bput.com');
    console.log('Password: Admin@123');
    console.log('-----------------------------------');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
