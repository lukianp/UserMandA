/**
 * Discovery Progress Bar Component
 *
 * Displays real-time progress for discovery module execution with ETA and throughput.
 *
 * Features:
 * - Animated progress bar (0-100%)
 * - Current phase/message display
 * - ETA calculation and display
 * - Throughput display (items/min)
 * - Cancel button integration
 * - Success/error state indicators
 * - Dark theme compatible
 */

import React from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

import type { ProgressData } from '../../hooks/useDiscoveryExecution';

// ==================== Type Definitions ====================

export interface DiscoveryProgressBarProps {
  progress: ProgressData;
  isExecuting: boolean;
  isCompleted?: boolean;
  hasError?: boolean;
  error?: string | null;
  onCancel?: () => void;
  isCancelling?: boolean;
  className?: string;
}

// ==================== Utility Functions ====================

/**
 * Format ETA duration
 */
const formatETA = (ms: number): string => {
  if (ms < 0 || !isFinite(ms)) return 'Calculating...';

  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (hours > 0) {
    return `~${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `~${minutes}m ${seconds}s`;
  } else {
    return `~${seconds}s`;
  }
};

/**
 * Calculate throughput (items per minute)
 */
const calculateThroughput = (
  itemsProcessed: number | undefined,
  startTime: Date | null
): string | null => {
  if (!itemsProcessed || !startTime) return null;

  const elapsedMinutes = (Date.now() - startTime.getTime()) / 60000;
  if (elapsedMinutes < 0.1) return null; // Too early to calculate

  const itemsPerMinute = Math.round(itemsProcessed / elapsedMinutes);
  return `${itemsPerMinute.toLocaleString()} items/min`;
};

// ==================== Main Component ====================

export const DiscoveryProgressBar: React.FC<DiscoveryProgressBarProps> = ({
  progress,
  isExecuting,
  isCompleted = false,
  hasError = false,
  error = null,
  onCancel,
  isCancelling = false,
  className = '',
}) => {
  // Determine state
  const percentage = Math.min(Math.max(progress.percentage || 0, 0), 100);
  const isIndeterminate = isExecuting && percentage === 0;

  // ==================== Render ====================

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-3 ${className}`}>
      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {isIndeterminate ? (
          // Indeterminate animation (when percentage is 0)
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 animate-pulse" />
        ) : (
          // Determinate progress bar
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-300 ${
              hasError
                ? 'bg-red-600'
                : isCompleted
                ? 'bg-green-600'
                : isExecuting
                ? 'bg-blue-600'
                : 'bg-gray-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between text-sm">
        {/* Left side: Message and current item */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Status icon */}
            {isExecuting && !hasError && (
              <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
            )}
            {isCompleted && !hasError && (
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            )}
            {hasError && (
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            {isCancelling && (
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            )}

            {/* Message */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white truncate">
                {isCancelling
                  ? 'Cancelling...'
                  : hasError && error
                  ? error
                  : progress.message || 'Initializing...'}
              </div>

              {/* Current item (if available) */}
              {progress.currentItem && !hasError && !isCancelling && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                  Current: {progress.currentItem}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Stats and actions */}
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          {/* Progress stats */}
          <div className="text-right space-y-1">
            {/* Percentage */}
            <div className={`font-bold text-lg ${
              hasError
                ? 'text-red-600 dark:text-red-400'
                : isCompleted
                ? 'text-green-600 dark:text-green-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}>
              {hasError ? '!' : isCompleted ? '✓' : `${percentage}%`}
            </div>

            {/* Items processed (if available) */}
            {progress.itemsProcessed !== undefined && progress.totalItems !== undefined && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {progress.itemsProcessed.toLocaleString()} / {progress.totalItems.toLocaleString()}
              </div>
            )}

            {/* ETA (if available and executing) */}
            {isExecuting &&
              !hasError &&
              progress.estimatedTimeRemaining !== undefined &&
              progress.estimatedTimeRemaining > 0 && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  ETA: {formatETA(progress.estimatedTimeRemaining)}
                </div>
              )}
          </div>

          {/* Cancel button */}
          {isExecuting && !isCancelling && onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1"
              title="Cancel execution (Ctrl+C)"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoveryProgressBar;
