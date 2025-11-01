const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Manager 1: Training Department
const manager1 = {
  username: 'manager_training',
  email: 'training@bput.com',
  password: 'Training@123',
  fullName: 'Training Manager',
  role: 'manager',
  department: 'training',
  isActive: true
};

// Manager 2: E-Governance Department
const manager2 = {
  username: 'manager_egovernance',
  email: 'egovernance@bput.com',
  password: 'EGov@123',
  fullName: 'E-Governance Manager',
  role: 'manager',
  department: 'egovernance',
  isActive: true
};

async function createManagers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'bput-hackathon'
    });

    console.log('Connected to MongoDB');

    // Check if managers already exist
    const existingManager1 = await User.findOne({ username: manager1.username });
    const existingManager2 = await User.findOne({ username: manager2.username });

    if (existingManager1) {
      console.log('Training Manager already exists');
    } else {
      const newManager1 = new User(manager1);
      await newManager1.save();
      console.log('✅ Training Manager created successfully!');
      console.log('   Username:', manager1.username);
      console.log('   Password:', manager1.password);
      console.log('   Email:', manager1.email);
      console.log('   Department:', manager1.department);
    }

    if (existingManager2) {
      console.log('E-Governance Manager already exists');
    } else {
      const newManager2 = new User(manager2);
      await newManager2.save();
      console.log('✅ E-Governance Manager created successfully!');
      console.log('   Username:', manager2.username);
      console.log('   Password:', manager2.password);
      console.log('   Email:', manager2.email);
      console.log('   Department:', manager2.department);
    }

    console.log('\n📋 Manager Login Credentials:');
    console.log('\n1. Training Manager:');
    console.log('   Username: manager_training');
    console.log('   Password: Training@123');
    console.log('\n2. E-Governance Manager:');
    console.log('   Username: manager_egovernance');
    console.log('   Password: EGov@123');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating managers:', error);
    process.exit(1);
  }
}

createManagers();
