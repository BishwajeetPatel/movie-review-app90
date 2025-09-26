
// routes/reviews.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Get reviews for a movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ 
      movieId: req.params.movieId, 
      isActive: true 
    })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ 
      movieId: req.params.movieId, 
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

// Add review for a movie
router.post('/movie/:movieId', authenticateToken, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText').trim().isLength({ min: 10, max: 1000 }).withMessage('Review must be 10-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if movie exists
    const movie = await Movie.findById(req.params.movieId);
    if (!movie || !movie.isActive) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({
      userId: req.user._id,
      movieId: req.params.movieId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    const review = new Review({
      userId: req.user._id,
      movieId: req.params.movieId,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });

    await review.save();
    await review.populate('userId', 'username profilePicture');

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update own review
router.put('/:id', authenticateToken, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewText').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Review must be 10-1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const review = await Review.findById(req.params.id);
    if (!review || !review.isActive) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (review.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body, 
        isEdited: true, 
        editedAt: new Date() 
      },
      { new: true, runValidators: true }
    ).populate('userId', 'username profilePicture');

    res.json({ message: 'Review updated successfully', review: updatedReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete own review
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review || !review.isActive) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check ownership
    if (review.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await Review.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;