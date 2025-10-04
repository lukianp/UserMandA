import { useState, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';
import { LicenseDiscoveryConfig, LicenseDiscoveryResult, LicenseFilterState } from '../types/models/licensing';

export const useLicensingDiscoveryLogic = () => {
  const [config, setConfig] = useState<Partial<LicenseDiscoveryConfig>>({ timeout: 300000 });
  const [result, setResult] = useState<LicenseDiscoveryResult | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState<LicenseFilterState>({ searchText: '' });

  const startDiscovery = async () => {
    setIsDiscovering(true);
    setProgress(0);
    try {
      const discoveryResult = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/LicensingDiscovery.psm1',
        functionName: 'Invoke-LicenseDiscovery',
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
    if (!result?.licenses) return [];
    return result.licenses.filter(item => {
      if (filter.searchText && !JSON.stringify(item).toLowerCase().includes(filter.searchText.toLowerCase())) return false;
      return true;
    });
  }, [result, filter]);

  return { config, setConfig, result, isDiscovering, progress, filter, setFilter, startDiscovery, cancelDiscovery, columns, filteredData, stats: result ? { totalFound: result.totalLicensesFound || 0 } : null };
};
