/**
 * File Systems Discovered View
 *
 * Displays CSV data from FileSystemShares.csv
 * Calls useCsvDataLoader hook directly and passes data to DiscoveredViewTemplate
 *
 * @module filesystem
 * @category infrastructure
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCsvDataLoader } from '../../hooks/useCsvDataLoader';
import { DiscoveredViewTemplate } from '../../components/organisms/DiscoveredViewTemplate';

/**
 * File Systems discovered data view component
 */
export const FilesystemDiscoveredView: React.FC = () => {
  const componentKeyRef = useRef(`filesystem-${Date.now()}`);
  const mountCountRef = useRef(0);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    mountCountRef.current += 1;
    console.log(`[File Systems] Component mounted (mount #${mountCountRef.current}, key: ${componentKeyRef.current})`);

    return () => {
      console.log(`[File Systems] Component unmounted (mount #${mountCountRef.current})`);
    };
  }, []);

  // VIEW calls hook directly - template receives data as props
  const { data, columns, loading, error, lastRefresh, reload } = useCsvDataLoader(
    'FileSystemShares.csv',
    {
      enableAutoRefresh: true,
      refreshInterval: 30000,
      onError: (err) => {
        console.error('[File Systems] CSV load error:', err);
      },
      onSuccess: (loadedData, loadedColumns) => {
        console.log(`[File Systems] Data loaded successfully: ${loadedData.length} rows, ${loadedColumns.length} columns`);
      },
    }
  );

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    console.log(`[File Systems] Search changed: "${value}"`);
  };

  const handleRefresh = () => {
    console.log('[File Systems] User triggered refresh');
    reload();
  };

  return (
    <div key={componentKeyRef.current}>
      <DiscoveredViewTemplate
        title="File Systems"
        description="File system shares, permissions, and large files from discovery"
        data={data}
        columns={columns}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onRefresh={handleRefresh}
        lastRefresh={lastRefresh}
        enableSearch={true}
        enableExport={true}
        data-cy="filesystem-discovered-view"
      />
    </div>
  );
};

export default FilesystemDiscoveredView;
