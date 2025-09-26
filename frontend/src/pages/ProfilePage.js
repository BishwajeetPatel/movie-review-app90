import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import { 
  UserCircleIcon, 
  PencilIcon, 
  CalendarIcon,
  ChatBubbleLeftEllipsisIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    favoriteGenres: []
  });
  const [activeTab, setActiveTab] = useState('reviews');

  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
    'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
  ];

  useEffect(() => {
    fetchProfile();
    fetchUserReviews();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getProfile();
      setProfile(response.data);
      setEditForm({
        username: response.data.user.username,
        bio: response.data.user.bio || '',
        favoriteGenres: response.data.user.favoriteGenres || []
      });
    } catch (error) {
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await usersAPI.getUserReviews();
      setUserReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to load user reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await usersAPI.updateProfile(editForm);
      setProfile(prev => ({
        ...prev,
        user: response.data.user
      }));
      updateUser(response.data.user);
      setIsEditing(false);
      showSuccess('Profile updated successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleGenreToggle = (genre) => {
    setEditForm(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAverageRating = () => {
    if (userReviews.length === 0) return 0;
    const sum = userReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / userReviews.length).toFixed(1);
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading profile..." />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.user.profilePicture ? (
                <img
                  src={profile.user.profilePicture}
                  alt={profile.user.username}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <UserCircleIcon className="h-24 w-24 text-gray-400" />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.user.username}
                </h1>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {userReviews.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Reviews</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {calculateAverageRating()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      Joined {formatDate(profile.user.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {profile.user.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {profile.user.bio}
                </p>
              )}

              {profile.user.favoriteGenres && profile.user.favoriteGenres.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Favorite Genres:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.user.favoriteGenres.map((genre) => (
                      <span
                        key={genre}
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Edit Profile
            </h2>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Favorite Genres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Favorite Genres
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {genres.map((genre) => (
                    <label
                      key={genre}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editForm.favoriteGenres.includes(genre)}
                        onChange={() => handleGenreToggle(genre)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {genre}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <ChatBubbleLeftEllipsisIcon className="h-5 w-5 inline mr-2" />
                Reviews ({userReviews.length})
              </button>
              
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'watchlist'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <HeartIcon className="h-5 w-5 inline mr-2" />
                Watchlist
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'reviews' && (
              <div>
                {reviewsLoading ? (
                  <LoadingSpinner text="Loading reviews..." />
                ) : userReviews.length > 0 ? (
                  <div className="space-y-6">
                    {userReviews.map((review) => (
                      <div
                        key={review._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {review.movieId.title}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center">
                                <StarIcon className="h-4 w-4 mr-1" />
                                <span>{review.rating}/5</span>
                              </div>
                              <span>{formatDate(review.timestamp)}</span>
                              {review.isEdited && <span>(edited)</span>}
                            </div>
                          </div>
                          <StarRating value={review.rating} readonly={true} size="small" />
                        </div>
                        
                        {review.reviewText && (
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {review.reviewText}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ChatBubbleLeftEllipsisIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No Reviews Yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Start reviewing movies to see them here!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'watchlist' && (
              <div className="text-center py-12">
                <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Watchlist
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your watchlist will appear here
                </p>
                <button
                  onClick={() => window.location.href = '/watchlist'}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                >
                  View Watchlist
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;