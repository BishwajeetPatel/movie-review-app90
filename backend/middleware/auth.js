// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    } else {
      return res.status(500).json({ message: 'Token verification failed.' });
    }
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  next();
};

// Optional authentication - sets req.user if token is valid, but doesn't fail if not
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore token errors for optional auth
  }

  next();
};

// Check if user owns the resource or is admin
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField];
    
    if (req.user.isAdmin || req.user._id.toString() === resourceUserId) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. You can only access your own resources.' });
    }
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth,
  requireOwnershipOrAdmin
};