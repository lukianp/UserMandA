/**
 * Tooltip Component
 *
 * Accessible tooltip using Headless UI for proper positioning and accessibility.
 * Supports multiple positions and keyboard navigation.
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';

export interface TooltipProps {
  /** Element that triggers the tooltip */
  children: React.ReactElement;
  /** Tooltip content */
  content: React.ReactNode;
  /** Tooltip position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Show delay in milliseconds */
  delay?: number;
  /** Hide delay in milliseconds */
  hideDelay?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes for tooltip */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * Tooltip Component
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 200,
  hideDelay = 0,
  disabled = false,
  className,
  'data-cy': dataCy,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (disabled) return;

    // Clear any pending hide timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    // Set show timeout
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (disabled) return;

    // Clear any pending show timeout
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }

    // Set hide timeout
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
    setHideTimeout(timeout);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  const handleBlur = () => {
    if (disabled) return;
    setIsVisible(false);
  };

  // Position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Arrow classes
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900',
  };

  const tooltipClasses = clsx(
    // Base styles
    'absolute z-50',
    'px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg',
    'whitespace-nowrap',
    'pointer-events-none',

    // Animation
    'transition-opacity duration-200',
    {
      'opacity-100': isVisible,
      'opacity-0': !isVisible,
    },

    // Position
    positionClasses[position],

    className
  );

  if (disabled || !content) {
    return children;
  }

  return (
    <div className="relative inline-block">
      {/* Trigger element */}
      {React.cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
        'aria-describedby': isVisible ? 'tooltip' : undefined,
      })}

      {/* Tooltip */}
      {isVisible && (
        <div
          id="tooltip"
          role="tooltip"
          className={tooltipClasses}
          data-cy={dataCy}
        >
          {content}

          {/* Arrow */}
          <div
            className={clsx(
              'absolute w-0 h-0',
              'border-4',
              arrowClasses[position]
            )}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
