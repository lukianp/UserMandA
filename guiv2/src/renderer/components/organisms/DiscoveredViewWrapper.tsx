/**
 * Discovered View Wrapper Component
 *
 * Wrapper component that handles CSV data loading and passes data to DiscoveredViewTemplate.
 * This bridges the simple props interface (moduleName, csvPath) with the full template interface.
 *
 * Usage:
 * <DiscoveredViewWrapper
 *   moduleName="Exchange"
 *   csvPath="ExchangeDiscovery.csv"
 *   title="Exchange"
 *   description="Exchange mailboxes and groups"
 * />
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DiscoveredViewTemplate } from './DiscoveredViewTemplate';
import { useCsvDataLoader } from '../../hooks/useCsvDataLoader';

export interface DiscoveredViewWrapperProps {
  /** Module name for loading CSV */
  moduleName: string;
  /** CSV file path (relative to Raw directory) */
  csvPath: string;
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Enable search filter (default: true) */
  enableSearch?: boolean;
  /** Enable export (default: true) */
  enableExport?: boolean;
  /** Data-cy attribute for testing */
  'data-cy'?: string;
  /** Optional filter function to apply to loaded data */
  dataFilter?: (data: Record<string, any>[]) => Record<string, any>[];
  /** Callback when raw data is loaded (before filtering) */
  onDataLoaded?: (data: Record<string, any>[], columns: any[]) => void;
  /** Optional custom header content to render */
  headerContent?: React.ReactNode;
}

/**
 * Wrapper component that loads CSV data and renders DiscoveredViewTemplate
 */
export const DiscoveredViewWrapper: React.FC<DiscoveredViewWrapperProps> = ({
  moduleName,
  csvPath,
  title,
  description,
  enableSearch = true,
  enableExport = true,
  'data-cy': dataCy,
  dataFilter,
  onDataLoaded,
  headerContent,
}) => {
  const [searchText, setSearchText] = useState('');

  // Load CSV data using the hook
  const {
    data: rawData,
    columns,
    loading,
    error,
    lastRefresh,
    reload,
  } = useCsvDataLoader(csvPath, {
    enableAutoRefresh: true,
    refreshInterval: 30000,
    gracefulDegradation: true, // Return empty data instead of error for missing files
  });

  // Notify parent when raw data is loaded
  useEffect(() => {
    if (rawData && rawData.length > 0 && onDataLoaded) {
      onDataLoaded(rawData, columns);
    }
  }, [rawData, columns, onDataLoaded]);

  // Apply optional data filter
  const data = useMemo(() => {
    if (!rawData) return rawData;
    if (!dataFilter) return rawData;
    return dataFilter(rawData);
  }, [rawData, dataFilter]);

  // Handle search text change
  const handleSearchChange = useCallback((value: string) => {
    setSearchText(value);
  }, []);

  // Handle export
  const handleExport = useCallback(() => {
    if (!data || data.length === 0) return;

    // Create CSV content
    const headers = columns.map(col => col.field || '').join(',');
    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.field as keyof typeof row];
        // Escape values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${moduleName}_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data, columns, moduleName]);

  return (
    <>
      {headerContent}
      <DiscoveredViewTemplate
        title={title}
        description={description}
        data={data}
        columns={columns}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onRefresh={reload}
        onExport={handleExport}
        lastRefresh={lastRefresh}
        enableSearch={enableSearch}
        enableExport={enableExport}
        data-cy={dataCy}
        persistenceKey={csvPath}
      />
    </>
  );
};

export default DiscoveredViewWrapper;
