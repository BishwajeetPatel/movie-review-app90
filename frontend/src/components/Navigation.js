import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  HeartIcon, 
  FilmIcon,
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: null },
    { path: '/movies', label: 'Movies', icon: FilmIcon },
  ];

  const userLinks = [
    { path: '/watchlist', label: 'Watchlist', icon: HeartIcon },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FilmIcon className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                MovieReview
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    isActiveLink(link.path)
                      ? 'border-indigo-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  {link.icon && <link.icon className="h-4 w-4 mr-1" />}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </form>
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {userLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActiveLink(link.path)
                        ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-gray-700'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    <link.icon className="h-4 w-4 mr-1" />
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white p-2"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </form>

            {/* Mobile navigation links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    isActiveLink(link.path)
                      ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-gray-700'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  {userLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 text-base font-medium rounded-md ${
                        isActiveLink(link.path)
                          ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-gray-700'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white rounded-md"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;