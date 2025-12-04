/**
 * Hyper V Discovered View
 *
 * Displays CSV data from hyperv/results.csv
 * Calls useCsvDataLoader hook directly and passes data to DiscoveredViewTemplate
 *
 * @module hyperv
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCsvDataLoader } from '../../hooks/useCsvDataLoader';
import { DiscoveredViewTemplate } from '../../components/organisms/DiscoveredViewTemplate';

/**
 * Hyper V discovered data view component
 */
export const HyperVDiscoveredView: React.FC = () => {
  const componentKeyRef = useRef(`hyperv-${Date.now()}`);
  const mountCountRef = useRef(0);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    mountCountRef.current += 1;
    console.log(`[Hyper V] Component mounted (mount #${mountCountRef.current}, key: ${componentKeyRef.current})`);

    return () => {
      console.log(`[Hyper V] Component unmounted (mount #${mountCountRef.current})`);
    };
  }, []);

  // VIEW calls hook directly - template receives data as props
  const { data, columns, loading, error, lastRefresh, reload } = useCsvDataLoader(
    'hyperv/results.csv',
    {
      enableAutoRefresh: true,
      refreshInterval: 30000,
      onError: (err) => {
        console.error('[Hyper V] CSV load error:', err);
      },
      onSuccess: (loadedData, loadedColumns) => {
        console.log(`[Hyper V] Data loaded successfully: ${loadedData.length} rows, ${loadedColumns.length} columns`);
      },
    }
  );

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const handleRefresh = () => {
    console.log('[Hyper V] User triggered refresh');
    reload();
  };

  return (
    <div key={componentKeyRef.current}>
      <DiscoveredViewTemplate
        title="Hyper V"
        description="Hyper V discovered data from automated scanning"
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
        data-cy="hyperv-discovered-view"
      />
    </div>
  );
};

export default HyperVDiscoveredView;
