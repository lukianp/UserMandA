/**
 * Checkbox Component
 *
 * Fully accessible checkbox component with labels and error states.
 * Follows WCAG 2.1 AA guidelines.
 */

import React, { useId } from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface CheckboxProps {
  /** Label text for the checkbox */
  label?: string;
  /** Description text */
  description?: string;
  /** Checked state */
  checked?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Indeterminate state (for "select all" checkboxes) */
  indeterminate?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * Checkbox Component
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  checked = false,
  onChange,
  error,
  disabled = false,
  indeterminate = false,
  className,
  'data-cy': dataCy,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  const hasError = Boolean(error);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  // Handle indeterminate via ref
  const checkboxRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const checkboxClasses = clsx(
    // Base styles
    'h-5 w-5 rounded border-2',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',

    // State-based styles
    {
      // Normal state
      'border-gray-300 bg-white text-blue-600': !hasError && !disabled,
      'focus:ring-blue-500': !hasError && !disabled,

      // Checked state
      'bg-blue-600 border-blue-600': checked && !disabled && !hasError,

      // Error state
      'border-red-500 text-red-600': hasError && !disabled,
      'focus:ring-red-500': hasError && !disabled,

      // Disabled state
      'border-gray-200 bg-gray-100 cursor-not-allowed': disabled,
    }
  );

  const labelClasses = clsx('text-sm font-medium', {
    'text-gray-700': !hasError && !disabled,
    'text-red-700': hasError && !disabled,
    'text-gray-500': disabled,
  });

  return (
    <div className={clsx('flex flex-col', className)}>
      <div className="flex items-start">
        {/* Hidden native checkbox for accessibility */}
        <div className="flex items-center h-5">
          <input
            ref={checkboxRef}
            id={id}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only peer"
            aria-invalid={hasError}
            aria-describedby={clsx({
              [errorId]: hasError,
              [descriptionId]: description,
            })}
            data-cy={dataCy}
          />

          {/* Custom checkbox visualization */}
          <label
            htmlFor={id}
            className={clsx(
              checkboxClasses,
              'flex items-center justify-center cursor-pointer',
              {
                'cursor-not-allowed': disabled,
              }
            )}
          >
            {/* Check icon */}
            {checked && !indeterminate && (
              <Check className="h-4 w-4 text-white" strokeWidth={3} />
            )}
            {/* Indeterminate indicator */}
            {indeterminate && (
              <div className="h-0.5 w-3 bg-white rounded" />
            )}
          </label>
        </div>

        {/* Label and description */}
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label htmlFor={id} className={clsx(labelClasses, 'cursor-pointer')}>
                {label}
              </label>
            )}
            {description && (
              <p id={descriptionId} className="text-sm text-gray-500 mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p
          id={errorId}
          className="mt-1 ml-8 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Checkbox;
