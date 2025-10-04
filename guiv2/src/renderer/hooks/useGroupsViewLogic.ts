/**
 * Groups View Logic Hook
 *
 * Business logic for the Groups management view.
 * Handles group loading, filtering, search, and operations.
 * Mirrors C# GroupsViewModel.LoadAsync pattern
 */

import { useState, useEffect, useMemo } from 'react';
import { ColDef } from 'ag-grid-community';
import { GroupData, GroupType, GroupScope } from '../types/models/group';
import { useDebounce } from './useDebounce';
import { powerShellService } from '../services/powerShellService';
import { useProfileStore } from '../store/useProfileStore';

export const useGroupsViewLogic = () => {
  // State
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<GroupData[]>([]);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  // Filters
  const [groupTypeFilter, setGroupTypeFilter] = useState<GroupType | 'all'>('all');
  const [scopeFilter, setScopeFilter] = useState<GroupScope | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'ActiveDirectory' | 'AzureAD' | 'Hybrid'>('all');

  // Get current profile from store
  const { getCurrentSourceProfile } = useProfileStore();

  // Debounced search
  const debouncedSearch = useDebounce(searchText, 300);

  /**
   * Load groups from PowerShell
   * Mirrors C# GroupsViewModel.LoadAsync pattern
   */
  const loadGroups = async () => {
    setIsLoading(true);
    setError(null);
    setWarnings([]);

    try {
      setLoadingMessage('Checking cache and data sources...');

      const selectedProfile = getCurrentSourceProfile();

      // First try cached data (mirror LogicEngineService pattern)
      let groupsData: GroupData[];
      try {
        groupsData = await powerShellService.getCachedResult(
          `groups_${selectedProfile?.id || 'default'}`,
          async () => {
            setLoadingMessage('Loading groups from discovery modules...');

            // Try to execute Get-AllGroups module
            const result = await powerShellService.executeModule<{ groups: GroupData[] }>(
              'Modules/Discovery/Get-AllGroups.psm1',
              'Get-AllGroups',
              {
                ProfileName: selectedProfile?.companyName || 'Default',
                IncludeMembers: true,
                IncludeOwners: true
              }
            );

            return result.data?.groups || [];
          }
        );
      } catch (moduleError) {
        // Fallback to CSV service (mirror C# fallback pattern)
        console.warn('Module execution failed, falling back to CSV:', moduleError);
        setLoadingMessage('Loading groups from CSV files...');

        try {
          const csvResult = await powerShellService.executeScript<{ groups: GroupData[]; warnings?: string[] }>(
            'Scripts/Get-GroupsFromCsv.ps1',
            { ProfilePath: selectedProfile?.dataPath || 'C:\\discoverydata' }
          );

          groupsData = csvResult.data?.groups || [];

          // Mirror C# header warnings
          if (csvResult.warnings && csvResult.warnings.length > 0) {
            setWarnings(csvResult.warnings);
          }
        } catch (csvError) {
          console.error('CSV fallback also failed:', csvError);
          // Use mock data as last resort
          groupsData = Array.from({ length: 50 }, (_, i) => ({
            id: `group-${i}`,
            objectId: `obj-${i}`,
            name: `Group${i + 1}`,
            displayName: `Group ${i + 1}`,
            description: `Description for Group ${i + 1}`,
            groupType: [GroupType.Security, GroupType.Distribution, GroupType.MailEnabled][i % 3],
            scope: [GroupScope.Universal, GroupScope.Global, GroupScope.DomainLocal][i % 3],
            email: i % 2 === 0 ? `group${i}@company.com` : undefined,
            memberCount: Math.floor(Math.random() * 100),
            source: i % 3 === 0 ? 'AzureAD' : 'ActiveDirectory',
            createdDate: new Date(2020, 0, i + 1).toISOString(),
            modifiedDate: new Date(2024, 9, i % 30 + 1).toISOString(),
            owners: i % 3 === 0 ? [`User ${i}`] : [],
            isMailEnabled: i % 2 === 0,
            isDynamic: i % 5 === 0,
            syncStatus: i % 10 === 0
              ? { isSynced: false, lastSyncTime: '', syncErrors: ['Error'] }
              : { isSynced: true, lastSyncTime: new Date().toISOString() },
          }));

          setWarnings(['PowerShell execution failed. Using mock data.']);
        }
      }

      // Mirror C# UI thread update pattern
      setGroups(groupsData);
      setLoadingMessage('');

    } catch (err: any) {
      console.error('Failed to load groups:', err);
      setError(err.message || 'Failed to load groups');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  /**
   * Export selected groups to CSV
   */
  const handleExport = async () => {
    try {
      const exportData = selectedGroups.length > 0 ? selectedGroups : groups;

      // Convert to CSV
      const csvContent = convertToCSV(exportData);

      // Show save dialog
      const filePath = await window.electronAPI.showSaveDialog({
        title: 'Export Groups',
        defaultPath: `groups_export_${new Date().toISOString().split('T')[0]}.csv`,
        filters: [{ name: 'CSV Files', extensions: ['csv'] }],
      });

      if (filePath) {
        await window.electronAPI.writeFile(filePath, csvContent);
        alert('Groups exported successfully!');
      }
    } catch (err: any) {
      console.error('Export failed:', err);
      alert(`Export failed: ${err.message}`);
    }
  };

  /**
   * Delete selected groups
   */
  const handleDelete = async () => {
    if (selectedGroups.length === 0) return;

    if (!confirm(`Delete ${selectedGroups.length} group(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Management/GroupManagement.psm1',
        functionName: 'Remove-Groups',
        parameters: {
          GroupIds: selectedGroups.map(g => g.id),
        },
      });

      if (result.success) {
        alert('Groups deleted successfully!');
        setSelectedGroups([]);
        await loadGroups();
      } else {
        throw new Error(result.error || 'Failed to delete groups');
      }
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(`Delete failed: ${err.message}`);
    }
  };

  /**
   * View group members
   */
  const handleViewMembers = (group: GroupData) => {
    // TODO: Open modal or navigate to members view
    console.log('View members for group:', group.name);
  };

  /**
   * Refresh groups list
   */
  const handleRefresh = () => {
    loadGroups();
  };

  // Load groups on mount
  useEffect(() => {
    loadGroups();
  }, []);

  /**
   * Filtered groups based on search and filters
   */
  const filteredGroups = useMemo(() => {
    let result = [...groups];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(searchLower) ||
          g.displayName.toLowerCase().includes(searchLower) ||
          g.description?.toLowerCase().includes(searchLower) ||
          g.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply group type filter
    if (groupTypeFilter !== 'all') {
      result = result.filter((g) => g.groupType === groupTypeFilter);
    }

    // Apply scope filter
    if (scopeFilter !== 'all') {
      result = result.filter((g) => g.scope === scopeFilter);
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      result = result.filter((g) => g.source === sourceFilter);
    }

    return result;
  }, [groups, debouncedSearch, groupTypeFilter, scopeFilter, sourceFilter]);

  /**
   * Column definitions for AG Grid
   */
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'name',
        headerName: 'Group Name',
        sortable: true,
        filter: true,
        flex: 2,
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        field: 'displayName',
        headerName: 'Display Name',
        sortable: true,
        filter: true,
        flex: 2,
      },
      {
        field: 'groupType',
        headerName: 'Type',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'scope',
        headerName: 'Scope',
        sortable: true,
        filter: true,
        width: 130,
      },
      {
        field: 'memberCount',
        headerName: 'Members',
        sortable: true,
        filter: 'agNumberColumnFilter',
        width: 120,
        type: 'numericColumn',
      },
      {
        field: 'source',
        headerName: 'Source',
        sortable: true,
        filter: true,
        width: 130,
      },
      {
        field: 'email',
        headerName: 'Email',
        sortable: true,
        filter: true,
        flex: 2,
      },
      {
        field: 'createdDate',
        headerName: 'Created',
        sortable: true,
        filter: 'agDateColumnFilter',
        width: 150,
        valueFormatter: (params) => {
          if (!params.value) return '';
          return new Date(params.value).toLocaleDateString();
        },
      },
    ],
    []
  );

  /**
   * Convert groups to CSV format
   */
  const convertToCSV = (data: GroupData[]): string => {
    const headers = [
      'Name',
      'Display Name',
      'Type',
      'Scope',
      'Members',
      'Source',
      'Email',
      'Description',
      'Created Date',
    ];

    const rows = data.map((g) => [
      g.name,
      g.displayName,
      g.groupType,
      g.scope,
      g.memberCount.toString(),
      g.source,
      g.email || '',
      g.description || '',
      g.createdDate,
    ]);

    const csvRows = [headers, ...rows].map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
    );

    return csvRows.join('\n');
  };

  return {
    groups: filteredGroups,
    isLoading,
    error,
    searchText,
    setSearchText,
    selectedGroups,
    setSelectedGroups,
    groupTypeFilter,
    setGroupTypeFilter,
    scopeFilter,
    setScopeFilter,
    sourceFilter,
    setSourceFilter,
    columnDefs,
    handleExport,
    handleDelete,
    handleViewMembers,
    handleRefresh,
    totalGroups: groups.length,
    filteredCount: filteredGroups.length,
    loadingMessage,
    warnings,
  };
};
