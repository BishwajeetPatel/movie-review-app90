import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const StarRating = ({ 
  value = 0, 
  onChange, 
  readonly = false, 
  size = 'medium',
  showValue = false 
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  };

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const getStarColor = (index) => {
    const currentValue = hoverValue || value;
    if (index <= currentValue) {
      return 'text-yellow-400';
    }
    return 'text-gray-300';
  };

  const getStarIcon = (index) => {
    const currentValue = hoverValue || value;
    return index <= currentValue ? StarSolidIcon : StarIcon;
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const StarComponent = getStarIcon(star);
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={`${
                readonly 
                  ? 'cursor-default' 
                  : 'cursor-pointer hover:scale-110 transition-transform duration-150'
              } ${sizeClasses[size]} ${getStarColor(star)}`}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <StarComponent className="w-full h-full" />
            </button>
          );
        })}
      </div>
      
      {showValue && value > 0 && (
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
          ({value}/5)
        </span>
      )}
      
      {!readonly && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
          {hoverValue > 0 
            ? `${hoverValue} star${hoverValue !== 1 ? 's' : ''}` 
            : value > 0 
            ? `${value} star${value !== 1 ? 's' : ''}` 
            : 'Click to rate'
          }
        </span>
      )}
    </div>
  );
};

export default StarRating;