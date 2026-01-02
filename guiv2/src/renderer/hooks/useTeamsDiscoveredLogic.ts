/**
 * Microsoft Teams Discovered Logic Hook
 * Loads discovered Teams data from CSV files
 * Provides statistics, filtering, tabs, and export functions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';
import { ColDef } from 'ag-grid-community';

interface MicrosoftTeam {
  ObjectType: string;
  Id: string;
  DisplayName: string;
  Description: string;
  CreatedDateTime: string;
  Visibility: string;
  _DataType: string;
  SessionId: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

type TabType = 'overview' | 'teams';

interface TeamsStats {
  totalTeams: number;
  publicTeams: number;
  privateTeams: number;
  byVisibility: Array<{ name: string; count: number }>;
  recentTeams: number;
  discoverySuccessPercentage: number;
  dataSourcesReceivedCount: number;
  dataSourcesTotal: number;
}

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

export const useTeamsDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [teams, setTeams] = useState<MicrosoftTeam[]>([]);
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
        const data = await loadCsvFile<MicrosoftTeam>(basePath, 'AzureDiscovery_MicrosoftTeams.csv');
        setTeams(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  const clearError = useCallback(() => setError(null), []);

  const filteredData = useMemo(() => {
    if (!searchText) return teams;
    const search = searchText.toLowerCase();
    return teams.filter(t =>
      t.DisplayName?.toLowerCase().includes(search) ||
      t.Description?.toLowerCase().includes(search) ||
      t.Visibility?.toLowerCase().includes(search)
    );
  }, [teams, searchText]);

  const columns = useMemo<ColDef[]>(() => [
    { field: 'DisplayName', headerName: 'Team Name', width: 250 },
    { field: 'Description', headerName: 'Description', width: 300 },
    { field: 'Visibility', headerName: 'Visibility', width: 120 },
    { field: 'CreatedDateTime', headerName: 'Created', width: 180 },
    { field: 'Id', headerName: 'Team ID', width: 300 },
  ], []);

  const stats = useMemo<TeamsStats | null>(() => {
    if (teams.length === 0) return null;

    // Discovery Success
    const expectedSources = [
      { name: 'MicrosoftTeams', hasData: teams.length > 0, weight: 100 },
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
    const discoverySuccessPercentage = Math.round((achievedWeight / totalWeight) * 100);
    const dataSourcesReceivedCount = expectedSources.filter(s => s.hasData).length;
    const dataSourcesTotal = expectedSources.length;

    // Visibility counts
    const visibilityCounts: Record<string, number> = {};
    teams.forEach(t => {
      const vis = t.Visibility || 'Unknown';
      visibilityCounts[vis] = (visibilityCounts[vis] || 0) + 1;
    });
    const byVisibility = Object.entries(visibilityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const publicTeams = visibilityCounts['Public'] || 0;
    const privateTeams = visibilityCounts['Private'] || 0;

    // Recent teams (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTeams = teams.filter(t => {
      if (!t.CreatedDateTime) return false;
      const created = new Date(t.CreatedDateTime);
      return created >= thirtyDaysAgo;
    }).length;

    return {
      totalTeams: teams.length,
      publicTeams,
      privateTeams,
      byVisibility,
      recentTeams,
      discoverySuccessPercentage,
      dataSourcesReceivedCount,
      dataSourcesTotal,
    };
  }, [teams]);

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

  const reloadData = useCallback(async () => {
    setIsLoading(true);
    const basePath = selectedSourceProfile?.dataPath || `C:\\DiscoveryData\\${selectedSourceProfile?.companyName}`;

    if (basePath && selectedSourceProfile?.companyName) {
      try {
        const data = await loadCsvFile<MicrosoftTeam>(basePath, 'AzureDiscovery_MicrosoftTeams.csv');
        setTeams(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  return {
    teams,
    isLoading,
    error,
    activeTab,
    searchText,
    stats,
    columns,
    filteredData,
    setActiveTab,
    setSearchText,
    clearError,
    exportToCSV,
    reloadData,
  };
};
