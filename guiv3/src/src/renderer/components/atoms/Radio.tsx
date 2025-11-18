/**
 * Radio Button Component
 * Accessible radio button input with label support
 */

import React from 'react';

export interface RadioProps {
  /** Radio button label */
  label?: string;
  /** Radio button value */
  value: string;
  /** Selected value (for controlled component) */
  checked?: boolean;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Radio button name (for grouping) */
  name?: string;
  /** Additional CSS classes */
  className?: string;
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * Radio Button Component
 */
const Radio: React.FC<RadioProps> = ({
  label,
  value,
  checked = false,
  onChange,
  disabled = false,
  name,
  className = '',
  'data-cy': dataCy,
}) => {
  const id = `radio-${value}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        type="radio"
        value={value}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        data-cy={dataCy}
      />
      {label && (
        <label
          htmlFor={id}
          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer select-none"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Radio;
