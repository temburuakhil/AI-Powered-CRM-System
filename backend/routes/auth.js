const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passport = require('passport');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
};

// @route   POST /api/auth/login
// @desc    Login user (admin or manager)
// @access  Public
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: info.message || 'Login failed' });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Login error', error: err.message });
      }
      
      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          department: user.department
        }
      });
    });
  })(req, res, next);
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', isAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', isAuthenticated, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      department: req.user.department
    }
  });
});

// @route   POST /api/auth/create-manager
// @desc    Create a new manager (admin only)
// @access  Private (Admin)
router.post('/create-manager', isAdmin, async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validate input
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }

    // Create new manager
    const newManager = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      fullName,
      role: 'manager',
      createdBy: req.user._id
    });

    await newManager.save();

    res.status(201).json({
      success: true,
      message: 'Manager created successfully',
      manager: {
        id: newManager._id,
        username: newManager.username,
        email: newManager.email,
        fullName: newManager.fullName,
        role: newManager.role
      }
    });
  } catch (error) {
    console.error('Create manager error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create manager',
      error: error.message 
    });
  }
});

// @route   GET /api/auth/managers
// @desc    Get all managers (admin only)
// @access  Private (Admin)
router.get('/managers', isAdmin, async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' })
      .select('-password')
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      managers
    });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch managers',
      error: error.message 
    });
  }
});

// @route   PUT /api/auth/manager/:id/toggle-status
// @desc    Activate/deactivate manager (admin only)
// @access  Private (Admin)
router.put('/manager/:id/toggle-status', isAdmin, async (req, res) => {
  try {
    const manager = await User.findById(req.params.id);
    
    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    if (manager.role !== 'manager') {
      return res.status(400).json({ success: false, message: 'User is not a manager' });
    }

    manager.isActive = !manager.isActive;
    await manager.save();

    res.json({
      success: true,
      message: `Manager ${manager.isActive ? 'activated' : 'deactivated'} successfully`,
      manager: {
        id: manager._id,
        username: manager.username,
        isActive: manager.isActive
      }
    });
  } catch (error) {
    console.error('Toggle manager status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update manager status',
      error: error.message 
    });
  }
});

// @route   DELETE /api/auth/manager/:id
// @desc    Delete manager (admin only)
// @access  Private (Admin)
router.delete('/manager/:id', isAdmin, async (req, res) => {
  try {
    const manager = await User.findById(req.params.id);
    
    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    if (manager.role !== 'manager') {
      return res.status(400).json({ success: false, message: 'User is not a manager' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Manager deleted successfully'
    });
  } catch (error) {
    console.error('Delete manager error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete manager',
      error: error.message 
    });
  }
});

module.exports = { router, isAuthenticated, isAdmin };
