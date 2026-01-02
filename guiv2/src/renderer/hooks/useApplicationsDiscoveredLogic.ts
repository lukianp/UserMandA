/**
 * Applications Catalog Discovered Logic Hook
 * Loads discovered application catalog data from CSV files
 * Provides statistics, filtering, tabs, and export functions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { useProfileStore } from '../store/useProfileStore';
import { ColDef } from 'ag-grid-community';

interface ApplicationCatalog {
  AppId: string;
  ObjectId: string;
  Name: string;
  AppType: string;
  Publisher: string;
  Vendor: string;
  ServicePrincipalType: string;
  SignInAudience: string;
  AppRoleAssignmentRequired: string;
  CreatedDateTime: string;
  AccountEnabled: string;
  OwnerCount: string;
  OAuth2PermissionGrantsCount: string;
  AppRoleAssignmentsCount: string;
  KeyCredentialsCount: string;
  PasswordCredentialsCount: string;
  Platform: string;
  Category: string;
  DiscoverySource: string;
  CatalogSource: string;
}

type TabType = 'overview' | 'applications';

interface ApplicationsStats {
  totalApplications: number;
  byCategory: Array<{ name: string; count: number }>;
  byPlatform: Array<{ name: string; count: number }>;
  byAppType: Array<{ name: string; count: number }>;
  byPublisher: Array<{ name: string; count: number }>;
  withOwners: number;
  withOAuth2Grants: number;
  withAppRoles: number;
  withCredentials: number;
  enabledCount: number;
  disabledCount: number;
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

export const useApplicationsDiscoveredLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [applications, setApplications] = useState<ApplicationCatalog[]>([]);
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
        const data = await loadCsvFile<ApplicationCatalog>(basePath, 'ApplicationCatalog.csv');
        setApplications(data);
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
    if (!searchText) return applications;
    const search = searchText.toLowerCase();
    return applications.filter(a =>
      a.Name?.toLowerCase().includes(search) ||
      a.Publisher?.toLowerCase().includes(search) ||
      a.Category?.toLowerCase().includes(search) ||
      a.AppType?.toLowerCase().includes(search)
    );
  }, [applications, searchText]);

  const columns = useMemo<ColDef[]>(() => [
    { field: 'Name', headerName: 'Application Name', width: 250 },
    { field: 'AppType', headerName: 'Type', width: 120 },
    { field: 'Publisher', headerName: 'Publisher', width: 150 },
    { field: 'Category', headerName: 'Category', width: 150 },
    { field: 'Platform', headerName: 'Platform', width: 100 },
    { field: 'AccountEnabled', headerName: 'Enabled', width: 80 },
    { field: 'OwnerCount', headerName: 'Owners', width: 80, type: 'numericColumn' },
    { field: 'OAuth2PermissionGrantsCount', headerName: 'OAuth2', width: 80, type: 'numericColumn' },
    { field: 'AppRoleAssignmentsCount', headerName: 'Roles', width: 80, type: 'numericColumn' },
    { field: 'KeyCredentialsCount', headerName: 'Keys', width: 80, type: 'numericColumn' },
    { field: 'PasswordCredentialsCount', headerName: 'Passwords', width: 80, type: 'numericColumn' },
  ], []);

  const stats = useMemo<ApplicationsStats | null>(() => {
    if (applications.length === 0) return null;

    // Discovery Success
    const expectedSources = [
      { name: 'ApplicationCatalog', hasData: applications.length > 0, weight: 100 },
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
    const discoverySuccessPercentage = Math.round((achievedWeight / totalWeight) * 100);
    const dataSourcesReceivedCount = expectedSources.filter(s => s.hasData).length;
    const dataSourcesTotal = expectedSources.length;

    // By category
    const categoryCounts: Record<string, number> = {};
    applications.forEach(a => {
      const cat = a.Category || 'Unknown';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const byCategory = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // By platform
    const platformCounts: Record<string, number> = {};
    applications.forEach(a => {
      const plat = a.Platform || 'Unknown';
      platformCounts[plat] = (platformCounts[plat] || 0) + 1;
    });
    const byPlatform = Object.entries(platformCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // By app type
    const typeCounts: Record<string, number> = {};
    applications.forEach(a => {
      const type = a.AppType || 'Unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    const byAppType = Object.entries(typeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // By publisher
    const publisherCounts: Record<string, number> = {};
    applications.forEach(a => {
      const pub = a.Publisher || a.Vendor || 'Unknown';
      publisherCounts[pub] = (publisherCounts[pub] || 0) + 1;
    });
    const byPublisher = Object.entries(publisherCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Counts
    const withOwners = applications.filter(a => parseInt(a.OwnerCount) > 0).length;
    const withOAuth2Grants = applications.filter(a => parseInt(a.OAuth2PermissionGrantsCount) > 0).length;
    const withAppRoles = applications.filter(a => parseInt(a.AppRoleAssignmentsCount) > 0).length;
    const withCredentials = applications.filter(a =>
      parseInt(a.KeyCredentialsCount) > 0 || parseInt(a.PasswordCredentialsCount) > 0
    ).length;
    const enabledCount = applications.filter(a => a.AccountEnabled !== 'False').length;
    const disabledCount = applications.filter(a => a.AccountEnabled === 'False').length;

    return {
      totalApplications: applications.length,
      byCategory,
      byPlatform,
      byAppType,
      byPublisher,
      withOwners,
      withOAuth2Grants,
      withAppRoles,
      withCredentials,
      enabledCount,
      disabledCount,
      discoverySuccessPercentage,
      dataSourcesReceivedCount,
      dataSourcesTotal,
    };
  }, [applications]);

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
        const data = await loadCsvFile<ApplicationCatalog>(basePath, 'ApplicationCatalog.csv');
        setApplications(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  }, [selectedSourceProfile?.companyName, selectedSourceProfile?.dataPath]);

  return {
    applications,
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
