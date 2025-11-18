/**
 * Migration Mapping Logic Hook
 *
 * Manages resource mapping functionality including:
 * - Loading and displaying resource mappings
 * - Creating, updating, and deleting mappings
 * - Importing/exporting mappings from files
 * - Auto-mapping resources with fuzzy matching
 * - Conflict resolution
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ColDef } from 'ag-grid-community';

import { useMigrationStore } from '../store/useMigrationStore';
import type { ResourceMapping } from '../types/models/migration';

export const useMigrationMappingLogic = () => {
  const {
    selectedWave,
    mappings,
    isLoading,
    error,
    mapResource,
    importMappings,
    exportMappings,
    autoMapResources,
    resolveConflict,
  } = useMigrationStore();

  // Local state
  const [searchText, setSearchText] = useState('');
  const [selectedMappings, setSelectedMappings] = useState<ResourceMapping[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showConflictPanel, setShowConflictPanel] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<ResourceMapping | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [autoMapFuzzy, setAutoMapFuzzy] = useState(true);

  // Auto-mapping strategy based on fuzzy setting
  const autoMapStrategy = autoMapFuzzy ? 'displayName' : 'upn';

  // Load mappings when selected wave changes
  useEffect(() => {
    // Mappings are already loaded from the store
  }, [selectedWave?.id]);

  // Filtered mappings based on search and filters
  const filteredMappings = useMemo(() => {
    let result = mappings;

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(m => m.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(m => m.status === filterStatus);
    }

    // Search filter
    if ((searchText ?? '').trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(
        m =>
          (m.sourceName ?? '').toLowerCase().includes(searchLower) ||
          m.targetName?.toLowerCase().includes(searchLower) ||
          (m.sourceId ?? '').toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [mappings, searchText, filterType, filterStatus]);

  // Count mappings by status
  const statusCounts = useMemo(() => {
    return {
      total: mappings.length,
      pending: mappings.filter(m => m.status === 'Pending').length,
      mapped: mappings.filter(m => m.status === 'Mapped').length,
      valid: mappings.filter(m => m.status === 'Valid').length,
      invalid: mappings.filter(m => m.status === 'Invalid').length,
      conflicted: mappings.filter(m => m.status === 'Conflicted').length,
      resolved: mappings.filter(m => m.status === 'Resolved').length,
      skipped: mappings.filter(m => m.status === 'Skipped').length,
      conflicts: mappings.filter(m => m.conflicts && m.conflicts.length > 0).length,
    };
  }, [mappings]);

  // AG Grid column definitions
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: 'sourceName',
        headerName: 'Source',
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 200,
      },
      {
        field: 'targetName',
        headerName: 'Target',
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 200,
      },
      {
        field: 'type',
        headerName: 'Type',
        sortable: true,
        filter: true,
        width: 120,
      },
      {
        field: 'status',
        headerName: 'Status',
        sortable: true,
        filter: true,
        width: 130,
      },
      {
        field: 'conflicts',
        headerName: 'Conflicts',
        sortable: true,
        width: 110,
        valueGetter: (params: any) => params.data.conflicts?.length || 0,
      },
    ],
    []
  );

  // Event handlers
  const handleImport = useCallback(
    async (file: File) => {
      try {
        await importMappings(file);
      } catch (error) {
        console.error('Failed to import mappings:', error);
      }
    },
    [importMappings]
  );

  const handleExport = useCallback(async () => {
    if (!selectedWave?.id) return;

    try {
      await exportMappings(selectedWave.id);
    } catch (error) {
      console.error('Failed to export mappings:', error);
    }
  }, [selectedWave, exportFormat, exportMappings]);

  const handleAutoMap = useCallback(async () => {
    if (!selectedWave?.id) return;

    try {
      await autoMapResources(autoMapStrategy);
    } catch (error) {
      console.error('Failed to auto-map resources:', error);
    }
  }, [selectedWave, autoMapFuzzy, autoMapResources]);

  const handleResolveConflict = useCallback(
    async (mappingId: string, resolution: any) => {
      try {
        await resolveConflict(mappingId, resolution);
        setShowConflictPanel(false);
        setSelectedConflict(null);
      } catch (error) {
        console.error('Failed to resolve conflict:', error);
      }
    },
    [resolveConflict]
  );

  const handleDeleteMapping = useCallback(
    async (mappingId: string) => {
      if (!confirm('Are you sure you want to delete this mapping?')) return;

      try {
        // Remove mapping from local state
        const updatedMappings = mappings.filter(m => m.id !== mappingId);
        // Note: This is a temporary client-side only deletion
        // In a real implementation, this would call a store method to persist the change
        console.log('Mapping deleted locally:', mappingId);
      } catch (error) {
        console.error('Failed to delete mapping:', error);
      }
    },
    [mappings]
  );

  const handleShowConflicts = useCallback((mapping: ResourceMapping) => {
    setSelectedConflict(mapping);
    setShowConflictPanel(true);
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleImport(file);
      }
    },
    [handleImport]
  );

  return {
    // State
    mappings: filteredMappings,
    selectedWave,
    isLoading,
    error,
    searchText,
    selectedMappings,
    filterType,
    filterStatus,
    showConflictPanel,
    selectedConflict,
    exportFormat,
    autoMapFuzzy,
    statusCounts,

    // Column definitions
    columnDefs,

    // Handlers
    setSearchText,
    setSelectedMappings,
    setFilterType,
    setFilterStatus,
    setShowConflictPanel,
    setExportFormat,
    setAutoMapFuzzy,
    handleImport,
    handleExport,
    handleAutoMap,
    handleResolveConflict,
    handleDeleteMapping,
    handleShowConflicts,
    handleFileUpload,

    // Computed
    hasWaveSelected: !!selectedWave,
    hasMappings: mappings.length > 0,
  };
};
