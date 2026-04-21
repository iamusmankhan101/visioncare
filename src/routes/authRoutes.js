const express = require('express');
const router = express.Router();

// Mock authentication routes
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Mock authentication logic
    if (email && password) {
      res.json({
        success: true,
        message: 'Login successful',
        token: 'mock-jwt-token',
        user: {
          id: 1,
          email: email,
          name: 'Test User'
        }
      });
    } else {
      res.status(400).json({ message: 'Email and password required' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

router.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Mock registration logic
    if (email && password && name) {
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: 2,
          email: email,
          name: name
        }
      });
    } else {
      res.status(400).json({ message: 'Email, password, and name required' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Registration error', error: error.message });
  }
});

module.exports = router;
