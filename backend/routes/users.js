// routes/users.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchlist', 'title posterUrl releaseYear averageRating')
      .select('-password');

    const reviewCount = await Review.countDocuments({ 
      userId: req.user._id, 
      isActive: true 
    });

    res.json({
      ...user.toObject(),
      reviewCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('username').optional().trim().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('favoriteGenres').optional().isArray().withMessage('Favorite genres must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = ['username', 'bio', 'profilePicture', 'favoriteGenres'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Username already taken' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// Get user's watchlist
router.get('/watchlist', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('watchlist', 'title posterUrl releaseYear averageRating genre director');

    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add movie to watchlist
router.post('/watchlist/:movieId', authenticateToken, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie || !movie.isActive) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.watchlist.includes(req.params.movieId)) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    user.watchlist.push(req.params.movieId);
    await user.save();

    res.json({ message: 'Movie added to watchlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove movie from watchlist
router.delete('/watchlist/:movieId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.watchlist = user.watchlist.filter(id => id.toString() !== req.params.movieId);
    await user.save();

    res.json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's reviews
router.get('/reviews', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ 
      userId: req.user._id, 
      isActive: true 
    })
      .populate('movieId', 'title posterUrl releaseYear')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ 
      userId: req.user._id, 
      isActive: true 
    });

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;