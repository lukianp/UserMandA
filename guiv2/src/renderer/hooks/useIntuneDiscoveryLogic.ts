import { useState, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import { IntuneDiscoveryConfig, IntuneDiscoveryResult, IntuneFilterState } from '../types/models/intune';

export const useIntuneDiscoveryLogic = () => {
  const [config, setConfig] = useState<Partial<IntuneDiscoveryConfig>>({ timeout: 300000 });
  const [result, setResult] = useState<IntuneDiscoveryResult | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState<IntuneFilterState>({ searchText: '' });

  const startDiscovery = async () => {
    setIsDiscovering(true);
    setProgress(0);
    try {
      const discoveryResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/IntuneDiscovery.psm1',
        functionName: 'Invoke-IntuneDiscovery',
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
    if (!result?.devices) return [];
    return result.devices.filter(item => {
      if (filter.searchText && !JSON.stringify(item).toLowerCase().includes(filter.searchText.toLowerCase())) return false;
      return true;
    });
  }, [result, filter]);

  return { config, setConfig, result, isDiscovering, progress, filter, setFilter, startDiscovery, cancelDiscovery, columns, filteredData, stats: result ? { totalFound: result.totalDevicesFound || 0 } : null };
};
