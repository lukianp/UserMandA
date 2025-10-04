/**
 * Input Component
 *
 * Accessible input field with label, error states, and help text
 */

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, Info } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string;
  /** Helper text displayed below input */
  helperText?: string;
  /** Error message - when present, input shows error state */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Show optional label for non-required fields */
  showOptional?: boolean;
  /** Input size variant */
  inputSize?: 'sm' | 'md' | 'lg';
  /** Full width input */
  fullWidth?: boolean;
  /** Icon to display at the start of input */
  startIcon?: React.ReactNode;
  /** Icon to display at the end of input */
  endIcon?: React.ReactNode;
  /** Data attribute for Cypress testing */
  'data-cy'?: string;
}

/**
 * Input component with full accessibility support
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      required = false,
      showOptional = true,
      inputSize = 'md',
      fullWidth = false,
      startIcon,
      endIcon,
      className,
      id,
      'data-cy': dataCy,
      disabled = false,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Size styles
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg',
    };

    // Input classes
    const inputClasses = clsx(
      'block rounded-md border transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
      'dark:bg-gray-800 dark:text-gray-100',
      sizes[inputSize],
      fullWidth && 'w-full',
      startIcon && 'pl-10',
      endIcon && 'pr-10',
      error
        ? clsx(
            'border-red-500 text-red-900 placeholder-red-400',
            'focus:border-red-500 focus:ring-red-500',
            'dark:border-red-400 dark:text-red-400'
          )
        : clsx(
            'border-gray-300 placeholder-gray-400',
            'focus:border-blue-500 focus:ring-blue-500',
            'dark:border-gray-600 dark:placeholder-gray-500'
          ),
      className
    );

    // Container classes
    const containerClasses = clsx(fullWidth && 'w-full');

    // Label classes
    const labelClasses = clsx(
      'block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'
    );

    // Helper/Error text classes
    const helperClasses = clsx(
      'mt-1 text-sm',
      error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
    );

    return (
      <div className={containerClasses} data-cy={dataCy}>
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
            {!required && showOptional && (
              <span className="text-gray-500 dark:text-gray-400 ml-1 text-xs">
                (optional)
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400" aria-hidden="true">
                {startIcon}
              </span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            aria-invalid={!!error}
            aria-describedby={
              clsx(
                error && errorId,
                helperText && helperId
              ) || undefined
            }
            aria-required={required}
            disabled={disabled}
            {...props}
          />

          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400" aria-hidden="true">
                {endIcon}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div id={errorId} className={helperClasses} role="alert">
            <span className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" aria-hidden="true" />
              {error}
            </span>
          </div>
        )}

        {helperText && !error && (
          <div id={helperId} className={helperClasses}>
            <span className="flex items-center">
              <Info className="w-4 h-4 mr-1" aria-hidden="true" />
              {helperText}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';