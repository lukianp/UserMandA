/**
 * Groups View Logic Hook
 *
 * Business logic for the Groups management view.
 * Handles group loading, filtering, search, and operations.
 * Mirrors C# GroupsViewModel.LoadAsync pattern
 */

import { useState, useEffect, useMemo } from 'react';
import { ColDef } from 'ag-grid-community';

import { GroupData, GroupType, GroupScope, MembershipType } from '../types/models/group';
import { powerShellService } from '../services/powerShellService';
import { useProfileStore } from '../store/useProfileStore';

import { useDebounce } from './useDebounce';

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
   * Map GroupDto from Logic Engine to GroupData for the view
   */
  const mapGroupDtoToGroupData = (dto: any): GroupData => {
    // Parse group type from Type string
    let groupType: GroupType = GroupType.Security;
    const typeStr = (dto.Type || '').toLowerCase();
    if (typeStr.includes('distribution')) groupType = GroupType.Distribution;
    else if (typeStr.includes('mail')) groupType = GroupType.MailEnabled;
    else if (typeStr.includes('dynamic')) groupType = GroupType.Dynamic;

    // Determine source from DiscoveryModule
    let source: 'ActiveDirectory' | 'AzureAD' | 'Hybrid' = 'ActiveDirectory';
    const discoveryModule = dto.DiscoveryModule || '';
    if (discoveryModule.includes('Azure')) {
      source = 'AzureAD';
    } else if (discoveryModule.includes('ActiveDirectory') || discoveryModule.includes('AD')) {
      source = 'ActiveDirectory';
    }

    return {
      id: dto.Sid || dto.Name,
      objectId: dto.Sid || '',
      name: dto.Name || 'Unknown',
      displayName: dto.Name || 'Unknown',
      description: dto.Dn || undefined,
      email: undefined, // Not available in GroupDto
      groupType,
      scope: GroupScope.Universal, // Default scope
      membershipType: MembershipType.Static, // Default membership type
      memberCount: dto.Members?.length || 0,
      owners: dto.ManagedBy ? [dto.ManagedBy] : [],
      createdDate: dto.DiscoveryTimestamp || new Date().toISOString(),
      lastModified: dto.DiscoveryTimestamp || new Date().toISOString(),
      source,
      isSecurityEnabled: groupType === GroupType.Security,
      isMailEnabled: groupType === GroupType.MailEnabled,
      distinguishedName: dto.Dn,
      managedBy: dto.ManagedBy,
    };
  };

  /**
   * Load groups from Logic Engine (CSV data)
   * Replicates /gui/ GroupsViewModel.LoadAsync() pattern
   */
  const loadGroups = async (forceReload: boolean = false) => {
    setIsLoading(true);
    setError(null);
    setWarnings([]);
    setLoadingMessage('Loading groups from Logic Engine...');

    try {
      console.log(`[GroupsView] Loading groups from LogicEngine...${forceReload ? ' (force reload)' : ''}`);

      // Force reload data from CSV if requested
      if (forceReload) {
        console.log('[GroupsView] Forcing LogicEngine data reload...');
        const reloadResult = await window.electronAPI.invoke('logicEngine:forceReload');
        if (!reloadResult.success) {
          throw new Error(reloadResult.error || 'Failed to reload LogicEngine data');
        }
        console.log('[GroupsView] LogicEngine data reloaded successfully');
      }

      // Get groups from Logic Engine
      const result = await window.electronAPI.invoke('logicEngine:getAllGroups');

      if (!result.success) {
        throw new Error(result.error || 'Failed to load groups from LogicEngine');
      }

      if (!Array.isArray(result.data)) {
        throw new Error('Invalid response format from LogicEngine');
      }

      // Map GroupDto[] to GroupData[]
      const mappedGroups = result.data.map(mapGroupDtoToGroupData);
      setGroups(mappedGroups);
      setError(null);

      console.log(`[GroupsView] Loaded ${mappedGroups.length} groups from LogicEngine`);

    } catch (err: any) {
      console.error('[GroupsView] Failed to load groups:', err);
      setError(err instanceof Error ? err.message : 'Failed to load groups from Logic Engine.');
      setGroups([]); // Set empty array instead of mock data
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
   * Note: For CSV-based discovery data, this removes items from local state only.
   * Data will reload from CSV files on next refresh.
   */
  const handleDelete = async () => {
    if (selectedGroups.length === 0) return;

    if (!confirm(`Remove ${selectedGroups.length} group(s) from the view?\n\nNote: This removes items from the current view only. Data will reload from CSV files on next refresh.`)) {
      return;
    }

    try {
      // Get IDs of groups to remove
      const idsToRemove = new Set(selectedGroups.map(g => g.id));

      // Remove from local state
      setGroups((prevGroups) => prevGroups.filter((g) => !idsToRemove.has(g.id)));
      setSelectedGroups([]);

      console.log(`[GroupsView] Removed ${selectedGroups.length} groups from view`);
    } catch (err: any) {
      console.error('[GroupsView] Delete failed:', err);
      setError(`Failed to remove groups from view: ${err.message}`);
    }
  };

  /**
   * View group members
   * Opens GroupMembersModal
   */
  const handleViewMembers = (group: GroupData) => {
    console.log('[GroupsView] Opening members modal for group:', group.name);

    // Dynamically import and render GroupMembersModal
    import('../components/dialogs/GroupMembersModal').then(({ GroupMembersModal }) => {
      const { openModal, updateModal } = require('../store/useModalStore').useModalStore.getState();

      const modalId = openModal({
        type: 'custom',
        title: `Members of ${group.name}`,
        component: GroupMembersModal,
        props: {
          modalId: '', // Will be updated below
          groupId: group.id,
          groupName: group.name,
        },
        dismissable: true,
        size: 'xl',
      });

      // Update modal props with actual modalId
      updateModal(modalId, {
        props: {
          modalId,
          groupId: group.id,
          groupName: group.name,
        },
      });
    });
  };

  /**
   * Refresh groups list
   * Forces reload of data from CSV files
   */
  const handleRefresh = () => {
    console.log('[GroupsView] Refresh button clicked, forcing data reload');
    loadGroups(true); // Pass true to force reload
  };

  // Subscribe to selected source profile changes
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  // Load groups on mount and when profile changes
  useEffect(() => {
    loadGroups();
  }, [selectedSourceProfile]); // Reload when profile changes

  // Subscribe to file change events for auto-refresh
  useEffect(() => {
    const handleDataRefresh = (dataType: string) => {
      if ((dataType === 'Groups' || dataType === 'All') && !isLoading) {
        console.log('[GroupsView] Auto-refreshing due to file changes');
        loadGroups();
      }
    };

    // TODO: Subscribe to file watcher events when available
    // window.electronAPI.on('filewatcher:dataChanged', handleDataRefresh);

    return () => {
      // TODO: Cleanup subscription
      // window.electronAPI.off('filewatcher:dataChanged', handleDataRefresh);
    };
  }, [isLoading]);

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
          (g.name ?? '').toLowerCase().includes(searchLower) ||
          (g.displayName ?? '').toLowerCase().includes(searchLower) ||
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
   * Updated for Epic 1 Task 1.4 - Added View Details action
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

    const rows = (data ?? []).map((g) => [
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
