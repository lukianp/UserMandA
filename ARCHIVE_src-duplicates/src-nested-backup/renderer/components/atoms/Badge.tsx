/**
 * Badge Component
 *
 * Small label component for status indicators, counts, and tags.
 * Supports multiple variants and sizes.
 */

import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Dot indicator */
  dot?: boolean;
  /** Dot position */
  dotPosition?: 'leading' | 'trailing';
  /** Removable badge */
  removable?: boolean;
  /** Remove handler */
  onRemove?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * Badge Component
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  dotPosition = 'leading',
  removable = false,
  onRemove,
  className,
  'data-cy': dataCy,
}) => {
  // Variant styles
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  };

  // Dot color classes
  const dotClasses = {
    default: 'bg-gray-500',
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500',
  };

  // Size styles
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-sm',
    md: 'px-3 py-1 text-sm',
    lg: 'px-3.5 py-1.5 text-base',
  };

  const dotSizeClasses = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  const badgeClasses = clsx(
    // Base styles
    'inline-flex items-center gap-1.5',
    'font-medium rounded-full border',
    'transition-colors duration-200',

    // Variant
    variantClasses[variant],

    // Size
    sizeClasses[size],

    className
  );

  return (
    <span className={badgeClasses} data-cy={dataCy}>
      {/* Leading dot */}
      {dot && dotPosition === 'leading' && (
        <span
          className={clsx('rounded-full', dotClasses[variant], dotSizeClasses[size])}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <span>{children}</span>

      {/* Trailing dot */}
      {dot && dotPosition === 'trailing' && (
        <span
          className={clsx('rounded-full', dotClasses[variant], dotSizeClasses[size])}
          aria-hidden="true"
        />
      )}

      {/* Remove button */}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={clsx(
            'ml-0.5 -mr-1 inline-flex items-center justify-center',
            'rounded-full hover:bg-black/10',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            {
              'h-3 w-3': size === 'xs' || size === 'sm',
              'h-4 w-4': size === 'md' || size === 'lg',
            }
          )}
          aria-label="Remove"
        >
          <svg
            className={clsx({
              'h-2 w-2': size === 'xs' || size === 'sm',
              'h-3 w-3': size === 'md' || size === 'lg',
            })}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Badge;
