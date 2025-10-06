/**
 * LoadingSpinner Component
 *
 * Simple loading spinner for inline loading states
 */

import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * LoadingSpinner component for inline loading states
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  'data-cy': dataCy,
}) => {
  // Size mappings
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  return (
    <Loader2
      className={clsx('animate-spin text-blue-600 dark:text-blue-400', className)}
      size={sizes[size]}
      data-cy={dataCy}
    />
  );
};

export default LoadingSpinner;