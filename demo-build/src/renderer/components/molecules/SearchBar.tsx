/**
 * SearchBar Component
 *
 * Search input with icon, clear button, and debounced onChange.
 * Used for filtering lists and tables.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  /** Current search value */
  value?: string;
  /** Change handler (debounced) */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * SearchBar Component
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value: controlledValue = '',
  onChange,
  placeholder = 'Search...',
  debounceDelay = 300,
  disabled = false,
  size = 'md',
  className,
  'data-cy': dataCy,
}) => {
  const [inputValue, setInputValue] = useState(controlledValue);

  // Sync with controlled value
  useEffect(() => {
    setInputValue(controlledValue);
  }, [controlledValue]);

  // Debounced onChange
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange && inputValue !== controlledValue) {
        onChange(inputValue);
      }
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, onChange, debounceDelay, controlledValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClear = useCallback(() => {
    setInputValue('');
    if (onChange) {
      onChange('');
    }
  }, [onChange]);

  // Size classes
  const sizeClasses = {
    sm: 'h-8 text-sm px-3',
    md: 'h-10 text-base px-4',
    lg: 'h-12 text-lg px-5',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const containerClasses = clsx(
    'relative flex items-center',
    className
  );

  const inputClasses = clsx(
    // Base styles
    'w-full rounded-lg border border-gray-300',
    'pl-10 pr-10',
    'bg-white text-gray-900 placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    'transition-all duration-200',

    // Size
    sizeClasses[size],

    // Disabled
    {
      'bg-gray-100 text-gray-500 cursor-not-allowed': disabled,
    }
  );

  return (
    <div className={containerClasses} data-cy={dataCy}>
      {/* Search icon */}
      <Search
        className={clsx(
          'absolute left-3 text-gray-400 pointer-events-none',
          iconSizeClasses[size]
        )}
        aria-hidden="true"
      />

      {/* Input */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        aria-label="Search"
      />

      {/* Clear button */}
      {inputValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className={clsx(
            'absolute right-3',
            'text-gray-400 hover:text-gray-600',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded',
            'transition-colors duration-200'
          )}
          aria-label="Clear search"
        >
          <X className={iconSizeClasses[size]} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;


