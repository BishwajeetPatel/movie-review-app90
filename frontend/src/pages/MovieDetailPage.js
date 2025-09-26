import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { moviesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { 
  HeartIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon,
  PlayIcon,
  ShareIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const MovieDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMovieData();
      fetchReviews();
    }
  }, [id]);

  const fetchMovieData = async () => {
    try {
      setLoading(true);
      const response = await moviesAPI.getMovie(id);
      const movieData = response.data;
      
      setMovie(movieData.movie);
      setIsInWatchlist(movieData.isInWatchlist || false);
      
      // Check if user has already reviewed this movie
      if (user && movieData.reviews) {
        const existingReview = movieData.reviews.find(
          review => review.userId._id === user._id
        );
        setUserReview(existingReview || null);
      }
    } catch (err) {
      setError('Failed to load movie details');
      console.error('Movie fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await reviewsAPI.getMovieReviews(id);
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Reviews fetch error:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!user) {
      showError('Please login to manage your watchlist');
      return;
    }

    setWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        await moviesAPI.removeFromWatchlist(movie._id);
        setIsInWatchlist(false);
        showSuccess('Removed from watchlist');
      } else {
        await moviesAPI.addToWatchlist(movie._id);
        setIsInWatchlist(true);
        showSuccess('Added to watchlist');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update watchlist');
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (userReview) {
        // Update existing review
        const response = await reviewsAPI.updateReview(userReview._id, reviewData);
        setUserReview(response.data.review);
        showSuccess('Review updated successfully');
      } else {
        // Add new review
        const response = await reviewsAPI.addReview(movie._id, reviewData);
        setUserReview(response.data.review);
        showSuccess('Review added successfully');
      }
      
      setShowReviewForm(false);
      fetchMovieData(); // Refresh to get updated ratings
      fetchReviews(); // Refresh reviews list
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save review');
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      await reviewsAPI.deleteReview(reviewId);
      setUserReview(null);
      showSuccess('Review deleted successfully');
      fetchMovieData();
      fetchReviews();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatGenres = (genres) => {
    if (!genres || genres.length === 0) return '';
    return genres.join(', ');
  };

  const formatCast = (cast) => {
    if (!cast || cast.length === 0) return '';
    return cast.slice(0, 5).join(', ') + (cast.length > 5 ? '...' : '');
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading movie details..." />;
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error || 'Movie not found'}
          </p>
          <Link
            to="/movies"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 py-4">
        <Link
          to="/movies"
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Movies
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Movie Poster */}
            <div className="lg:col-span-1">
              <div className="relative">
                <img
                  src={movie.posterUrl || '/api/placeholder/400/600'}
                  alt={movie.title}
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/400/600';
                  }}
                />
                
                {/* Trailer Button */}
                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"
                  >
                    <PlayIcon className="h-16 w-16 text-white" />
                  </a>
                )}
              </div>
            </div>

            {/* Movie Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {movie.title}
                  </h1>

                  {/* Movie Meta */}
                  <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-600 dark:text-gray-400">
                    {movie.releaseYear && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        <span>{movie.releaseYear}</span>
                      </div>
                    )}
                    
                    {movie.duration && (
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        <span>{formatDuration(movie.duration)}</span>
                      </div>
                    )}
                    
                    {movie.genre && movie.genre.length > 0 && (
                      <div>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          {formatGenres(movie.genre)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-6">
                    <div>
                      <StarRating 
                        value={movie.averageRating || 0} 
                        readonly={true} 
                        size="large"
                        showValue={true}
                      />
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {movie.totalReviews} review{movie.totalReviews !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Synopsis */}
                  {movie.synopsis && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Synopsis
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {movie.synopsis}
                      </p>
                    </div>
                  )}

                  {/* Director and Cast */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {movie.director && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Director
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">{movie.director}</p>
                      </div>
                    )}
                    
                    {movie.cast && movie.cast.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Cast
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {formatCast(movie.cast)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  {user && (
                    <button
                      onClick={handleWatchlistToggle}
                      disabled={watchlistLoading}
                      className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isInWatchlist ? (
                        <HeartSolidIcon className="h-5 w-5" />
                      ) : (
                        <HeartIcon className="h-5 w-5" />
                      )}
                      <span>
                        {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      navigator.share?.({
                        title: movie.title,
                        text: `Check out ${movie.title} on MovieReview`,
                        url: window.location.href
                      }) || navigator.clipboard.writeText(window.location.href);
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                  >
                    <ShareIcon className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {userReview ? 'Your Review' : 'Write a Review'}
              </h3>
              
              {user ? (
                <>
                  {userReview && !showReviewForm ? (
                    <div className="space-y-4">
                      <StarRating value={userReview.rating} readonly={true} />
                      <p className="text-gray-700 dark:text-gray-300">
                        {userReview.reviewText}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium text-sm"
                        >
                          Edit Review
                        </button>
                        <button
                          onClick={() => handleReviewDelete(userReview._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 font-medium text-sm"
                        >
                          Delete Review
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ReviewForm
                      onSubmit={handleReviewSubmit}
                      onCancel={() => setShowReviewForm(false)}
                      initialData={userReview}
                      submitText={userReview ? 'Update Review' : 'Submit Review'}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Login to write a review
                  </p>
                  <Link
                    to="/login"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <ReviewList
              reviews={reviews}
              loading={reviewsLoading}
              currentUserId={user?._id}
              onReviewUpdate={fetchReviews}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;