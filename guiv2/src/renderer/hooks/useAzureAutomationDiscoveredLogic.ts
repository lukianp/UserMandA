/**
 * Azure Automation Accounts Discovered Logic Hook
 * Contains business logic for viewing discovered Azure Automation data from CSV files
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';
import { ColDef } from 'ag-grid-community';

interface AutomationAccount {
  ObjectType: string;
  Name: string;
  SubscriptionId: string;
  ResourceGroupName: string;
  Location: string;
  State: string;
  CreationTime: string;
  LastModifiedTime: string;
  RunbookCount: string;
  VariableCount: string;
  ScheduleCount: string;
  CredentialCount: string;
  Runbooks: string;
  Tags: string;
  _DataType: string;
  SessionId: string;
}

type TabType = 'overview' | 'accounts';

interface AzureAutomationStats {
  totalAccounts: number;
  totalRunbooks: number;
  totalSchedules: number;
  totalCredentials: number;
  totalVariables: number;
  accountsByLocation: Array<{ name: string; count: number }>;
  accountsByResourceGroup: Array<{ name: string; count: number }>;
  runbookTypes: Array<{ name: string; count: number }>;
  discoverySuccessPercentage: number;
  dataSourcesReceivedCount: number;
  dataSourcesTotal: number;
}

// Helper function to load and parse CSV file
async function loadCsvFile<T>(basePath: string, filename: string): Promise<T[]> {
  const fullPath = `${basePath}\\Raw\\${filename}`;

  try {
    const exists = await window.electronAPI.fileExists(fullPath);
    if (!exists) {
      return [];
    }

    const csvText = await window.electronAPI.fs.readFile(fullPath, 'utf8');
    if (!csvText || csvText.length === 0) {
      return [];
    }

    return new Promise((resolve) => {
      Papa.parse<T>(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve((results.data as T[]) || []);
        },
        error: () => {
          resolve([]);
        },
      });
    });
  } catch {
    return [];
  }
}

export const useAzureAutomationDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [accounts, setAccounts] = useState<AutomationAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchText, setSearchText] = useState('');

  // Load data from CSV files on mount
  useEffect(() => {
    const loadData = async () => {
      if (!selectedSourceProfile?.companyName) {
        setError('No profile selected');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const basePath = selectedSourceProfile.dataPath || `C:\\DiscoveryData\\${selectedSourceProfile.companyName}`;
        const data = await loadCsvFile<AutomationAccount>(basePath, 'AzureResourceDiscovery_AutomationAccounts.csv');
        setAccounts(data);
        setIsLoading(false);
      } catch (err: any) {
        console.error('[AzureAutomationDiscoveredHook] Failed to load data:', err);
        setError(err.message || 'Failed to load Azure Automation data');
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Filtered accounts
  const filteredData = useMemo(() => {
    if (!searchText) return accounts;

    const search = searchText.toLowerCase();
    return accounts.filter(account =>
      account.Name?.toLowerCase().includes(search) ||
      account.ResourceGroupName?.toLowerCase().includes(search) ||
      account.Location?.toLowerCase().includes(search)
    );
  }, [accounts, searchText]);

  // Columns for the data grid
  const columns = useMemo<ColDef[]>(() => [
    { field: 'Name', headerName: 'Account Name', width: 200 },
    { field: 'ResourceGroupName', headerName: 'Resource Group', width: 180 },
    { field: 'Location', headerName: 'Location', width: 120 },
    { field: 'State', headerName: 'State', width: 100 },
    { field: 'RunbookCount', headerName: 'Runbooks', width: 100, type: 'numericColumn' },
    { field: 'ScheduleCount', headerName: 'Schedules', width: 100, type: 'numericColumn' },
    { field: 'CredentialCount', headerName: 'Credentials', width: 100, type: 'numericColumn' },
    { field: 'VariableCount', headerName: 'Variables', width: 100, type: 'numericColumn' },
    { field: 'CreationTime', headerName: 'Created', width: 180 },
  ], []);

  // Statistics
  const stats = useMemo<AzureAutomationStats | null>(() => {
    if (accounts.length === 0) return null;

    // Discovery Success Calculation
    const expectedSources = [
      { name: 'AutomationAccounts', hasData: accounts.length > 0, weight: 100 },
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
    const discoverySuccessPercentage = Math.round((achievedWeight / totalWeight) * 100);
    const dataSourcesReceivedCount = expectedSources.filter(s => s.hasData).length;
    const dataSourcesTotal = expectedSources.length;

    // Calculate totals
    const totalRunbooks = accounts.reduce((sum, a) => sum + (parseInt(a.RunbookCount) || 0), 0);
    const totalSchedules = accounts.reduce((sum, a) => sum + (parseInt(a.ScheduleCount) || 0), 0);
    const totalCredentials = accounts.reduce((sum, a) => sum + (parseInt(a.CredentialCount) || 0), 0);
    const totalVariables = accounts.reduce((sum, a) => sum + (parseInt(a.VariableCount) || 0), 0);

    // Accounts by location
    const locationCounts: Record<string, number> = {};
    accounts.forEach(a => {
      const loc = a.Location || 'Unknown';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    const accountsByLocation = Object.entries(locationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Accounts by resource group
    const rgCounts: Record<string, number> = {};
    accounts.forEach(a => {
      const rg = a.ResourceGroupName || 'Unknown';
      rgCounts[rg] = (rgCounts[rg] || 0) + 1;
    });
    const accountsByResourceGroup = Object.entries(rgCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Parse runbook types from Runbooks JSON field
    const runbookTypeCounts: Record<string, number> = {};
    accounts.forEach(a => {
      if (a.Runbooks) {
        try {
          const runbooks = JSON.parse(a.Runbooks);
          runbooks.forEach((rb: any) => {
            const type = rb.RunbookType || 'Unknown';
            runbookTypeCounts[type] = (runbookTypeCounts[type] || 0) + 1;
          });
        } catch {
          // JSON parse failed, skip
        }
      }
    });
    const runbookTypes = Object.entries(runbookTypeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalAccounts: accounts.length,
      totalRunbooks,
      totalSchedules,
      totalCredentials,
      totalVariables,
      accountsByLocation,
      accountsByResourceGroup,
      runbookTypes,
      discoverySuccessPercentage,
      dataSourcesReceivedCount,
      dataSourcesTotal,
    };
  }, [accounts]);

  // Export to CSV
  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]).filter(k => !k.startsWith('_'));
    const csvContent = [
      headers.join(','),
      ...data.map((row: any) =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }, []);

  // Reload data
  const reloadData = useCallback(async () => {
    setIsLoading(true);
    const basePath = selectedSourceProfile?.dataPath || `C:\\DiscoveryData\\${selectedSourceProfile?.companyName}`;

    if (basePath && selectedSourceProfile?.companyName) {
      try {
        const data = await loadCsvFile<AutomationAccount>(basePath, 'AzureResourceDiscovery_AutomationAccounts.csv');
        setAccounts(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  return {
    // State
    accounts,
    isLoading,
    error,
    activeTab,
    searchText,

    // Computed
    stats,
    columns,
    filteredData,

    // Actions
    setActiveTab,
    setSearchText,
    clearError,
    exportToCSV,
    reloadData,
  };
};
