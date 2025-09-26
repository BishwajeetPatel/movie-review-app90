import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { HeartIcon, FilmIcon } from '@heroicons/react/24/outline';

const WatchlistPage = () => {
  const { showSuccess, showError } = useToast();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usersAPI.getWatchlist();
      setWatchlist(response.data || []);
    } catch (err) {
      setError('Failed to load watchlist');
      console.error('Watchlist fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = async (movieId, isAdded) => {
    try {
      if (!isAdded) {
        // Remove from watchlist
        await usersAPI.removeFromWatchlist(movieId);
        setWatchlist(prev => prev.filter(movie => movie._id !== movieId));
        showSuccess('Removed from watchlist');
      }
    } catch (error) {
      showError('Failed to update watchlist');
    }
  };

  const clearWatchlist = async () => {
    const confirmed = window.confirm('Are you sure you want to remove all movies from your watchlist?');
    
    if (!confirmed) return;

    try {
      // Remove all movies from watchlist
      await Promise.all(
        watchlist.map(movie => usersAPI.removeFromWatchlist(movie._id))
      );
      
      setWatchlist([]);
      showSuccess('Watchlist cleared');
    } catch (error) {
      showError('Failed to clear watchlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="large" text="Loading your watchlist..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <HeartIcon className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Watchlist
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {watchlist.length} movie{watchlist.length !== 1 ? 's' : ''} in your watchlist
              </p>
            </div>
          </div>

          {watchlist.length > 0 && (
            <button
              onClick={clearWatchlist}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchWatchlist}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Watchlist Content */}
        {!error && (
          <>
            {watchlist.length > 0 ? (
              <>
                {/* Movies Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {watchlist.map((movie) => (
                    <MovieCard
                      key={movie._id}
                      movie={movie}
                      isInWatchlist={true}
                      onWatchlistToggle={handleWatchlistToggle}
                    />
                  ))}
                </div>

                {/* Watchlist Stats */}
                <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Watchlist Statistics
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Movies */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                        {watchlist.length}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Total Movies
                      </div>
                    </div>

                    {/* Average Rating */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                        {watchlist.length > 0 
                          ? (watchlist.reduce((sum, movie) => sum + (movie.averageRating || 0), 0) / watchlist.length).toFixed(1)
                          : '0'
                        }
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Average Rating
                      </div>
                    </div>

                    {/* Most Common Genre */}
                    <div className="text-center">
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2 min-h-[3rem] flex items-center justify-center">
                        {(() => {
                          const genreCounts = {};
                          watchlist.forEach(movie => {
                            if (movie.genre) {
                              movie.genre.forEach(genre => {
                                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                              });
                            }
                          });
                          const topGenre = Object.keys(genreCounts).reduce((a, b) => 
                            genreCounts[a] > genreCounts[b] ? a : b, ''
                          );
                          return topGenre || 'None';
                        })()}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Top Genre
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 text-center">
                  <div className="space-x-4">
                    <Link
                      to="/movies"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                    >
                      Discover More Movies
                    </Link>
                    <Link
                      to="/profile"
                      className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <HeartIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Your watchlist is empty
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Start building your watchlist by adding movies you want to watch. 
                    Browse our collection and click the heart icon on any movie to add it here.
                  </p>
                  
                  <div className="space-y-4">
                    <Link
                      to="/movies"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-block"
                    >
                      Browse Movies
                    </Link>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>Looking for recommendations? Check out:</p>
                      <div className="flex justify-center space-x-4 mt-2">
                        <Link
                          to="/movies?sortBy=rating"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          Top Rated
                        </Link>
                        <span>•</span>
                        <Link
                          to="/movies?sortBy=trending"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          Trending
                        </Link>
                        <span>•</span>
                        <Link
                          to="/movies?sortBy=newest"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          Latest
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Highlights */}
                <div className="mt-16 max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <HeartIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Save for Later
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Keep track of movies you want to watch by adding them to your watchlist
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <FilmIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Never Miss a Movie
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Your watchlist helps you remember all the great movies you discover
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <HeartIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 fill-current" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Quick Access
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Easy access to all your saved movies from your profile or navigation menu
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;