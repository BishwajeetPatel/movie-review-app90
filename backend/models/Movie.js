const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  genre: [{
    type: String,
    required: true
  }],
  releaseYear: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 5
  },
  director: {
    type: String,
    required: true,
    trim: true
  },
  cast: [{
    type: String,
    trim: true
  }],
  synopsis: {
    type: String,
    required: true,
    maxlength: 2000
  },
  posterUrl: {
    type: String,
    default: 'https://via.placeholder.com/300x450?text=No+Poster'
  },
  trailerUrl: {
    type: String,
    default: ''
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  language: {
    type: String,
    default: 'English'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
movieSchema.index({ title: 'text', synopsis: 'text', director: 'text' });
movieSchema.index({ genre: 1 });
movieSchema.index({ releaseYear: 1 });
movieSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Movie', movieSchema);
