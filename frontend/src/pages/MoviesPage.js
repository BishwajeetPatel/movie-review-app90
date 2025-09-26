import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  AdjustmentsHorizontalIcon, 
  MagnifyingGlassIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [watchlistMovies, setWatchlistMovies] = useState(new Set());

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    minRating: searchParams.get('minRating') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page')) || 1
  });

  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
    'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'title', label: 'A-Z' },
    { value: 'year', label: 'Release Year' },
    { value: 'trending', label: 'Trending' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchMovies();
  }, [filters]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        limit: 12
      };

      // Remove empty values
      Object.keys(params).forEach(key => {
        if (!params[key]) {
          delete params[key];
        }
      });

      const response = await moviesAPI.getMovies(params);
      setMovies(response.data.movies || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError('Failed to load movies');
      console.error('Movies fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      genre: '',
      year: '',
      minRating: '',
      sortBy: 'newest',
      page: 1
    });
  };

  const handleWatchlistToggle = (movieId, isAdded) => {
    setWatchlistMovies(prev => {
      const newSet = new Set(prev);
      if (isAdded) {
        newSet.add(movieId);
      } else {
        newSet.delete(movieId);
      }
      return newSet;
    });
  };

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    const pages = [];
    const currentPage = pagination.currentPage;
    const totalPages = pagination.totalPages;

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border ${
            i === currentPage
              ? 'text-indigo-600 bg-indigo-50 border-indigo-500 dark:text-white dark:bg-indigo-600'
              : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          Next
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-8">
        <nav className="flex">{pages}</nav>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Movies
          </h1>
          
          {/* Search and Filter Toggle */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search movies..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter Movies
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Genre
                </label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Release Year
                </label>
                <select
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium text-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Results Info */}
        {!loading && (
          <div className="mb-6 text-gray-600 dark:text-gray-400">
            {pagination.totalMovies > 0 ? (
              <p>
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalMovies)} of {' '}
                {pagination.totalMovies} movies
              </p>
            ) : (
              <p>No movies found</p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner text="Loading movies..." />}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchMovies}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && !error && movies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie._id}
                movie={movie}
                isInWatchlist={watchlistMovies.has(movie._id)}
                onWatchlistToggle={handleWatchlistToggle}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && movies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-24 w-24 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No movies found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search criteria or filters
              </p>
              <button
                onClick={clearFilters}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && movies.length > 0 && renderPagination()}
      </div>
    </div>
  );
};

export default MoviesPage;