/**
 * OrganisationMapFilters Component
 *
 * Filtering controls for the Organisation Map view.
 * Provides entity type, status, category, and search filters.
 *
 * Phase 7: Filtering Component Implementation
 */

import React, { useState, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  Filter,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
} from 'lucide-react';

import { EntityType, EntityStatus, FilterState } from '../../types/models/organisation';

export interface OrganisationMapFiltersProps {
  /** Current filter state */
  filters: FilterState;
  /** Filter change handler */
  onFiltersChange: (filters: FilterState) => void;
  /** Available categories from the data */
  availableCategories?: string[];
  /** Total entity count (unfiltered) */
  totalCount?: number;
  /** Filtered entity count */
  filteredCount?: number;
  /** Whether filters panel is expanded */
  isExpanded?: boolean;
  /** Toggle expanded state */
  onToggleExpanded?: () => void;
}

/**
 * Entity type configuration
 */
const ENTITY_TYPES: { type: EntityType; label: string; color: string }[] = [
  { type: 'datacenter', label: 'Data Center', color: '#f59e0b' },
  { type: 'it-component', label: 'IT Component', color: '#84cc16' },
  { type: 'application', label: 'Application', color: '#10b981' },
  { type: 'platform', label: 'Platform', color: '#8b5cf6' },
  { type: 'provider-interface', label: 'Provider Interface', color: '#06b6d4' },
  { type: 'consumer-interface', label: 'Consumer Interface', color: '#ec4899' },
  { type: 'business-capability', label: 'Business Capability', color: '#6366f1' },
  { type: 'company', label: 'Company', color: '#3b82f6' },
];

/**
 * Status configuration
 */
const STATUSES: { status: EntityStatus; label: string; color: string }[] = [
  { status: 'active', label: 'Active', color: '#22c55e' },
  { status: 'plan', label: 'Plan', color: '#3b82f6' },
  { status: 'phase-in', label: 'Phase In', color: '#eab308' },
  { status: 'phase-out', label: 'Phase Out', color: '#f97316' },
  { status: 'end-of-life', label: 'End of Life', color: '#ef4444' },
];

export const OrganisationMapFilters: React.FC<OrganisationMapFiltersProps> = ({
  filters,
  onFiltersChange,
  availableCategories = [],
  totalCount = 0,
  filteredCount = 0,
  isExpanded = true,
  onToggleExpanded,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const [showCategories, setShowCategories] = useState(false);

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
    // Debounce the actual filter update
    const timer = setTimeout(() => {
      onFiltersChange({
        ...filters,
        searchQuery: value,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, onFiltersChange]);

  // Toggle entity type
  const toggleEntityType = useCallback((type: EntityType) => {
    const newTypes = new Set(filters.entityTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    onFiltersChange({
      ...filters,
      entityTypes: newTypes,
    });
  }, [filters, onFiltersChange]);

  // Toggle status
  const toggleStatus = useCallback((status: EntityStatus) => {
    const newStatuses = new Set(filters.statuses);
    if (newStatuses.has(status)) {
      newStatuses.delete(status);
    } else {
      newStatuses.add(status);
    }
    onFiltersChange({
      ...filters,
      statuses: newStatuses,
    });
  }, [filters, onFiltersChange]);

  // Select all entity types
  const selectAllTypes = useCallback(() => {
    onFiltersChange({
      ...filters,
      entityTypes: new Set(ENTITY_TYPES.map(e => e.type)),
    });
  }, [filters, onFiltersChange]);

  // Clear all entity types
  const clearAllTypes = useCallback(() => {
    onFiltersChange({
      ...filters,
      entityTypes: new Set(),
    });
  }, [filters, onFiltersChange]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setLocalSearch('');
    onFiltersChange({
      entityTypes: new Set(ENTITY_TYPES.map(e => e.type)),
      statuses: new Set(STATUSES.map(s => s.status)),
      searchQuery: '',
    });
  }, [onFiltersChange]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery.length > 0 ||
      filters.entityTypes.size !== ENTITY_TYPES.length ||
      filters.statuses.size !== STATUSES.length
    );
  }, [filters]);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Compact Header */}
      <div className="px-4 py-2 flex items-center justify-between">
        <button
          onClick={onToggleExpanded}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <Filter size={16} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              Active
            </span>
          )}
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredCount}</span>
            {filteredCount !== totalCount && (
              <> of <span className="font-semibold">{totalCount}</span></>
            )} entities
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search entities by name..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {localSearch && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Entity Types */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Entity Types
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAllTypes}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  All
                </button>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <button
                  onClick={clearAllTypes}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  None
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ENTITY_TYPES.map(({ type, label, color }) => {
                const isSelected = filters.entityTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleEntityType(type)}
                    className={clsx(
                      'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full border transition-all',
                      isSelected
                        ? 'border-transparent text-white'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                    )}
                    style={{
                      backgroundColor: isSelected ? color : 'transparent',
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Statuses */}
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
              Status
            </span>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(({ status, label, color }) => {
                const isSelected = filters.statuses.has(status);
                return (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={clsx(
                      'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full border transition-all',
                      isSelected
                        ? 'border-transparent text-white'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                    )}
                    style={{
                      backgroundColor: isSelected ? color : 'transparent',
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories (if available) */}
          {availableCategories.length > 0 && (
            <div>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Categories ({availableCategories.length})
                {showCategories ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {showCategories && (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {availableCategories.slice(0, 20).map(category => (
                    <span
                      key={category}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                    >
                      {category}
                    </span>
                  ))}
                  {availableCategories.length > 20 && (
                    <span className="px-2 py-1 text-xs text-gray-400 dark:text-gray-500">
                      +{availableCategories.length - 20} more
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganisationMapFilters;
