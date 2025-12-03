/**
 * Discovered View Template Component
 *
 * Standardized template for displaying CSV data from discovery modules
 * Provides consistent UI/UX across all discovered data views with dark theme support
 */

import React, { useMemo, useState } from 'react';
import { ColDef } from 'ag-grid-community';
import { Download, RefreshCw, Search, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

import { VirtualizedDataGrid } from './VirtualizedDataGrid';
import { useCsvDataLoader } from '../../hooks/useCsvDataLoader';
import { BaseDiscoveryData, generateColumnDefs, parsePowerShellDate } from '../../types/discoveryData';
import { Button } from '../atoms/Button';
import { Spinner } from '../atoms/Spinner';

export interface DiscoveredViewTemplateProps<T extends BaseDiscoveryData = BaseDiscoveryData> {
  /** Module name (e.g., 'AWS', 'GCP', 'VMware') */
  moduleName: string;
  /** Relative CSV path from /public/discovery/ (e.g., 'aws/results.csv') */
  csvPath: string;
  /** Custom column definitions */
  columns?: ColDef<T>[];
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Enable search filter */
  enableSearch?: boolean;
  /** Enable export */
  enableExport?: boolean;
  /** Data-cy attribute for testing */
  'data-cy'?: string;
}

/**
 * Standardized discovered data view component
 */
export function DiscoveredViewTemplate<T extends BaseDiscoveryData = BaseDiscoveryData>({
  moduleName,
  csvPath,
  columns: customColumns,
  title,
  description,
  enableSearch = true,
  enableExport = true,
  'data-cy': dataCy,
}: DiscoveredViewTemplateProps<T>): JSX.Element {
  const [searchText, setSearchText] = useState('');
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  // Load CSV data
  const { data, loading, error, reload } = useCsvDataLoader<T>(csvPath, {
    maxRows: 100000,
    maxFileSize: 50 * 1024 * 1024,
    onError: (err) => {
      console.error(`[${moduleName}DiscoveredView] CSV load error:`, err);
    },
  });

  // Auto-generate or use custom column definitions
  const columnDefs = useMemo<ColDef<T>[]>(() => {
    if (customColumns && customColumns.length > 0) {
      return customColumns;
    }

    // Auto-generate from first data row
    if (data.length > 0) {
      return generateColumnDefs<T>(data[0]);
    }

    return [];
  }, [data, customColumns]);

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
      selected: selectedRows.length,
    };
  }, [data.length, filteredData.length, selectedRows.length]);

  const displayTitle = title || `${moduleName} Discovered Data`;
  const displayDescription = description || `Discovered data of ${moduleName} from CSV export`;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy={dataCy}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayTitle}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {displayDescription}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={reload}
              disabled={loading}
              aria-label="Reload data"
            >
              <RefreshCw size={16} className={clsx(loading && 'animate-spin')} />
              <span className="ml-2">Reload</span>
            </Button>
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
          {stats.selected > 0 && (
            <span>
              Selected: <strong className="text-gray-900 dark:text-white">{stats.selected.toLocaleString()}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Search bar */}
      {enableSearch && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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
        </div>
      )}

      {/* Data grid or error/loading states */}
      <div className="flex-1 p-6 overflow-hidden">
        {loading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading {moduleName} data...
              </p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Data
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {error.message}
              </p>
              <Button onClick={reload} variant="primary">
                <RefreshCw size={16} />
                <span className="ml-2">Try Again</span>
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && filteredData.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {searchText.trim()
                  ? 'No results match your search'
                  : 'No data available'}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filteredData.length > 0 && (
          <VirtualizedDataGrid<T>
            data={filteredData}
            columns={columnDefs}
            loading={loading}
            onSelectionChange={setSelectedRows}
            enableExport={enableExport}
            enableGrouping={true}
            height="calc(100vh - 280px)"
            data-cy={`${dataCy}-grid`}
          />
        )}
      </div>
    </div>
  );
}
