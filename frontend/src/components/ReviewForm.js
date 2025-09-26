import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';

const ReviewForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null, 
  submitText = 'Submit Review' 
}) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [reviewText, setReviewText] = useState(initialData?.reviewText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setRating(initialData.rating || 0);
      setReviewText(initialData.reviewText || '');
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (rating === 0) {
      newErrors.rating = 'Please provide a rating';
    }

    if (reviewText.trim().length < 10) {
      newErrors.reviewText = 'Review must be at least 10 characters long';
    }

    if (reviewText.trim().length > 1000) {
      newErrors.reviewText = 'Review must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        reviewText: reviewText.trim()
      });
      
      // Reset form if not editing
      if (!initialData) {
        setRating(0);
        setReviewText('');
      }
    } catch (error) {
      console.error('Review submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setRating(initialData.rating || 0);
      setReviewText(initialData.reviewText || '');
    } else {
      setRating(0);
      setReviewText('');
    }
    setErrors({});
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rating *
        </label>
        <StarRating
          value={rating}
          onChange={setRating}
          size="large"
        />
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.rating}
          </p>
        )}
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Review *
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your thoughts about this movie..."
          rows={6}
          className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 ${
            errors.reviewText 
              ? 'border-red-300 dark:border-red-600' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        <div className="mt-1 flex justify-between items-center">
          {errors.reviewText && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.reviewText}
            </p>
          )}
          <p className={`text-xs ml-auto ${
            reviewText.length > 1000 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {reviewText.length}/1000
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Submitting...' : submitText}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Review Guidelines
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Be honest and constructive in your feedback</li>
          <li>• Focus on the movie's content, not personal attacks</li>
          <li>• Avoid major spoilers without warning</li>
          <li>• Keep your language respectful and appropriate</li>
        </ul>
      </div>
    </form>
  );
};

export default ReviewForm;