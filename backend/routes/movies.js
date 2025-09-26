// routes/movies.js
const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all movies with pagination, search, and filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  query('search').optional().trim(),
  query('genre').optional().trim(),
  query('year').optional().isInt({ min: 1900 }),
  query('minRating').optional().isFloat({ min: 0, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = { isActive: true };

    // Search
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Genre filter
    if (req.query.genre) {
      filter.genre = { $in: [req.query.genre] };
    }

    // Year filter
    if (req.query.year) {
      filter.releaseYear = parseInt(req.query.year);
    }

    // Rating filter
    if (req.query.minRating) {
      filter.averageRating = { $gte: parseFloat(req.query.minRating) };
    }

    // Sort options
    let sortOption = {};
    switch (req.query.sortBy) {
      case 'rating':
        sortOption = { averageRating: -1 };
        break;
      case 'year':
        sortOption = { releaseYear: -1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const movies = await Movie.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Movie.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      movies,
      pagination: {
        currentPage: page,
        totalPages,
        totalMovies: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single movie with reviews
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie || !movie.isActive) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const reviews = await Review.find({ movieId: req.params.id, isActive: true })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(10);

    // Check if user has this movie in watchlist
    let isInWatchlist = false;
    if (req.user) {
      isInWatchlist = req.user.watchlist.includes(req.params.id);
    }

    res.json({
      ...movie.toObject(),
      reviews,
      isInWatchlist
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add new movie (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('genre').isArray({ min: 1 }).withMessage('At least one genre is required'),
  body('releaseYear').isInt({ min: 1900 }).withMessage('Valid release year is required'),
  body('director').trim().notEmpty().withMessage('Director is required'),
  body('synopsis').trim().notEmpty().withMessage('Synopsis is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration in minutes is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const movie = new Movie(req.body);
    await movie.save();

    res.status(201).json({ message: 'Movie added successfully', movie });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update movie (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({ message: 'Movie updated successfully', movie });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete movie (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get featured movies
router.get('/featured/trending', async (req, res) => {
  try {
    const featuredMovies = await Movie.find({ isActive: true })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(6)
      .select('-__v');

    const recentMovies = await Movie.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('-__v');

    res.json({
      featured: featuredMovies,
      recent: recentMovies
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;