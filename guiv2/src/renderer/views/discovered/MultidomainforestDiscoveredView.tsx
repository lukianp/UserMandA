/**
 * Multidomainforest Discovered View
 *
 * Displays CSV data from multidomainforest/results.csv
 * Calls useCsvDataLoader hook directly and passes data to DiscoveredViewTemplate
 *
 * @module multidomainforest
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCsvDataLoader } from '../../hooks/useCsvDataLoader';
import { DiscoveredViewTemplate } from '../../components/organisms/DiscoveredViewTemplate';

/**
 * Multidomainforest discovered data view component
 */
export const MultidomainforestDiscoveredView: React.FC = () => {
  const componentKeyRef = useRef(`multidomainforest-${Date.now()}`);
  const mountCountRef = useRef(0);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    mountCountRef.current += 1;
    console.log(`[Multidomainforest] Component mounted (mount #${mountCountRef.current}, key: ${componentKeyRef.current})`);

    return () => {
      console.log(`[Multidomainforest] Component unmounted (mount #${mountCountRef.current})`);
    };
  }, []);

  // VIEW calls hook directly - template receives data as props
  const { data, columns, loading, error, lastRefresh, reload } = useCsvDataLoader(
    'multidomainforest/results.csv',
    {
      enableAutoRefresh: true,
      refreshInterval: 30000,
      onError: (err) => {
        console.error('[Multidomainforest] CSV load error:', err);
      },
      onSuccess: (loadedData, loadedColumns) => {
        console.log(`[Multidomainforest] Data loaded successfully: ${loadedData.length} rows, ${loadedColumns.length} columns`);
      },
    }
  );

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const handleRefresh = () => {
    console.log('[Multidomainforest] User triggered refresh');
    reload();
  };

  return (
    <div key={componentKeyRef.current}>
      <DiscoveredViewTemplate
        title="Multidomainforest"
        description="Multidomainforest discovered data from automated scanning"
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
        data-cy="multidomainforest-discovered-view"
      />
    </div>
  );
};

export default MultidomainforestDiscoveredView;
