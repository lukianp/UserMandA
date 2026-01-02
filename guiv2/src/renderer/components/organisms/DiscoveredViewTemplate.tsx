/**
 * Discovered View Template Component
 *
 * Pure presentation component for displaying CSV data from discovery modules
 * Provides consistent UI/UX across all discovered data views with dark theme support
 *
 * ARCHITECTURE: This component receives data as props - it does NOT call useCsvDataLoader.
 * Individual views are responsible for calling useCsvDataLoader and passing data to this template.
 */

import React, { useMemo, useCallback } from 'react';
import { ColDef } from 'ag-grid-community';
import { Download, RefreshCw, Search, AlertCircle, Info, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

import { VirtualizedDataGrid } from './VirtualizedDataGrid';
import { BaseDiscoveryData } from '../../types/discoveryData';
import { Button } from '../atoms/Button';
import { Spinner } from '../atoms/Spinner';

/**
 * Simple Discovery Status Card - shows whether data was loaded successfully
 * This is a simplified version for wrapper-based views
 */
const DiscoveryStatusCard: React.FC<{
  hasData: boolean;
  recordCount: number;
  loading: boolean;
  error: Error | null;
}> = ({ hasData, recordCount, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl p-4 text-white shadow-lg animate-pulse">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <RefreshCw size={20} className="animate-spin" />
          </div>
          <div>
            <p className="text-xs opacity-80">Discovery Status</p>
            <p className="text-lg font-bold">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs opacity-80">Discovery Status</p>
            <p className="text-lg font-bold">Error</p>
            <p className="text-xs opacity-80">Run discovery to load data</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs opacity-80">Discovery Status</p>
            <p className="text-lg font-bold">No Data</p>
            <p className="text-xs opacity-80">Run discovery first</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <p className="text-xs opacity-80">Discovery Status</p>
          <p className="text-lg font-bold">Data Loaded</p>
          <p className="text-xs opacity-80">{recordCount.toLocaleString()} records</p>
        </div>
      </div>
    </div>
  );
};

export interface DiscoveredViewTemplateProps<T extends BaseDiscoveryData = BaseDiscoveryData> {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Data array to display */
  data: T[];
  /** AG Grid column definitions */
  columns: ColDef<T>[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Search text value */
  searchText: string;
  /** Search change handler */
  onSearchChange: (value: string) => void;
  /** Refresh button handler */
  onRefresh: () => void;
  /** Optional export handler */
  onExport?: () => void;
  /** Last refresh timestamp */
  lastRefresh?: Date | null;
  /** Enable search filter */
  enableSearch?: boolean;
  /** Enable export */
  enableExport?: boolean;
  /** Data-cy attribute for testing */
  'data-cy'?: string;
  /** Unique key for persisting grid state (columns, filters, sorting) */
  persistenceKey?: string;
}

/**
 * Pure presentation component for discovered data views
 * Receives data as props and renders UI - does NOT handle data loading
 */
export const DiscoveredViewTemplate = React.memo<DiscoveredViewTemplateProps>(
  function DiscoveredViewTemplate({
    title,
    description,
    data = [],  // CRITICAL: Default to empty array to prevent undefined errors
    columns = [],  // CRITICAL: Default to empty array
    loading,
    error,
    searchText,
    onSearchChange,
    onRefresh,
    onExport,
    lastRefresh,
    enableSearch = true,
    enableExport = true,
    'data-cy': dataCy,
    persistenceKey,
  }) {
    // Removed excessive debug logging to reduce console noise









    // Filter data based on search text
    const filteredData = useMemo(() => {
      if (!searchText.trim()) {
        return data;
      }

      const searchLower = searchText.toLowerCase();
      return data.filter((row) => {
        return Object.values(row).some((value) => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }, [data, searchText]);

    // Calculate statistics
    const stats = useMemo(() => {
      return {
        total: data.length,
        filtered: filteredData.length,
      };
    }, [data.length, filteredData.length]);

    // Stable selection handler
    const handleSelectionChange = useCallback(() => {
      // Placeholder for future selection handling
    }, []);

    // Detect if error is a "discovery not run" scenario (file not found)
    const isDiscoveryNotRun = useMemo(() => {
      if (!error) return false;
      const errorMsg = error.message.toLowerCase();
      return errorMsg.includes('enoent') ||
             errorMsg.includes('no such file') ||
             errorMsg.includes('cannot find') ||
             errorMsg.includes('does not exist');
    }, [error]);

    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy={dataCy}>
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Discovery Status Card */}
              <DiscoveryStatusCard
                hasData={data.length > 0}
                recordCount={data.length}
                loading={loading}
                error={error}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
                {lastRefresh && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Last updated: {lastRefresh.toLocaleTimeString()} (auto-refresh: 30s)
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                aria-label="Reload data"
              >
                <RefreshCw size={16} className={clsx(loading && 'animate-spin')} />
                <span className="ml-2">Reload</span>
              </Button>
              {enableExport && onExport && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExport}
                  disabled={loading}
                  aria-label="Export data"
                >
                  <Download size={16} />
                  <span className="ml-2">Export</span>
                </Button>
              )}
            </div>
          </div>

          {/* Statistics bar */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Total: <strong className="text-gray-900 dark:text-white">{stats.total.toLocaleString()}</strong>
            </span>
            {stats.filtered !== stats.total && (
              <span>
                Filtered: <strong className="text-gray-900 dark:text-white">{stats.filtered.toLocaleString()}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Search bar and Quick Filters */}
        {enableSearch && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
            <div className="flex items-center gap-4">
              {/* Search input */}
              <div className="relative max-w-md flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className={clsx(
                    'w-full pl-10 pr-4 py-2 rounded-lg',
                    'bg-gray-50 dark:bg-gray-700',
                    'border border-gray-300 dark:border-gray-600',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-500 dark:placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
                    'transition-colors'
                  )}
                  aria-label="Search discovered data"
                />
              </div>

              {/* Quick Filter Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quick Filters:</span>
                <button
                  onClick={() => onSearchChange('active')}
                  className={clsx(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    'bg-green-100 text-green-800 hover:bg-green-200',
                    'dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                  )}
                  title="Filter for active/enabled items"
                >
                  Active Only
                </button>
                <button
                  onClick={() => onSearchChange('error')}
                  className={clsx(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    'bg-red-100 text-red-800 hover:bg-red-200',
                    'dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                  )}
                  title="Filter for errors or failed items"
                >
                  Errors Only
                </button>
                <button
                  onClick={() => onSearchChange('disabled')}
                  className={clsx(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
                    'dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800'
                  )}
                  title="Filter for disabled or inactive items"
                >
                  Disabled Only
                </button>
                {searchText && (
                  <button
                    onClick={() => onSearchChange('')}
                    className={clsx(
                      'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                      'bg-gray-100 text-gray-800 hover:bg-gray-200',
                      'dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    )}
                    title="Clear all filters"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Data grid or error/loading states */}
        <div className="flex-1 p-6 overflow-hidden">
          {loading && data.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading data...
                </p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                {isDiscoveryNotRun ? (
                  <>
                    <Info size={48} className="text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Discovery Not Run
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      The <strong>{title}</strong> discovery module has not been executed yet.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Run the discovery module from the Discovery tab to populate this view with data.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                      <p className="text-xs text-blue-700 dark:text-blue-300 text-left">
                        <strong>Tip:</strong> Navigate to the Discovery tab, select {title}, configure the target environment, and click "Start Discovery" to collect data.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Error Loading Data
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {error.message}
                    </p>
                    <Button onClick={onRefresh} variant="primary">
                      <RefreshCw size={16} />
                      <span className="ml-2">Try Again</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {!loading && !error && filteredData.length === 0 && data.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No data available
                </p>
              </div>
            </div>
          )}

          {!loading && !error && filteredData.length === 0 && data.length > 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No results match your search
                </p>
              </div>
            </div>
          )}

          {!error && (filteredData.length > 0 || loading) && (
            <VirtualizedDataGrid
              data={filteredData}
              columns={columns}
              loading={loading}
              onSelectionChange={handleSelectionChange}
              enableExport={enableExport}
              enableGrouping={true}
              height="calc(100vh - 280px)"
              data-cy={`${dataCy}-grid`}
              persistenceKey={persistenceKey}
            />
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
      prevProps.data === nextProps.data &&
      prevProps.columns === nextProps.columns &&
      prevProps.loading === nextProps.loading &&
      prevProps.error === nextProps.error &&
      prevProps.searchText === nextProps.searchText &&
      prevProps.lastRefresh === nextProps.lastRefresh
    );
  }
);


