/**
 * FilterPanel Component
 *
 * Collapsible panel containing multiple filter inputs.
 * Used for advanced filtering in data views.
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

import { Button } from '../atoms/Button';

export interface FilterConfig {
  /** Unique filter ID */
  id: string;
  /** Filter label */
  label: string;
  /** Filter type */
  type: 'text' | 'select' | 'date' | 'checkbox';
  /** Options for select type */
  options?: Array<{ value: string; label: string }>;
  /** Current value */
  value?: any;
  /** Placeholder text */
  placeholder?: string;
}

export interface FilterPanelProps {
  /** Array of filter configurations */
  filters: FilterConfig[];
  /** Change handler for filter values */
  onFilterChange?: (filterId: string, value: any) => void;
  /** Reset all filters handler */
  onReset?: () => void;
  /** Initially collapsed */
  defaultCollapsed?: boolean;
  /** Panel title */
  title?: string;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * FilterPanel Component
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  defaultCollapsed = false,
  title = 'Filters',
  className,
  'data-cy': dataCy,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleFilterChange = (filterId: string, value: any) => {
    if (onFilterChange) {
      onFilterChange(filterId, value);
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Check if any filters have values
  const hasActiveFilters = filters.some(f => {
    if (f.type === 'checkbox') return f.value === true;
    return f.value !== undefined && f.value !== '' && f.value !== null;
  });

  const containerClasses = clsx(
    'border border-gray-300 rounded-lg bg-white shadow-sm',
    className
  );

  return (
    <div className={containerClasses} data-cy={dataCy}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button
          type="button"
          onClick={toggleCollapse}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          <span>{title}</span>
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
              {filters.filter(f => f.value).length}
            </span>
          )}
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        {/* Reset button */}
        {hasActiveFilters && !isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            icon={<X className="h-4 w-4" />}
            data-cy="filter-reset"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Filter inputs */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {filters.map((filter) => (
            <div key={filter.id}>
              <label
                htmlFor={filter.id}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {filter.label}
              </label>

              {/* Text input */}
              {filter.type === 'text' && (
                <input
                  id={filter.id}
                  type="text"
                  value={filter.value || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  placeholder={filter.placeholder}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-cy={`filter-${filter.id}`}
                />
              )}

              {/* Select input */}
              {filter.type === 'select' && (
                <select
                  id={filter.id}
                  value={filter.value || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-cy={`filter-${filter.id}`}
                >
                  <option value="">All</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Date input */}
              {filter.type === 'date' && (
                <input
                  id={filter.id}
                  type="date"
                  value={filter.value || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-cy={`filter-${filter.id}`}
                />
              )}

              {/* Checkbox input */}
              {filter.type === 'checkbox' && (
                <div className="flex items-center">
                  <input
                    id={filter.id}
                    type="checkbox"
                    checked={filter.value || false}
                    onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    data-cy={`filter-${filter.id}`}
                  />
                  <label htmlFor={filter.id} className="ml-2 text-sm text-gray-600">
                    {filter.placeholder || 'Enable'}
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
