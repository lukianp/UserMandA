/**
 * Skeleton loading component
 * Provides visual feedback during data loading
 *
 * @module Skeleton
 * @since 1.0.0
 */

import React from 'react';

/**
 * Skeleton component props
 */
export interface SkeletonProps {
  /** Width of the skeleton (CSS value or number in px) */
  width?: string | number;
  /** Height of the skeleton (CSS value or number in px) */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Visual variant of the skeleton */
  variant?: 'text' | 'rectangular' | 'circular';
  /** Animation speed */
  animation?: 'pulse' | 'wave' | 'none';
  /** Number of skeleton lines to render (for text variant) */
  count?: number;
}

/**
 * Skeleton Loading Component
 *
 * Displays a placeholder animation while content is loading,
 * improving perceived performance and user experience.
 *
 * @example
 * ```tsx
 * // Single text line
 * <Skeleton width="80%" height="1rem" variant="text" />
 *
 * // Multiple text lines
 * <Skeleton variant="text" count={3} />
 *
 * // Circular avatar placeholder
 * <Skeleton width={40} height={40} variant="circular" />
 *
 * // Rectangular image placeholder
 * <Skeleton width="100%" height={200} variant="rectangular" />
 *
 * // Card skeleton
 * <div>
 *   <Skeleton variant="circular" width={40} height={40} />
 *   <Skeleton variant="text" width="60%" />
 *   <Skeleton variant="text" width="80%" />
 *   <Skeleton variant="rectangular" height={200} />
 * </div>
 * ```
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  variant = 'text',
  animation = 'pulse',
  count = 1,
}) => {
  // Convert number to px string
  const widthStr = typeof width === 'number' ? `${width}px` : width;
  const heightStr = typeof height === 'number' ? `${height}px` : height;

  // Base classes for all skeletons
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';

  // Animation classes
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  // Variant-specific classes
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  const combinedClasses = `${baseClasses} ${animationClasses[animation]} ${variantClasses[variant]} ${className}`.trim();

  // For text variant with multiple lines
  if (count > 1 && variant === 'text') {
    return (
      <div className="space-y-2" role="status" aria-label="Loading content">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={combinedClasses}
            style={{
              width: index === count - 1 ? '60%' : widthStr, // Last line is shorter
              height: heightStr,
            }}
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // Single skeleton
  return (
    <div
      className={combinedClasses}
      style={{ width: widthStr, height: heightStr }}
      role="status"
      aria-label="Loading content"
      aria-hidden="true"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Skeleton Table Component
 *
 * Pre-configured skeleton for table/grid loading states
 *
 * @example
 * ```tsx
 * <SkeletonTable rows={5} columns={4} />
 * ```
 */
export interface SkeletonTableProps {
  /** Number of rows to display */
  rows?: number;
  /** Number of columns to display */
  columns?: number;
  /** Show header row */
  showHeader?: boolean;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
}) => {
  return (
    <div className="space-y-2" role="status" aria-label="Loading table">
      {showHeader && (
        <div className="flex gap-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`header-${colIndex}`}
              width="100%"
              height="2rem"
              variant="rectangular"
            />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              width="100%"
              height="1.5rem"
              variant="text"
            />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading table data...</span>
    </div>
  );
};

/**
 * Skeleton Card Component
 *
 * Pre-configured skeleton for card loading states
 *
 * @example
 * ```tsx
 * <SkeletonCard />
 * ```
 */
export interface SkeletonCardProps {
  /** Show avatar */
  showAvatar?: boolean;
  /** Show image */
  showImage?: boolean;
  /** Number of text lines */
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = false,
  showImage = true,
  lines = 3,
}) => {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3" role="status" aria-label="Loading card">
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton width={40} height={40} variant="circular" />
          <div className="flex-1">
            <Skeleton width="60%" height="1rem" variant="text" />
            <Skeleton width="40%" height="0.875rem" variant="text" />
          </div>
        </div>
      )}
      {showImage && (
        <Skeleton width="100%" height={200} variant="rectangular" />
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            width={index === lines - 1 ? '60%' : '100%'}
            height="1rem"
            variant="text"
          />
        ))}
      </div>
      <span className="sr-only">Loading card content...</span>
    </div>
  );
};

/**
 * Skeleton List Component
 *
 * Pre-configured skeleton for list loading states
 *
 * @example
 * ```tsx
 * <SkeletonList items={5} showAvatar />
 * ```
 */
export interface SkeletonListProps {
  /** Number of list items */
  items?: number;
  /** Show avatar for each item */
  showAvatar?: boolean;
  /** Show secondary line */
  showSecondary?: boolean;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  showAvatar = false,
  showSecondary = true,
}) => {
  return (
    <div className="space-y-3" role="status" aria-label="Loading list">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          {showAvatar && (
            <Skeleton width={40} height={40} variant="circular" />
          )}
          <div className="flex-1 space-y-1">
            <Skeleton width="80%" height="1rem" variant="text" />
            {showSecondary && (
              <Skeleton width="60%" height="0.875rem" variant="text" />
            )}
          </div>
        </div>
      ))}
      <span className="sr-only">Loading list items...</span>
    </div>
  );
};


