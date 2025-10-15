/**
 * Computer Inventory Logic Hook
 * Handles computer discovery and inventory management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import type { ColDef } from 'ag-grid-community';

export interface ComputerInventoryData {
  id: string;
  name: string;
  operatingSystem: string;
  osVersion: string;
  cpu: string;
  cpuCores: number;
  ram: string;
  ramGB: number;
  disk: string;
  diskGB: number;
  diskUsedGB: number;
  diskFreeGB: number;
  lastSeen: Date | string;
  domain: string;
  ou: string;
  ipAddress: string;
  macAddress: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  isOnline: boolean;
  status: 'Online' | 'Offline' | 'Unknown';
  installedSoftware: number;
  pendingUpdates: number;
  lastBootTime: Date | string;
  uptime: string;
}

export interface ComputerInventoryFilters {
  osType: string;
  domain: string;
  ou: string;
  status: string;
  searchText: string;
}

export const useComputerInventoryLogic = () => {
  const { selectedSourceProfile } = useProfileStore();

  // Data state
  const [data, setData] = useState<ComputerInventoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<ComputerInventoryFilters>({
    osType: '',
    domain: '',
    ou: '',
    status: '',
    searchText: '',
  });

  // Selection state
  const [selectedComputers, setSelectedComputers] = useState<ComputerInventoryData[]>([]);

  // Column definitions
  const columns = useMemo<ColDef<ComputerInventoryData>[]>(
    () => [
      {
        headerName: 'Computer Name',
        field: 'name',
        pinned: 'left',
        width: 180,
        filter: 'agTextColumnFilter',
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
      {
        headerName: 'Status',
        field: 'status',
        width: 100,
        cellRenderer: (params: any) => {
          const color =
            params.value === 'Online'
              ? 'text-green-600'
              : params.value === 'Offline'
              ? 'text-red-600'
              : 'text-gray-600';
          return `<span class="${color} font-semibold">${params.value}</span>`;
        },
      },
      {
        headerName: 'Operating System',
        field: 'operatingSystem',
        width: 200,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'OS Version',
        field: 'osVersion',
        width: 150,
      },
      {
        headerName: 'CPU',
        field: 'cpu',
        width: 180,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Cores',
        field: 'cpuCores',
        width: 90,
        type: 'numericColumn',
      },
      {
        headerName: 'RAM (GB)',
        field: 'ramGB',
        width: 110,
        type: 'numericColumn',
        valueFormatter: (params) => `${params.value} GB`,
      },
      {
        headerName: 'Disk (GB)',
        field: 'diskGB',
        width: 110,
        type: 'numericColumn',
        valueFormatter: (params) => `${params.value} GB`,
      },
      {
        headerName: 'Disk Used %',
        field: 'diskUsedGB',
        width: 130,
        valueGetter: (params) => {
          if (!params.data) return 0;
          return ((params.data.diskUsedGB / params.data.diskGB) * 100).toFixed(1);
        },
        cellRenderer: (params: any) => {
          const pct = parseFloat(params.value);
          const color = pct > 90 ? 'text-red-600' : pct > 75 ? 'text-yellow-600' : 'text-green-600';
          return `<span class="${color} font-semibold">${pct}%</span>`;
        },
      },
      {
        headerName: 'Domain',
        field: 'domain',
        width: 150,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'OU',
        field: 'ou',
        width: 200,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'IP Address',
        field: 'ipAddress',
        width: 140,
      },
      {
        headerName: 'MAC Address',
        field: 'macAddress',
        width: 150,
      },
      {
        headerName: 'Manufacturer',
        field: 'manufacturer',
        width: 150,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Model',
        field: 'model',
        width: 180,
      },
      {
        headerName: 'Serial Number',
        field: 'serialNumber',
        width: 180,
      },
      {
        headerName: 'Last Seen',
        field: 'lastSeen',
        width: 180,
        valueFormatter: (params) => {
          if (!params.value) return '';
          return new Date(params.value).toLocaleString();
        },
      },
      {
        headerName: 'Last Boot',
        field: 'lastBootTime',
        width: 180,
        valueFormatter: (params) => {
          if (!params.value) return '';
          return new Date(params.value).toLocaleString();
        },
      },
      {
        headerName: 'Uptime',
        field: 'uptime',
        width: 120,
      },
      {
        headerName: 'Software',
        field: 'installedSoftware',
        width: 100,
        type: 'numericColumn',
      },
      {
        headerName: 'Updates',
        field: 'pendingUpdates',
        width: 100,
        type: 'numericColumn',
        cellRenderer: (params: any) => {
          if (params.value > 0) {
            return `<span class="text-orange-600 font-semibold">${params.value}</span>`;
          }
          return `<span class="text-green-600">${params.value}</span>`;
        },
      },
    ],
    []
  );

  // Filtered data
  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.osType) {
      result = result.filter((item) =>
        item.operatingSystem.toLowerCase().includes(filters.osType.toLowerCase())
      );
    }

    if (filters.domain) {
      result = result.filter((item) =>
        item.domain.toLowerCase().includes(filters.domain.toLowerCase())
      );
    }

    if (filters.ou) {
      result = result.filter((item) => item.ou.toLowerCase().includes(filters.ou.toLowerCase()));
    }

    if (filters.status) {
      result = result.filter((item) => item.status === filters.status);
    }

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.ipAddress.toLowerCase().includes(search) ||
          item.serialNumber.toLowerCase().includes(search)
      );
    }

    return result;
  }, [data, filters]);

  // Unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    const osTypes = [...new Set(data.map((d) => d.operatingSystem))].sort();
    const domains = [...new Set(data.map((d) => d.domain))].sort();
    const ous = [...new Set(data.map((d) => d.ou))].sort();
    const statuses = ['Online', 'Offline', 'Unknown'];

    return { osTypes, domains, ous, statuses };
  }, [data]);

  // Load data
  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) {
      setError('No source profile selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule(
        {
          modulePath: 'Modules/Discovery/ComputerInventory.psm1',
          functionName: 'Get-ComputerInventory',
          parameters: {
            Domain: selectedSourceProfile.domain,
            Credential: selectedSourceProfile.credential,
          },
          options: {
            timeout: 300000, // 5 minutes
          },
        }
      );

      if (result.success && result.data) {
        setData(result.data.computers || []);
      } else {
        throw new Error(result.error || 'Failed to load computer inventory');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  // Update filter
  const updateFilter = useCallback(
    <K extends keyof ComputerInventoryFilters>(key: K, value: ComputerInventoryFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      osType: '',
      domain: '',
      ou: '',
      status: '',
      searchText: '',
    });
  }, []);

  // Export data
  const exportData = useCallback(async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `computer-inventory-${timestamp}.csv`;

    // This will be handled by the DataGrid's export functionality
    return { filename, data: filteredData };
  }, [filteredData]);

  // View details
  const viewDetails = useCallback((computer: ComputerInventoryData) => {
    // This will open a detail dialog
    console.log('View details for:', computer);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredData.length;
    const online = filteredData.filter((d) => d.status === 'Online').length;
    const offline = filteredData.filter((d) => d.status === 'Offline').length;
    const needsUpdates = filteredData.filter((d) => d.pendingUpdates > 0).length;
    const lowDiskSpace = filteredData.filter((d) => d.diskUsedGB / d.diskGB > 0.9).length;

    return {
      total,
      online,
      offline,
      onlinePercentage: total > 0 ? ((online / total) * 100).toFixed(1) : '0',
      needsUpdates,
      lowDiskSpace,
    };
  }, [filteredData]);

  // Load data on mount
  useEffect(() => {
    if (selectedSourceProfile) {
      loadData();
    }
  }, [selectedSourceProfile, loadData]);

  return {
    // Data
    data: filteredData,
    columns,
    isLoading,
    error,

    // Filters
    filters,
    filterOptions,
    updateFilter,
    clearFilters,

    // Selection
    selectedComputers,
    setSelectedComputers,

    // Actions
    loadData,
    exportData,
    viewDetails,

    // Statistics
    stats,

    // Profile
    selectedProfile: selectedSourceProfile,
  };
};
