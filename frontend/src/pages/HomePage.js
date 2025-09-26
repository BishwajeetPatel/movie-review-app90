import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { moviesAPI } from '../services/api';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FireIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured/trending movies
        const featuredResponse = await moviesAPI.getFeaturedMovies();
        setFeaturedMovies(featuredResponse.data.featured || []);
        setRecentMovies(featuredResponse.data.recent || []);
        
        // Fetch top-rated movies
        const topRatedResponse = await moviesAPI.getMovies({
          sortBy: 'rating',
          limit: 8
        });
        setTopRatedMovies(topRatedResponse.data.movies || []);
        
      } catch (err) {
        setError('Failed to load homepage data');
        console.error('Homepage data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="large" text="Loading homepage..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Discover Amazing Movies
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Read reviews, rate movies, and build your watchlist
            </p>
            <Link
              to="/movies"
              className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-colors inline-block"
            >
              Browse Movies
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Movies Section */}
      {featuredMovies.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <FireIcon className="h-8 w-8 text-orange-500 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Trending Now
              </h2>
            </div>
            <Link
              to="/movies?sortBy=trending"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
            >
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredMovies.slice(0, 8).map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Top Rated Movies Section */}
      {topRatedMovies.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-yellow-500 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Top Rated
              </h2>
            </div>
            <Link
              to="/movies?sortBy=rating"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
            >
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topRatedMovies.slice(0, 8).map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Movies Section */}
      {recentMovies.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-blue-500 mr-3" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Recently Added
              </h2>
            </div>
            <Link
              to="/movies?sortBy=newest"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium"
            >
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentMovies.slice(0, 8).map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {featuredMovies.length + recentMovies.length + topRatedMovies.length}+
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Movies Available</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                1000+
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">User Reviews</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                500+
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Active Users</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Join Our Community
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Share your thoughts, discover new movies, and connect with fellow movie lovers
          </p>
          <div className="space-x-4">
            <Link
              to="/register"
              className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors inline-block"
            >
              Sign Up Free
            </Link>
            <Link
              to="/movies"
              className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 font-semibold py-3 px-6 rounded-lg transition-colors inline-block"
            >
              Browse Movies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;