/**
 * Fileserver Discovered View
 *
 * Displays CSV data from FileSystemServers.csv
 * Calls useCsvDataLoader hook directly and passes data to DiscoveredViewTemplate
 *
 * @module fileserver
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCsvDataLoader } from '../../hooks/useCsvDataLoader';
import { DiscoveredViewTemplate } from '../../components/organisms/DiscoveredViewTemplate';

/**
 * Fileserver discovered data view component
 */
export const FileserverDiscoveredView: React.FC = () => {
  const componentKeyRef = useRef(`fileserver-${Date.now()}`);
  const mountCountRef = useRef(0);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    mountCountRef.current += 1;
    console.log(`[Fileserver] Component mounted (mount #${mountCountRef.current}, key: ${componentKeyRef.current})`);

    return () => {
      console.log(`[Fileserver] Component unmounted (mount #${mountCountRef.current})`);
    };
  }, []);

  // VIEW calls hook directly - template receives data as props
  const { data, columns, loading, error, lastRefresh, reload } = useCsvDataLoader(
    'FileSystemServers.csv',
    {
      enableAutoRefresh: true,
      refreshInterval: 30000,
      onError: (err) => {
        console.error('[Fileserver] CSV load error:', err);
      },
      onSuccess: (loadedData, loadedColumns) => {
        console.log(`[Fileserver] Data loaded successfully: ${loadedData.length} rows, ${loadedColumns.length} columns`);
      },
    }
  );

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const handleRefresh = () => {
    console.log('[Fileserver] User triggered refresh');
    reload();
  };

  return (
    <div key={componentKeyRef.current}>
      <DiscoveredViewTemplate
        title="Fileserver"
        description="Fileserver discovered data from automated scanning"
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
        data-cy="fileserver-discovered-view"
      />
    </div>
  );
};

export default FileserverDiscoveredView;
