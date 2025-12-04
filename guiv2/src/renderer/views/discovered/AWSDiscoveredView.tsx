/**
 * A W S Discovered View
 *
 * Displays CSV data from aws/results.csv
 * Calls useCsvDataLoader hook directly and passes data to DiscoveredViewTemplate
 *
 * @module aws
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCsvDataLoader } from '../../hooks/useCsvDataLoader';
import { DiscoveredViewTemplate } from '../../components/organisms/DiscoveredViewTemplate';

/**
 * A W S discovered data view component
 */
export const AWSDiscoveredView: React.FC = () => {
  const componentKeyRef = useRef(`aws-${Date.now()}`);
  const mountCountRef = useRef(0);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    mountCountRef.current += 1;
    console.log(`[A W S] Component mounted (mount #${mountCountRef.current}, key: ${componentKeyRef.current})`);

    return () => {
      console.log(`[A W S] Component unmounted (mount #${mountCountRef.current})`);
    };
  }, []);

  // VIEW calls hook directly - template receives data as props
  const { data, columns, loading, error, lastRefresh, reload } = useCsvDataLoader(
    'aws/results.csv',
    {
      enableAutoRefresh: true,
      refreshInterval: 30000,
      onError: (err) => {
        console.error('[A W S] CSV load error:', err);
      },
      onSuccess: (loadedData, loadedColumns) => {
        console.log(`[A W S] Data loaded successfully: ${loadedData.length} rows, ${loadedColumns.length} columns`);
      },
    }
  );

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const handleRefresh = () => {
    console.log('[A W S] User triggered refresh');
    reload();
  };

  return (
    <div key={componentKeyRef.current}>
      <DiscoveredViewTemplate
        title="A W S"
        description="A W S discovered data from automated scanning"
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
        data-cy="aws-discovered-view"
      />
    </div>
  );
};

export default AWSDiscoveredView;
