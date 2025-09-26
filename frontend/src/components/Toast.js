import React from 'react';
import { useToast } from '../context/ToastContext';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getToastIcon = (type) => {
    const iconClasses = "h-5 w-5";
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClasses} text-green-500`} />;
      case 'error':
        return <ExclamationCircleIcon className={`${iconClasses} text-red-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClasses} text-yellow-500`} />;
      default:
        return <InformationCircleIcon className={`${iconClasses} text-blue-500`} />;
    }
  };

  const getToastColors = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-sm w-full border rounded-lg p-4 shadow-lg
            transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right-full
            ${getToastColors(toast.type)}
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getToastIcon(toast.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">
                {toast.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => removeToast(toast.id)}
                className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;