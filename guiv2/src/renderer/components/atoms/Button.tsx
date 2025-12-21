/**
 * Button Component
 *
 * Fully accessible button with multiple variants and sizes
 */

import React, { forwardRef, ButtonHTMLAttributes, useState } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'gradient' | 'gradient-success';
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Icon position relative to text */
  iconPosition?: 'leading' | 'trailing';
  /** Loading state - shows spinner and disables interaction */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Children content */
  children?: React.ReactNode;
  /** Data attribute for Cypress testing */
  'data-cy'?: string;
}

/**
 * Button component with full accessibility support
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'leading',
      loading = false,
      disabled = false,
      fullWidth = false,
      children,
      className,
      onClick,
      'data-cy': dataCy,
      ...props
    },
    ref
  ) => {
    // Ripple state
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    // Variant styles
    const variants = {
      primary: clsx(
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        'disabled:bg-blue-300 disabled:cursor-not-allowed',
        'dark:bg-blue-500 dark:hover:bg-blue-600'
      ),
      secondary: clsx(
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400',
        'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
        'dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
      ),
      danger: clsx(
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        'disabled:bg-red-300 disabled:cursor-not-allowed',
        'dark:bg-red-500 dark:hover:bg-red-600'
      ),
      ghost: clsx(
        'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
        'disabled:text-gray-400 disabled:cursor-not-allowed',
        'dark:text-gray-300 dark:hover:bg-gray-800'
      ),
      link: clsx(
        'bg-transparent text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline',
        'disabled:text-blue-300 disabled:cursor-not-allowed',
        'dark:text-blue-400 dark:hover:text-blue-300'
      ),
      gradient: clsx(
        'bg-neon-cyan-gradient text-white',
        'hover:gradient-shift',
        'focus:ring-cyan-500',
        'shadow-button hover:shadow-neon-cyan',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      ),
      'gradient-success': clsx(
        'bg-success-gradient text-white',
        'hover:gradient-shift',
        'focus:ring-emerald-500',
        'shadow-button hover:shadow-lg',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      ),
    };

    // Size styles
    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
      xl: 'px-6 py-3 text-base',
    };

    // Base button classes
    const baseClasses = clsx(
      'relative overflow-hidden',
      'inline-flex items-center justify-center',
      'font-medium rounded-md',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50',
      fullWidth && 'w-full',
      variants[variant],
      sizes[size],
      className
    );

    // Handle click with loading state and ripple effect
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!loading && !disabled) {
        // Create ripple effect
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { x, y, id }]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
        }, 600);

        if (onClick) {
          onClick(e);
        }
      }
    };

    // Render loading spinner
    const renderLoadingIcon = () => (
      <Loader2 className="animate-spin" size={16} aria-hidden="true" />
    );

    // Render icon
    const renderIcon = () => {
      if (loading) return renderLoadingIcon();
      return icon;
    };

    return (
      <button
        ref={ref}
        className={baseClasses}
        onClick={handleClick}
        disabled={disabled || loading}
        aria-busy={loading ? "true" : undefined}
        aria-disabled={disabled || loading ? "true" : undefined}
        aria-pressed={variant === 'primary' ? undefined : "false"}
        aria-describedby={loading ? 'button-loading' : undefined}
        data-cy={dataCy}
        {...props}
      >
        {loading && (
          <span id="button-loading" className="sr-only">
            Loading
          </span>
        )}
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 10,
              height: 10,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {iconPosition === 'leading' && renderIcon() && (
          <span className="mr-2">{renderIcon()}</span>
        )}
        <span>{children}</span>
        {iconPosition === 'trailing' && renderIcon() && (
          <span className="ml-2">{renderIcon()}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';