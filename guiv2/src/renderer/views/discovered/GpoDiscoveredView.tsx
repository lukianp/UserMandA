/**
 * Gpo Discovered View
 *
 * Displays CSV data from GPO_PlaceholderData.csv
 * Calls useCsvDataLoader hook directly and passes data to DiscoveredViewTemplate
 *
 * @module gpo
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCsvDataLoader } from '../../hooks/useCsvDataLoader';
import { DiscoveredViewTemplate } from '../../components/organisms/DiscoveredViewTemplate';

/**
 * Gpo discovered data view component
 */
export const GpoDiscoveredView: React.FC = () => {
  const componentKeyRef = useRef(`gpo-${Date.now()}`);
  const mountCountRef = useRef(0);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    mountCountRef.current += 1;
    console.log(`[Gpo] Component mounted (mount #${mountCountRef.current}, key: ${componentKeyRef.current})`);

    return () => {
      console.log(`[Gpo] Component unmounted (mount #${mountCountRef.current})`);
    };
  }, []);

  // VIEW calls hook directly - template receives data as props
  const { data, columns, loading, error, lastRefresh, reload } = useCsvDataLoader(
    'GPO_PlaceholderData.csv',
    {
      enableAutoRefresh: true,
      refreshInterval: 30000,
      onError: (err) => {
        console.error('[Gpo] CSV load error:', err);
      },
      onSuccess: (loadedData, loadedColumns) => {
        console.log(`[Gpo] Data loaded successfully: ${loadedData.length} rows, ${loadedColumns.length} columns`);
      },
    }
  );

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const handleRefresh = () => {
    console.log('[Gpo] User triggered refresh');
    reload();
  };

  return (
    <div key={componentKeyRef.current}>
      <DiscoveredViewTemplate
        title="Gpo"
        description="Gpo discovered data from automated scanning"
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
        data-cy="gpo-discovered-view"
      />
    </div>
  );
};

export default GpoDiscoveredView;
