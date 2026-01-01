/**
 * Server Inventory Logic Hook
 * Handles server discovery and inventory management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';

import { useProfileStore } from '../store/useProfileStore';

export interface ServerInventoryData {
  id: string;
  name: string;
  type: 'Physical' | 'Virtual' | 'Cloud';
  operatingSystem: string;
  osVersion: string;
  role: string;
  roles: string[];
  services: string[];
  serviceCount: number;
  uptime: string;
  uptimeDays: number;
  cpuUsagePercent: number;
  ramUsagePercent: number;
  ramTotalGB: number;
  ramUsedGB: number;
  diskTotalGB: number;
  diskUsedGB: number;
  diskFreeGB: number;
  ipAddress: string;
  domain: string;
  ou: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  clusterMembership: string;
  isCluster: boolean;
  lastSeen: Date | string;
  lastBackup: Date | string;
  status: 'Online' | 'Offline' | 'Warning' | 'Critical';
}

export interface ServerInventoryFilters {
  role: string;
  osType: string;
  criticality: string;
  clusterMembership: string;
  searchText: string;
}

export const useServerInventoryLogic = () => {
  const { selectedSourceProfile } = useProfileStore();

  // Data state
  const [data, setData] = useState<ServerInventoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<ServerInventoryFilters>({
    role: '',
    osType: '',
    criticality: '',
    clusterMembership: '',
    searchText: '',
  });

  // Selection state
  const [selectedServers, setSelectedServers] = useState<ServerInventoryData[]>([]);

  // Column definitions
  const columns = useMemo<ColDef<ServerInventoryData>[]>(
    () => [
      {
        headerName: 'Server Name',
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
          const colorMap = {
            Online: 'text-green-600',
            Warning: 'text-yellow-600',
            Critical: 'text-red-600',
            Offline: 'text-gray-600',
          };
          const color = colorMap[params.value as keyof typeof colorMap] || 'text-gray-600';
          return `<span class="${color} font-semibold">${params.value}</span>`;
        },
      },
      {
        headerName: 'Type',
        field: 'type',
        width: 100,
      },
      {
        headerName: 'Criticality',
        field: 'criticality',
        width: 110,
        cellRenderer: (params: any) => {
          const colorMap = {
            Critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            Low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          };
          const color = colorMap[params.value as keyof typeof colorMap] || '';
          return `<span class="px-2 py-1 rounded text-xs font-semibold ${color}">${params.value}</span>`;
        },
      },
      {
        headerName: 'Role',
        field: 'role',
        width: 160,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Operating System',
        field: 'operatingSystem',
        width: 200,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Services',
        field: 'serviceCount',
        width: 100,
        type: 'numericColumn',
      },
      {
        headerName: 'Uptime (Days)',
        field: 'uptimeDays',
        width: 130,
        type: 'numericColumn',
      },
      {
        headerName: 'CPU Usage',
        field: 'cpuUsagePercent',
        width: 120,
        cellRenderer: (params: any) => {
          const value = params.value;
          const color = value > 90 ? 'text-red-600' : value > 75 ? 'text-yellow-600' : 'text-green-600';
          return `<span class="${color} font-semibold">${value}%</span>`;
        },
      },
      {
        headerName: 'RAM Usage',
        field: 'ramUsagePercent',
        width: 120,
        cellRenderer: (params: any) => {
          const value = params.value;
          const color = value > 90 ? 'text-red-600' : value > 75 ? 'text-yellow-600' : 'text-green-600';
          return `<span class="${color} font-semibold">${value}%</span>`;
        },
      },
      {
        headerName: 'RAM Total (GB)',
        field: 'ramTotalGB',
        width: 140,
        type: 'numericColumn',
      },
      {
        headerName: 'Disk Total (GB)',
        field: 'diskTotalGB',
        width: 140,
        type: 'numericColumn',
      },
      {
        headerName: 'Disk Used %',
        field: 'diskUsedGB',
        width: 130,
        valueGetter: (params) => {
          if (!params.data) return 0;
          return ((params.data.diskUsedGB / params.data.diskTotalGB) * 100).toFixed(1);
        },
        cellRenderer: (params: any) => {
          const pct = parseFloat(params.value);
          const color = pct > 90 ? 'text-red-600' : pct > 75 ? 'text-yellow-600' : 'text-green-600';
          return `<span class="${color} font-semibold">${pct}%</span>`;
        },
      },
      {
        headerName: 'IP Address',
        field: 'ipAddress',
        width: 140,
      },
      {
        headerName: 'Domain',
        field: 'domain',
        width: 150,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Cluster',
        field: 'clusterMembership',
        width: 150,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Manufacturer',
        field: 'manufacturer',
        width: 150,
      },
      {
        headerName: 'Model',
        field: 'model',
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
        headerName: 'Last Backup',
        field: 'lastBackup',
        width: 180,
        valueFormatter: (params) => {
          if (!params.value) return 'Never';
          return new Date(params.value).toLocaleString();
        },
      },
    ],
    []
  );

  // Filtered data
  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.role) {
      result = result.filter((item) => (item.role ?? '').toLowerCase().includes(filters.role.toLowerCase()));
    }

    if (filters.osType) {
      result = result.filter((item) =>
        (item.operatingSystem ?? '').toLowerCase().includes(filters.osType.toLowerCase())
      );
    }

    if (filters.criticality) {
      result = result.filter((item) => item.criticality === filters.criticality);
    }

    if (filters.clusterMembership) {
      result = result.filter((item) =>
        (item.clusterMembership ?? '').toLowerCase().includes(filters.clusterMembership.toLowerCase())
      );
    }

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      result = result.filter(
        (item) =>
          (item.name ?? '').toLowerCase().includes(search) ||
          (item.ipAddress ?? '').toLowerCase().includes(search) ||
          (item.role ?? '').toLowerCase().includes(search)
      );
    }

    return result;
  }, [data, filters]);

  // Filter options
  const filterOptions = useMemo(() => {
    const roles = [...new Set((data ?? []).map((d) => d.role))].sort();
    const osTypes = [...new Set((data ?? []).map((d) => d.operatingSystem))].sort();
    const criticalities = ['Critical', 'High', 'Medium', 'Low'];
    const clusters = [...new Set((data ?? []).map((d) => d.clusterMembership).filter((c) => c))].sort();

    return { roles, osTypes, criticalities, clusters };
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
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Discovery/ServerInventory.psm1',
        functionName: 'Get-ServerInventory',
        parameters: {
          Domain: selectedSourceProfile.domain,
          Credential: selectedSourceProfile.credential,
        },
        options: {
          timeout: 300000, // 5 minutes
        },
      });

      if (result.success && result.data) {
        setData(result.data.servers || []);
      } else {
        throw new Error(result.error || 'Failed to load server inventory');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  // Update filter
  const updateFilter = useCallback(
    <K extends keyof ServerInventoryFilters>(key: K, value: ServerInventoryFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      role: '',
      osType: '',
      criticality: '',
      clusterMembership: '',
      searchText: '',
    });
  }, []);

  // Export data
  const exportData = useCallback(async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `server-inventory-${timestamp}.csv`;

    return { filename, data: filteredData };
  }, [filteredData]);

  // View services
  const viewServices = useCallback((server: ServerInventoryData) => {
    console.log('View services for:', server);
  }, []);

  // Health check
  const healthCheck = useCallback(async (server: ServerInventoryData) => {
    console.log('Health check for:', server);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredData.length;
    const critical = filteredData.filter((d) => d.criticality === 'Critical').length;
    const highResource = filteredData.filter(
      (d) => d.cpuUsagePercent > 80 || d.ramUsagePercent > 80
    ).length;
    const clustered = filteredData.filter((d) => d.isCluster).length;
    const physical = filteredData.filter((d) => d.type === 'Physical').length;
    const virtual = filteredData.filter((d) => d.type === 'Virtual').length;

    return {
      total,
      critical,
      highResource,
      clustered,
      physical,
      virtual,
    };
  }, [filteredData]);

  // Chart data for server distribution
  const roleDistribution = useMemo(() => {
    const roleCounts = filteredData.reduce((acc, server) => {
      acc[server.role] = (acc[server.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(roleCounts)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
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
    selectedServers,
    setSelectedServers,

    // Actions
    loadData,
    exportData,
    viewServices,
    healthCheck,

    // Statistics
    stats,
    roleDistribution,

    // Profile
    selectedProfile: selectedSourceProfile,
  };
};


