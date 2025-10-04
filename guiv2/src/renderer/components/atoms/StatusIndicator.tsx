/**
 * StatusIndicator Component
 *
 * Displays a colored dot with text to indicate status (online, offline, error, etc.)
 * Used for connection status, environment indicators, and general state display.
 */

import React from 'react';
import { clsx } from 'clsx';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'loading';

export interface StatusIndicatorProps {
  /** Status type determines color */
  status: StatusType;
  /** Status label text */
  label?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Show pulsing animation (for loading/active states) */
  pulse?: boolean;
  /** Detailed description (shows on hover) */
  description?: string;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * StatusIndicator Component
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  pulse = false,
  description,
  className,
  'data-cy': dataCy,
}) => {
  // Status color classes
  const statusColorClasses = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-400',
    loading: 'bg-blue-500',
  };

  // Status text color classes
  const textColorClasses = {
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
    info: 'text-blue-700',
    neutral: 'text-gray-700',
    loading: 'text-blue-700',
  };

  // Size classes for dot
  const dotSizeClasses = {
    xs: 'h-2 w-2',
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  // Size classes for text
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Gap classes
  const gapClasses = {
    xs: 'gap-1.5',
    sm: 'gap-2',
    md: 'gap-2',
    lg: 'gap-2.5',
  };

  const containerClasses = clsx(
    'inline-flex items-center',
    gapClasses[size],
    className
  );

  const dotClasses = clsx(
    'rounded-full',
    statusColorClasses[status],
    dotSizeClasses[size],
    {
      // Pulsing animation
      'animate-pulse': pulse || status === 'loading',
    }
  );

  const labelClasses = clsx(
    'font-medium',
    textColorClasses[status],
    textSizeClasses[size]
  );

  return (
    <div
      className={containerClasses}
      title={description}
      data-cy={dataCy}
      role="status"
      aria-label={label || `Status: ${status}`}
    >
      {/* Status dot */}
      <span className="relative inline-flex">
        <span className={dotClasses} aria-hidden="true" />

        {/* Pulsing ring effect */}
        {(pulse || status === 'loading') && (
          <span
            className={clsx(
              'absolute inline-flex h-full w-full rounded-full opacity-75',
              statusColorClasses[status],
              'animate-ping'
            )}
            aria-hidden="true"
          />
        )}
      </span>

      {/* Label */}
      {label && <span className={labelClasses}>{label}</span>}
    </div>
  );
};

export default StatusIndicator;
