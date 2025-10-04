/**
 * Loading Overlay Component
 * Full-screen loading overlay with progress indication and cancellation support
 */

import React from 'react';
import { X, Loader2 } from 'lucide-react';
import Button from '../atoms/Button';
import ProgressBar from './ProgressBar';

export interface LoadingOverlayProps {
  /** Progress percentage (0-100) */
  progress?: number;
  /** Loading message to display */
  message?: string;
  /** Show cancel button */
  showCancel?: boolean;
  /** Cancel button handler */
  onCancel?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * LoadingOverlay Component
 *
 * Displays a full-screen overlay with loading indicator and optional progress bar
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  progress,
  message = 'Loading...',
  showCancel = true,
  onCancel,
  className = '',
  'data-cy': dataCy = 'loading-overlay',
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm ${className}`}
      data-cy={dataCy}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Loading Spinner */}
        <div className="flex justify-center mb-6">
          <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>

        {/* Message */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-4">
          {message}
        </h2>

        {/* Progress Bar */}
        {typeof progress === 'number' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {progress.toFixed(0)}%
              </span>
            </div>
            <ProgressBar value={progress} max={100} />
          </div>
        )}

        {/* Cancel Button */}
        {showCancel && onCancel && (
          <div className="flex justify-center mt-6">
            <Button
              variant="secondary"
              onClick={onCancel}
              icon={<X />}
              data-cy="cancel-loading-btn"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
