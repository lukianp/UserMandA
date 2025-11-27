/**
 * StatusIndicator Molecule Component
 *
 * Displays a colored dot indicator with status text label.
 * Replaces WPF StatusIndicator.xaml with modern React implementation.
 *
 * Epic 0: UI/UX Parity - Task 0.2 Port Common Controls
 * Reference: /GUI/Controls/StatusIndicator.xaml
 *
 * @component
 * @example
 * ```tsx
 * <StatusIndicator status="Success" label="Connected" />
 * <StatusIndicator status="Error" label="Disconnected" />
 * <StatusIndicator status="Warning" label="Limited Connectivity" />
 * ```
 */

import React from 'react';
import { clsx } from 'clsx';

/**
 * Status type enumeration matching WPF semantic states
 * Maps to design system colors from tailwind.config.js
 */
export type StatusIndicatorStatus =
  | 'Success'
  | 'Warning'
  | 'Error'
  | 'Info'
  | 'Unknown';

export interface StatusIndicatorProps {
  /** Status type determines color scheme */
  status: StatusIndicatorStatus;
  /** Status label text to display */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show pulsing animation on the dot */
  animate?: boolean;
  /** Additional tooltip text */
  tooltip?: string;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * Maps status values to Tailwind background color classes
 * Uses semantic colors from Epic 0 architecture
 */
const dotColorClasses: Record<StatusIndicatorStatus, string> = {
  Success: 'bg-success',
  Warning: 'bg-warning',
  Error: 'bg-error',
  Info: 'bg-info',
  Unknown: 'bg-gray-400',
};

/**
 * Maps status values to Tailwind text color classes
 * Darker variants for better contrast
 */
const textColorClasses: Record<StatusIndicatorStatus, string> = {
  Success: 'text-success-dark',
  Warning: 'text-warning-dark',
  Error: 'text-error-dark',
  Info: 'text-info-dark',
  Unknown: 'text-gray-600',
};

/**
 * Dot size classes by variant
 */
const dotSizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

/**
 * Gap spacing between dot and label
 */
const gapSizeClasses = {
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2.5',
};

/**
 * Text size classes by variant
 */
const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/**
 * StatusIndicator Component
 *
 * Production-ready status indicator with semantic color coding.
 * Follows atomic design principles as a molecule (dot + text).
 * Implements full accessibility with ARIA attributes and keyboard support.
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = React.memo(({
  status,
  label,
  size = 'md',
  animate = false,
  tooltip,
  className,
  'data-cy': dataCy,
}) => {
  const containerClasses = clsx(
    'inline-flex items-center',
    gapSizeClasses[size],
    className
  );

  const dotClasses = clsx(
    'rounded-full flex-shrink-0',
    dotColorClasses[status],
    dotSizeClasses[size],
    {
      'animate-pulse': animate,
    }
  );

  const labelClasses = clsx(
    'font-medium',
    textColorClasses[status],
    textSizeClasses[size]
  );

  // Accessibility: Build descriptive status message
  const ariaLabel = label
    ? `${label} - Status: ${status}`
    : `Status: ${status}`;

  return (
    <div
      className={containerClasses}
      title={tooltip || ariaLabel}
      data-cy={dataCy || `status-indicator-${status.toLowerCase()}`}
      role="status"
      aria-label={ariaLabel}
    >
      {/* Status dot indicator */}
      <span className="relative inline-flex items-center justify-center">
        <span
          className={dotClasses}
          aria-hidden="true"
        />

        {/* Animated pulsing ring effect for active states */}
        {animate && (
          <span
            className={clsx(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              dotColorClasses[status]
            )}
            aria-hidden="true"
          />
        )}
      </span>

      {/* Status label text */}
      {label && (
        <span className={labelClasses}>
          {label}
        </span>
      )}
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

export default StatusIndicator;
