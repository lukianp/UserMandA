import { useState, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import { PowerPlatformDiscoveryConfig, PowerPlatformDiscoveryResult, PowerPlatformFilterState } from '../types/models/powerplatform';

export const usePowerPlatformDiscoveryLogic = () => {
  const [config, setConfig] = useState<Partial<PowerPlatformDiscoveryConfig>>({ timeout: 300000 });
  const [result, setResult] = useState<PowerPlatformDiscoveryResult | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState<PowerPlatformFilterState>({ searchText: '' });

  const startDiscovery = async () => {
    setIsDiscovering(true);
    setProgress(0);
    try {
      const discoveryResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/PowerPlatformDiscovery.psm1',
        functionName: 'Invoke-PowerPlatformDiscovery',
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
    if (!result?.apps) return [];
    return result.apps.filter(item => {
      if (filter.searchText && !JSON.stringify(item).toLowerCase().includes(filter.searchText.toLowerCase())) return false;
      return true;
    });
  }, [result, filter]);

  return { config, setConfig, result, isDiscovering, progress, filter, setFilter, startDiscovery, cancelDiscovery, columns, filteredData, stats: result ? { totalFound: result.totalAppsFound || 0 } : null };
};
