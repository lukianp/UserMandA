/**
 * Network Device Inventory Logic Hook
 * Handles network device discovery and inventory management
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ColDef } from 'ag-grid-community';

import { useProfileStore } from '../store/useProfileStore';
import { NetworkDeviceData } from '../types/models/networkDevice';

export interface NetworkDeviceFilters {
  deviceType: string;
  vendor: string;
  status: string;
  location: string;
  searchText: string;
}

export const useNetworkDeviceInventoryLogic = () => {
  const { selectedSourceProfile } = useProfileStore();

  // Data state
  const [data, setData] = useState<NetworkDeviceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<NetworkDeviceFilters>({
    deviceType: '',
    vendor: '',
    status: '',
    location: '',
    searchText: '',
  });

  // Selection state
  const [selectedDevices, setSelectedDevices] = useState<NetworkDeviceData[]>([]);

  // Column definitions
  const columns = useMemo<ColDef<NetworkDeviceData>[]>(
    () => [
      {
        headerName: 'Device Name',
        field: 'deviceName',
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
              : 'text-yellow-600';
          return `<span class="${color} font-semibold">${params.value}</span>`;
        },
      },
      {
        headerName: 'Type',
        field: 'deviceType',
        width: 120,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Vendor',
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
        headerName: 'Firmware',
        field: 'firmware',
        width: 140,
      },
      {
        headerName: 'Location',
        field: 'location',
        width: 150,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Building',
        field: 'building',
        width: 120,
      },
      {
        headerName: 'Floor',
        field: 'floor',
        width: 100,
      },
      {
        headerName: 'Rack',
        field: 'rack',
        width: 100,
      },
      {
        headerName: 'Serial Number',
        field: 'serialNumber',
        width: 180,
      },
      {
        headerName: 'VLAN',
        field: 'vlan',
        width: 100,
      },
      {
        headerName: 'Subnet',
        field: 'subnet',
        width: 150,
      },
      {
        headerName: 'Port Count',
        field: 'portCount',
        width: 110,
        type: 'numericColumn',
      },
      {
        headerName: 'Ports Used',
        field: 'portsUsed',
        width: 120,
        type: 'numericColumn',
      },
      {
        headerName: 'Port Utilization',
        field: 'portUtilization',
        width: 150,
        cellRenderer: (params: any) => {
          if (!params.data) return '';
          const pct = (params.data.portsUsed / params.data.portCount) * 100;
          const color = pct > 90 ? 'text-red-600' : pct > 75 ? 'text-yellow-600' : 'text-green-600';
          return `<span class="${color} font-semibold">${pct.toFixed(1)}%</span>`;
        },
      },
      {
        headerName: 'Uptime',
        field: 'uptime',
        width: 140,
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
        headerName: 'Warranty Status',
        field: 'warrantyStatus',
        width: 150,
        cellRenderer: (params: any) => {
          const colorMap: Record<string, string> = {
            Active: 'text-green-600',
            Expiring: 'text-yellow-600',
            Expired: 'text-red-600',
          };
          const color = colorMap[params.value] || 'text-gray-600';
          return `<span class="${color} font-semibold">${params.value}</span>`;
        },
      },
      {
        headerName: 'Warranty Expiry',
        field: 'warrantyExpiry',
        width: 180,
        valueFormatter: (params) => {
          if (!params.value) return 'Unknown';
          return new Date(params.value).toLocaleDateString();
        },
      },
    ],
    []
  );

  // Filtered data
  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.deviceType) {
      result = result.filter((item) =>
        item.deviceType.toLowerCase().includes(filters.deviceType.toLowerCase())
      );
    }

    if (filters.vendor) {
      result = result.filter((item) =>
        item.manufacturer.toLowerCase().includes(filters.vendor.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter((item) => item.status === filters.status);
    }

    if (filters.location) {
      result = result.filter((item) =>
        item.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.deviceName.toLowerCase().includes(search) ||
          item.ipAddress.toLowerCase().includes(search) ||
          item.macAddress.toLowerCase().includes(search)
      );
    }

    return result;
  }, [data, filters]);

  // Filter options
  const filterOptions = useMemo(() => {
    const deviceTypes = [...new Set(data.map((d) => d.deviceType))].sort();
    const vendors = [...new Set(data.map((d) => d.manufacturer))].sort();
    const statuses = [...new Set(data.map((d) => d.status))].sort();
    const locations = [...new Set(data.map((d) => d.location))].sort();

    return { deviceTypes, vendors, statuses, locations };
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
        modulePath: 'Modules/Discovery/NetworkDeviceInventory.psm1',
        functionName: 'Get-NetworkDeviceInventory',
        parameters: {
          Domain: selectedSourceProfile.domain,
          Credential: selectedSourceProfile.credential,
        },
        options: {
          timeout: 300000, // 5 minutes
        },
      });

      if (result.success && result.data) {
        setData(result.data.devices || []);
      } else {
        throw new Error(result.error || 'Failed to load network device inventory');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  // Update filter
  const updateFilter = useCallback(
    <K extends keyof NetworkDeviceFilters>(key: K, value: NetworkDeviceFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      deviceType: '',
      vendor: '',
      status: '',
      location: '',
      searchText: '',
    });
  }, []);

  // Export data
  const exportData = useCallback(async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `network-devices-${timestamp}.csv`;
    return { filename, data: filteredData };
  }, [filteredData]);

  // Ping test
  const pingTest = useCallback(async (device: NetworkDeviceData) => {
    console.log('Ping test for:', device);
    // Implementation would call PowerShell Test-Connection
  }, []);

  // View configuration
  const viewConfiguration = useCallback((device: NetworkDeviceData) => {
    console.log('View configuration for:', device);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredData.length;
    const online = filteredData.filter((d) => d.status === 'Online').length;
    const offline = filteredData.filter((d) => d.status === 'Offline').length;
    const warrantyExpiring = filteredData.filter((d) => d.isWarrantyExpiring).length;
    const warrantyExpired = filteredData.filter((d) => d.isWarrantyExpired).length;
    const highUtilization = filteredData.filter(
      (d) => d.portsUsed / d.portCount > 0.9
    ).length;

    return {
      total,
      online,
      offline,
      onlinePercentage: total > 0 ? ((online / total) * 100).toFixed(1) : '0',
      warrantyExpiring,
      warrantyExpired,
      highUtilization,
    };
  }, [filteredData]);

  // Device type distribution
  const typeDistribution = useMemo(() => {
    const typeCounts = filteredData.reduce((acc, device) => {
      acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
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
    selectedDevices,
    setSelectedDevices,

    // Actions
    loadData,
    exportData,
    pingTest,
    viewConfiguration,

    // Statistics
    stats,
    typeDistribution,

    // Profile
    selectedProfile: selectedSourceProfile,
  };
};
