import { useState, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import { WebServerDiscoveryConfig, WebServerDiscoveryResult, WebServerFilterState } from '../types/models/webserver';

export const useWebServerDiscoveryLogic = () => {
  const [config, setConfig] = useState<Partial<WebServerDiscoveryConfig>>({ timeout: 300000 });
  const [result, setResult] = useState<WebServerDiscoveryResult | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState<WebServerFilterState>({ searchText: '' });

  const startDiscovery = async () => {
    setIsDiscovering(true);
    setProgress(0);
    try {
      const discoveryResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/WebServerDiscovery.psm1',
        functionName: 'Invoke-WebServerDiscovery',
        parameters: config,
      });
      setResult(discoveryResult.data);
    } catch (error: any) {
      console.error('Discovery failed:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const cancelDiscovery = () => setIsDiscovering(false);
  const columns: ColDef[] = useMemo(() => [
    { field: 'id', headerName: 'ID', sortable: true, filter: true, width: 200 },
    { field: 'name', headerName: 'Name', sortable: true, filter: true, width: 250 },
  ], []);

  const filteredData = useMemo(() => {
    if (!result?.servers) return [];
    return result.servers.filter(item => {
      if (filter.searchText && !JSON.stringify(item).toLowerCase().includes(filter.searchText.toLowerCase())) return false;
      return true;
    });
  }, [result, filter]);

  return { config, setConfig, result, isDiscovering, progress, filter, setFilter, startDiscovery, cancelDiscovery, columns, filteredData, stats: result ? { totalFound: result.totalServersFound || 0 } : null };
};
