/**
 * Azure Logic Apps Discovered Logic Hook
 * Loads discovered Logic Apps data from CSV files
 * Provides statistics, filtering, tabs, and export functions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';

type TabType = 'overview' | 'logicapps';

interface LogicApp {
  ObjectType: string;
  Name: string;
  SubscriptionId: string;
  ResourceGroupName: string;
  Location: string;
  State: string;
  Sku: string;
  Version: string;
  CreatedTime: string;
  ChangedTime: string;
  AccessEndpoint: string;
  TriggerCount: number | string;
  Triggers: string;
  RecentRunCount: number | string;
  LastRunTime: string;
  LastRunStatus: string;
  _DataType: string;
  SessionId: string;
}

interface AzureLogicAppsStats {
  totalLogicApps: number;
  enabledCount: number;
  disabledCount: number;
  totalTriggers: number;
  totalRecentRuns: number;
  succeededRuns: number;
  failedRuns: number;
  logicAppsByLocation: Record<string, number>;
  logicAppsBySku: Record<string, number>;
  topLocations: { name: string; count: number }[];
}

// Using AG Grid ColDef - field and headerName are required for proper rendering
import { ColDef } from 'ag-grid-community';

async function loadCsvFile<T>(basePath: string, filename: string): Promise<T[]> {
  const fullPath = `${basePath}\\Raw\\${filename}`;
  try {
    const exists = await window.electronAPI.fileExists(fullPath);
    if (!exists) return [];
    const csvText = await window.electronAPI.fs.readFile(fullPath, 'utf8');
    if (!csvText) return [];
    return new Promise((resolve) => {
      Papa.parse<T>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => resolve((results.data as T[]) || []),
        error: () => resolve([]),
      });
    });
  } catch {
    return [];
  }
}

export const useAzureLogicAppsDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [logicApps, setLogicApps] = useState<LogicApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!selectedSourceProfile?.companyName) {
        setIsLoading(false);
        setError('No profile selected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const basePath = selectedSourceProfile.dataPath || `C:\\DiscoveryData\\${selectedSourceProfile.companyName}`;
        const laData = await loadCsvFile<LogicApp>(basePath, 'AzureResourceDiscovery_LogicApps.csv');
        setLogicApps(laData);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  const stats = useMemo<AzureLogicAppsStats | null>(() => {
    if (logicApps.length === 0) return null;

    const locationCounts: Record<string, number> = {};
    const skuCounts: Record<string, number> = {};
    let enabled = 0, disabled = 0;
    let triggers = 0, recentRuns = 0;
    let succeeded = 0, failed = 0;

    logicApps.forEach((la) => {
      const loc = la.Location || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;

      const sku = la.Sku || 'Unknown';
      skuCounts[sku] = (skuCounts[sku] || 0) + 1;

      if (la.State === 'Enabled') enabled++;
      else disabled++;

      triggers += Number(la.TriggerCount) || 0;
      recentRuns += Number(la.RecentRunCount) || 0;

      if (la.LastRunStatus === 'Succeeded') succeeded++;
      else if (la.LastRunStatus === 'Failed') failed++;
    });

    const topLocations = Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalLogicApps: logicApps.length,
      enabledCount: enabled,
      disabledCount: disabled,
      totalTriggers: triggers,
      totalRecentRuns: recentRuns,
      succeededRuns: succeeded,
      failedRuns: failed,
      logicAppsByLocation: locationCounts,
      logicAppsBySku: skuCounts,
      topLocations,
    };
  }, [logicApps]);

  const filteredData = useMemo(() => {
    const search = searchText.toLowerCase();
    if (!search) return logicApps;
    return logicApps.filter(item =>
      Object.values(item).some(v => String(v).toLowerCase().includes(search))
    );
  }, [searchText, logicApps]);

  const columns = useMemo<ColDef[]>(() => {
    return [
      { field: 'Name', headerName: 'Name', width: 200 },
      { field: 'State', headerName: 'State', width: 100 },
      { field: 'Location', headerName: 'Location', width: 120 },
      { field: 'Sku', headerName: 'SKU', width: 100 },
      { field: 'ResourceGroupName', headerName: 'Resource Group', width: 180 },
      { field: 'TriggerCount', headerName: 'Triggers', width: 80 },
      { field: 'RecentRunCount', headerName: 'Recent Runs', width: 100 },
      { field: 'LastRunStatus', headerName: 'Last Status', width: 100 },
      { field: 'LastRunTime', headerName: 'Last Run', width: 150 },
      { field: 'Version', headerName: 'Version', width: 100 },
    ];
  }, []);

  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).filter(k => !k.startsWith('_'));
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const v = row[h];
        if (v == null) return '';
        if (typeof v === 'string' && (v.includes(',') || v.includes('"'))) return `"${v.replace(/"/g, '""')}"`;
        return v;
      }).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }, []);

  const reloadData = useCallback(async () => {
    setIsLoading(true);
    const basePath = selectedSourceProfile?.dataPath || `C:\\DiscoveryData\\${selectedSourceProfile?.companyName}`;
    if (basePath && selectedSourceProfile?.companyName) {
      try {
        const laData = await loadCsvFile<LogicApp>(basePath, 'AzureResourceDiscovery_LogicApps.csv');
        setLogicApps(laData);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  return {
    logicApps,
    isLoading,
    error,
    activeTab,
    searchText,
    stats,
    columns,
    filteredData,
    setActiveTab,
    setSearchText,
    reloadData,
    exportToCSV,
    clearError: () => setError(null),
  };
};
