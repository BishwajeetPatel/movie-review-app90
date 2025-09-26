// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure user can only review a movie once
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

// Update movie average rating when review is saved/updated
reviewSchema.post('save', async function() {
  await updateMovieRating(this.movieId);
});

reviewSchema.post('remove', async function() {
  await updateMovieRating(this.movieId);
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await updateMovieRating(doc.movieId);
  }
});

async function updateMovieRating(movieId) {
  const Movie = mongoose.model('Movie');
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { movieId: movieId, isActive: true } },
    {
      $group: {
        _id: '$movieId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  } else {
    await Movie.findByIdAndUpdate(movieId, {
      averageRating: 0,
      totalReviews: 0
    });
  }
}

module.exports = mongoose.model('Review', reviewSchema);