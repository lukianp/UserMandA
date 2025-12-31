/**
 * Select Component
 *
 * Fully accessible dropdown select component with error states and validation.
 * Follows WCAG 2.1 AA guidelines.
 */

import React, { useId } from 'react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Label text for the select */
  label?: string;
  /** Field name */
  name?: string;
  /** Current selected value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Options to display */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Required field indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * Select Component
 */
export const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  error,
  helperText,
  required = false,
  disabled = false,
  className,
  'data-cy': dataCy,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const selectClasses = clsx(
    // Base styles
    'block w-full rounded-md border px-3 py-2 shadow-sm',
    'text-base leading-6',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',

    // State-based styles
    {
      // Normal state
      'border-gray-300 bg-white text-gray-900': !hasError && !disabled,
      'focus:border-blue-500 focus:ring-blue-500': !hasError && !disabled,

      // Error state
      'border-red-300 bg-red-50 text-red-900': hasError && !disabled,
      'focus:border-red-500 focus:ring-red-500': hasError && !disabled,

      // Disabled state
      'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed': disabled,
    },

    className
  );

  const labelClasses = clsx(
    'block text-sm font-medium mb-1',
    {
      'text-gray-700': !hasError,
      'text-red-700': hasError,
      'text-gray-500': disabled,
    }
  );

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Select Element */}
      <select
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className={selectClasses}
        aria-invalid={hasError}
        aria-describedby={clsx({
          [errorId]: hasError,
          [helperId]: helperText && !hasError,
        })}
        aria-required={required}
        data-cy={dataCy}
      >
        {/* Placeholder option */}
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {/* Options */}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Error Message */}
      {hasError && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !hasError && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Select;


