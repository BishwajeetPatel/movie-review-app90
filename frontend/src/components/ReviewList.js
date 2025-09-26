import React, { useState } from 'react';
import StarRating from './StarRating';
import LoadingSpinner from './LoadingSpinner';
import { 
  UserCircleIcon, 
  ChatBubbleLeftEllipsisIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';

const ReviewList = ({ 
  reviews = [], 
  loading = false, 
  currentUserId = null, 
  onReviewUpdate 
}) => {
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <LoadingSpinner text="Loading reviews..." />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <ChatBubbleLeftEllipsisIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Reviews Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Be the first to share your thoughts about this movie!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reviews ({reviews.length})
        </h3>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => {
          const isExpanded = expandedReviews.has(review._id);
          const shouldTruncate = review.reviewText && review.reviewText.length > 300;
          const displayText = isExpanded ? review.reviewText : truncateText(review.reviewText);

          return (
            <div
              key={review._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {review.userId.profilePicture ? (
                    <img
                      src={review.userId.profilePicture}
                      alt={review.userId.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {review.userId.username}
                      {review.userId._id === currentUserId && (
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-1 rounded">
                          Your Review
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(review.timestamp)}</span>
                      {review.isEdited && (
                        <span className="text-xs">(edited)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex flex-col items-end">
                  <StarRating 
                    value={review.rating} 
                    readonly={true} 
                    size="small"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              {/* Review Content */}
              {review.reviewText && (
                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {displayText}
                  </p>
                  
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleReviewExpansion(review._id)}
                      className="mt-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-sm font-medium"
                    >
                      {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              )}

              {/* Review Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  {review.helpfulVotes > 0 && (
                    <span>{review.helpfulVotes} found this helpful</span>
                  )}
                </div>

                {/* Future: Add helpful/report buttons here */}
                <div className="flex items-center space-x-2">
                  {/* Placeholder for future actions */}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Reviews Button - for pagination */}
      {reviews.length > 0 && reviews.length % 10 === 0 && (
        <div className="text-center pt-6">
          <button
            onClick={() => onReviewUpdate && onReviewUpdate()}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;