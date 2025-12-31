/**
 * Spinner Component
 *
 * Loading spinner with various sizes and colors
 */

import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  /** Size of the spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  color?: 'primary' | 'secondary' | 'white' | 'current';
  /** Additional label for screen readers */
  label?: string;
  /** Center the spinner in its container */
  center?: boolean;
  /** Full screen overlay spinner */
  fullScreen?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Data attribute for Cypress testing */
  'data-cy'?: string;
}

/**
 * Spinner component for loading states
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label = 'Loading...',
  center = false,
  fullScreen = false,
  className,
  'data-cy': dataCy,
}) => {
  // Size mappings
  const sizes = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  };

  // Color classes
  const colors = {
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white',
    current: 'text-current',
  };

  // Container classes for centering
  const containerClasses = clsx(
    center && !fullScreen && 'flex items-center justify-center',
    fullScreen && 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50',
    className
  );

  // Spinner element
  const spinnerElement = (
    <>
      <Loader2
        className={clsx('animate-spin', colors[color])}
        size={sizes[size]}
        aria-hidden="true"
        data-cy={dataCy}
      />
      <span className="sr-only">{label}</span>
    </>
  );

  // If centering or fullscreen, wrap in container
  if (center || fullScreen) {
    return (
      <div className={containerClasses} role="status" aria-label={label}>
        <div className="flex flex-col items-center">
          {spinnerElement}
          {fullScreen && (
            <p className="mt-4 text-white text-sm">{label}</p>
          )}
        </div>
      </div>
    );
  }

  // Otherwise return spinner directly
  return (
    <span className={className} role="status" aria-label={label}>
      {spinnerElement}
    </span>
  );
};

