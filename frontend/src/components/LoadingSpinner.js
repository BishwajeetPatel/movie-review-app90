import React from 'react';
import { FilmIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className="relative">
        <FilmIcon className={`${sizeClasses[size]} text-indigo-600 animate-spin`} />
        <div className="absolute inset-0">
          <FilmIcon className={`${sizeClasses[size]} text-indigo-300 animate-pulse`} />
        </div>
      </div>
      
      {text && (
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;