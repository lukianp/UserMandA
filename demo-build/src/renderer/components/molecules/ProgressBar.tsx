/**
 * ProgressBar Component
 *
 * Progress indicator with percentage display and optional label.
 * Supports different variants and sizes.
 */

import React from 'react';
import { clsx } from 'clsx';

export interface ProgressBarProps {
  /** Current progress value (0-100) */
  value?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Progress bar variant */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show percentage label */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
  /** Label position */
  labelPosition?: 'inside' | 'outside';
  /** Striped pattern */
  striped?: boolean;
  /** Animated stripes */
  animated?: boolean;
  /** Indeterminate loading state */
  indeterminate?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * ProgressBar Component
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = true,
  label,
  labelPosition = 'inside',
  striped = false,
  animated = false,
  indeterminate = false,
  className,
  'data-cy': dataCy,
}) => {
  // Calculate percentage
  const percentage = indeterminate ? 30 : Math.min(100, Math.max(0, (value / max) * 100));

  // Variant colors using design tokens
  const variantClasses = {
    default: 'bg-info',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-error',
    info: 'bg-info',
  };

  // Background colors using design tokens
  const bgClasses = {
    default: 'bg-light-background dark:bg-dark-background',
    success: 'bg-light-background dark:bg-dark-background',
    warning: 'bg-light-background dark:bg-dark-background',
    danger: 'bg-light-background dark:bg-dark-background',
    info: 'bg-light-background dark:bg-dark-background',
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const containerClasses = clsx('w-full', className);

  const trackClasses = clsx(
    'w-full rounded-full overflow-hidden',
    bgClasses[variant],
    sizeClasses[size]
  );

  const barClasses = clsx(
    'h-full transition-all duration-500 ease-out',
    variantClasses[variant],
    {
      // Striped pattern with shimmer effect
      'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-shimmer': striped,
      'animate-progress-stripes': striped && animated,
      'animate-progress-indeterminate': indeterminate,
    }
  );

  const labelText = label || (showLabel && !indeterminate ? `${Math.round(percentage)}%` : '');

  return (
    <div className={containerClasses} data-cy={dataCy}>
      {/* Outside label (above bar) */}
      {labelText && labelPosition === 'outside' && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{labelText}</span>
        </div>
      )}

      {/* Progress track */}
      <div className={trackClasses} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        {/* Progress bar */}
        <div className={barClasses} style={{ width: `${percentage}%` }}>
          {/* Inside label */}
          {labelText && labelPosition === 'inside' && size !== 'sm' && (
            <div className="flex items-center justify-center h-full px-2">
              <span className="text-xs font-semibold text-white whitespace-nowrap">
                {labelText}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add animation for striped progress bars
const styles = `
@keyframes progress-stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}

.animate-progress-stripes {
  animation: progress-stripes 1s linear infinite;
}
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('progress-bar-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'progress-bar-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default ProgressBar;


