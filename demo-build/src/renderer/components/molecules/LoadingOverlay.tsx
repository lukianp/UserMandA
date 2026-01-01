/**
 * LoadingOverlay Component
 * Full-screen loading overlay with progress indication and cancellation support
 *
 * Epic 0: UI/UX Parity - Replaces WPF LoadingOverlay.xaml
 * Features glassmorphism effects and neon cyan spinner
 *
 * @component
 * @example
 * ```tsx
 * <LoadingOverlay message="Discovering users..." progress={45} showCancel onCancel={handleCancel} />
 * ```
 */

import React from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

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
 * Displays a full-screen overlay with glassmorphism effect and neon spinner.
 * Matches WPF LoadingOverlay styling with modern CSS effects.
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = React.memo(({
  progress,
  message = 'Loading...',
  showCancel = true,
  onCancel,
  className = '',
  'data-cy': dataCy = 'loading-overlay',
}) => {
  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/50 backdrop-blur-sm',
        className
      )}
      data-cy={dataCy}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-message"
    >
      {/* Glassmorphism card */}
      <div className={clsx(
        'glass-card',
        'bg-dark-surface border-2 border-dark-border',
        'rounded-card w-80 p-6',
        'shadow-card-hover'
      )}>
        {/* Neon cyan loading spinner */}
        <div className="flex justify-center mb-4">
          <div className="loading-spinner-neon" role="status" aria-label="Loading" />
        </div>

        {/* Loading message */}
        <p
          id="loading-message"
          className="text-center text-dark-foreground font-semibold mb-4"
        >
          {message}
        </p>

        {/* Progress bar */}
        {typeof progress === 'number' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-foreground-secondary">Progress</span>
              <span className="text-sm font-medium text-dark-foreground">
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill-gradient"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Cancel button */}
        {showCancel && onCancel && (
          <div className="flex justify-center mt-6">
            <button
              onClick={onCancel}
              className={clsx(
                'flex items-center gap-2',
                'bg-dark-hover hover:bg-dark-border',
                'text-dark-foreground',
                'px-4 py-2 rounded-button',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-brand-primary/50'
              )}
              data-cy="cancel-loading-btn"
              aria-label="Cancel operation"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

export default LoadingOverlay;


