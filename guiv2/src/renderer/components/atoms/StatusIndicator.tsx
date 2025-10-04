/**
 * StatusIndicator Component
 *
 * Displays a colored dot with text to indicate status (online, offline, error, etc.)
 * Used for connection status, environment indicators, and general state display.
 *
 * Epic 0: UI/UX Parity - Replaces WPF StatusIndicator.xaml
 *
 * @component
 * @example
 * ```tsx
 * <StatusIndicator status="success" text="Connected" size="md" />
 * <StatusIndicator status="online" text="Active Directory" size="lg" animate />
 * ```
 */

import React from 'react';
import { clsx } from 'clsx';

/**
 * Status type enumeration matching WPF semantic states
 */
export type StatusType =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'online'
  | 'offline'
  | 'idle'
  | 'unknown';

export interface StatusIndicatorProps {
  /** Status type determines color (matches WPF semantic colors) */
  status: StatusType;
  /** Status label text */
  text: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show pulsing animation for active/loading states */
  animate?: boolean;
  /** Detailed description (shows on hover) */
  description?: string;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * StatusIndicator Component
 *
 * Replicates WPF StatusIndicator with semantic color coding and animations.
 * Uses design system colors from Epic 0 architecture.
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = React.memo(({
  status,
  text,
  size = 'md',
  animate = false,
  description,
  className,
  'data-cy': dataCy,
}) => {
  // Status color classes matching architectural specifications
  const statusColorClasses = {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info',
    online: 'bg-status-online',
    offline: 'bg-status-offline',
    idle: 'bg-status-idle',
    unknown: 'bg-status-unknown',
  };

  // Status text color classes
  const textColorClasses = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
    online: 'text-status-online',
    offline: 'text-status-offline',
    idle: 'text-status-idle',
    unknown: 'text-status-unknown',
  };

  // Size classes for container
  const containerSizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  // Size classes for dot
  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const containerClasses = clsx(
    'status-indicator',
    containerSizeClasses[size],
    className
  );

  const dotClasses = clsx(
    'rounded-full',
    statusColorClasses[status],
    dotSizeClasses[size],
    {
      'animate-pulse': animate,
    }
  );

  const labelClasses = clsx(
    'font-medium',
    textColorClasses[status]
  );

  return (
    <div
      className={containerClasses}
      title={description || `Status: ${status}`}
      data-cy={dataCy || `status-${status}`}
      role="status"
      aria-label={`${text} - ${status}`}
    >
      {/* Status dot with optional animation */}
      <span className="relative inline-flex">
        <span className={dotClasses} aria-hidden="true" />

        {/* Pulsing ring effect for animated states */}
        {animate && (
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

      {/* Status text */}
      <span className={labelClasses}>{text}</span>
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

export default StatusIndicator;
