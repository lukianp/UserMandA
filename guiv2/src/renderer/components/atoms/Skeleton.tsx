/**
 * Skeleton Component
 *
 * Placeholder loading state with shimmer animation.
 * Used for improving perceived performance during data loading.
 */

import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps {
  /** Skeleton variant type */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Width (CSS value or number for pixels) */
  width?: string | number;
  /** Height (CSS value or number for pixels) */
  height?: string | number;
  /** Number of lines for text variant */
  lines?: number;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * Skeleton Loader Component
 *
 * Provides visual feedback while content is loading.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className,
  'data-cy': dataCy,
}) => {
  const baseClasses = clsx(
    'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
    'bg-[length:200%_100%] animate-shimmer'
  );

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const skeletonClasses = clsx(baseClasses, variantClasses[variant], className);

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  // For circular variant, ensure width and height are equal
  if (variant === 'circular') {
    const size = width || height || 40;
    style.width = typeof size === 'number' ? `${size}px` : size;
    style.height = typeof size === 'number' ? `${size}px` : size;
  }

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" data-cy={dataCy}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={skeletonClasses}
            style={{
              ...style,
              // Make last line shorter for natural appearance
              width: index === lines - 1 ? '70%' : style.width || '100%',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  // Single skeleton element
  return <div className={skeletonClasses} style={style} data-cy={dataCy} aria-hidden="true" />;
};

// Pre-built skeleton patterns for common use cases
export const SkeletonText: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="text" {...props} />
);

export const SkeletonCircular: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="circular" {...props} />
);

export const SkeletonRectangular: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => (
  <Skeleton variant="rectangular" {...props} />
);

export const SkeletonCard: React.FC = () => (
  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
    <div className="flex items-center space-x-4">
      <SkeletonCircular width={40} height={40} />
      <div className="flex-1 space-y-2">
        <SkeletonText width="60%" />
        <SkeletonText width="40%" />
      </div>
    </div>
    <SkeletonRectangular height={100} />
    <SkeletonText lines={3} />
  </div>
);

export default Skeleton;
