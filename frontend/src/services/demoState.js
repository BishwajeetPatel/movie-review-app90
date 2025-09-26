// Demo State Manager - for persistent demo data across components
class DemoStateManager {
    constructor() {
      this.state = {
        reviews: [],
        watchlist: [],
        userProfile: {
          _id: 'demo-user-1',
          username: 'Demo User',
          email: 'demo@test.com',
          bio: 'Movie enthusiast and avid reviewer',
          favoriteGenres: ['Action', 'Drama', 'Sci-Fi'],
          createdAt: '2023-01-01T00:00:00.000Z'
        }
      };
    }
  
    // Review methods
    addReview(movieId, reviewData, movieTitle) {
      const review = {
        _id: 'demo-review-' + Date.now(),
        userId: {
          _id: this.state.userProfile._id,
          username: this.state.userProfile.username
        },
        movieId: {
          _id: movieId,
          title: movieTitle
        },
        rating: reviewData.rating,
        reviewText: reviewData.reviewText,
        timestamp: new Date().toISOString(),
        isEdited: false
      };
      
      this.state.reviews.unshift(review); // Add to beginning
      return review;
    }
  
    updateReview(reviewId, reviewData) {
      const reviewIndex = this.state.reviews.findIndex(r => r._id === reviewId);
      if (reviewIndex !== -1) {
        this.state.reviews[reviewIndex] = {
          ...this.state.reviews[reviewIndex],
          rating: reviewData.rating,
          reviewText: reviewData.reviewText,
          isEdited: true,
          editedAt: new Date().toISOString()
        };
        return this.state.reviews[reviewIndex];
      }
      return null;
    }
  
    deleteReview(reviewId) {
      this.state.reviews = this.state.reviews.filter(r => r._id !== reviewId);
      return true;
    }
  
    getUserReviews() {
      return {
        reviews: this.state.reviews,
        pagination: {
          currentPage: 1,
          totalPages: Math.ceil(this.state.reviews.length / 10),
          totalReviews: this.state.reviews.length
        }
      };
    }
  
    getMovieReviews(movieId) {
      const movieReviews = this.state.reviews.filter(r => 
        r.movieId._id === movieId || r.movieId === movieId
      );
      return {
        reviews: movieReviews,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalReviews: movieReviews.length
        }
      };
    }
  
    // Watchlist methods
    addToWatchlist(movieId, movieData) {
      if (!this.state.watchlist.find(m => m._id === movieId)) {
        this.state.watchlist.push({
          _id: movieId,
          ...movieData,
          addedAt: new Date().toISOString()
        });
      }
      return true;
    }
  
    removeFromWatchlist(movieId) {
      this.state.watchlist = this.state.watchlist.filter(m => m._id !== movieId);
      return true;
    }
  
    getWatchlist() {
      return this.state.watchlist;
    }
  
    isInWatchlist(movieId) {
      return this.state.watchlist.some(m => m._id === movieId);
    }
  
    // Profile methods
    updateProfile(userData) {
      this.state.userProfile = {
        ...this.state.userProfile,
        ...userData
      };
      return this.state.userProfile;
    }
  
    getProfile() {
      return {
        user: this.state.userProfile,
        reviewCount: this.state.reviews.length
      };
    }
  
    // Get user stats
    getUserStats() {
      const avgRating = this.state.reviews.length > 0 
        ? (this.state.reviews.reduce((sum, r) => sum + r.rating, 0) / this.state.reviews.length).toFixed(1)
        : 0;
      
      return {
        totalReviews: this.state.reviews.length,
        averageRating: parseFloat(avgRating),
        watchlistCount: this.state.watchlist.length
      };
    }
  
    // Clear all data (for logout)
    clearState() {
      this.state = {
        reviews: [],
        watchlist: [],
        userProfile: {
          _id: 'demo-user-1',
          username: 'Demo User',
          email: 'demo@test.com',
          bio: 'Movie enthusiast and avid reviewer',
          favoriteGenres: ['Action', 'Drama', 'Sci-Fi'],
          createdAt: '2023-01-01T00:00:00.000Z'
        }
      };
    }
  }
  
  // Create global instance
  const demoState = new DemoStateManager();
  
  export default demoState;