import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersAPI } from '../services/api';

const MovieCard = ({ movie, isInWatchlist = false, onWatchlistToggle }) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState(isInWatchlist);

  // Update watchlist status when prop changes
  useEffect(() => {
    setWatchlistStatus(isInWatchlist);
  }, [isInWatchlist]);

  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showError('Please login to manage your watchlist');
      return;
    }

    setIsWatchlistLoading(true);
    
    try {
      if (watchlistStatus) {
        const result = await usersAPI.removeFromWatchlist(movie._id);
        if (result.success) {
          setWatchlistStatus(false);
          showSuccess('Removed from watchlist');
          if (onWatchlistToggle) {
            onWatchlistToggle(movie._id, false);
          }
        } else {
          throw new Error(result.error || 'Failed to remove from watchlist');
        }
      } else {
        const result = await usersAPI.addToWatchlist(movie._id);
        if (result.success) {
          setWatchlistStatus(true);
          showSuccess('Added to watchlist');
          if (onWatchlistToggle) {
            onWatchlistToggle(movie._id, true);
          }
        } else {
          throw new Error(result.error || 'Failed to add to watchlist');
        }
      }
    } catch (error) {
      console.error('Watchlist toggle error:', error);
      // Don't change the watchlist status if there's an error
      showError(error.message || 'Failed to update watchlist');
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="h-4 w-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  const formatGenres = (genres) => {
    if (!genres || genres.length === 0) return '';
    return genres.slice(0, 2).join(', ') + (genres.length > 2 ? '...' : '');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <Link to={`/movies/${movie._id}`} className="block">
        <div className="relative">
          <img
            src={movie.posterUrl || '/api/placeholder/300/450'}
            alt={movie.title}
            className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/api/placeholder/300/450';
            }}
          />
          
          {/* Watchlist button */}
          <button
            onClick={handleWatchlistToggle}
            disabled={isWatchlistLoading || !isAuthenticated}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
              isAuthenticated
                ? 'bg-black bg-opacity-50 hover:bg-opacity-75 disabled:opacity-50'
                : 'bg-gray-500 bg-opacity-50 cursor-not-allowed'
            }`}
            title={
              !isAuthenticated
                ? 'Login to add to watchlist'
                : watchlistStatus
                ? 'Remove from watchlist'
                : 'Add to watchlist'
            }
          >
            {isWatchlistLoading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : watchlistStatus ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-white" />
            )}
          </button>

          {/* Rating overlay */}
          {movie.averageRating > 0 && (
            <div className="absolute top-3 left-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
              {movie.averageRating.toFixed(1)}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {movie.title}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {movie.releaseYear}
            </span>
            <div className="flex items-center space-x-1">
              {movie.averageRating > 0 ? (
                <>
                  {renderStars(movie.averageRating)}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    ({movie.totalReviews || 0})
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  No reviews
                </span>
              )}
            </div>
          </div>

          {movie.genre && movie.genre.length > 0 && (
            <div className="mb-3">
              <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                {formatGenres(movie.genre)}
              </span>
            </div>
          )}

          {movie.director && (
            <div className="mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Director: <span className="font-medium">{movie.director}</span>
              </span>
            </div>
          )}

          {movie.synopsis && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {movie.synopsis}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {movie.duration && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </span>
              )}
              {movie.language && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {movie.language}
                </span>
              )}
            </div>
            
            <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
              View Details →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;