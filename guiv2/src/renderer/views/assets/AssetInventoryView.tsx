/**
 * Asset Inventory View
 * Comprehensive asset tracking and lifecycle management
 */

import React from 'react';
import { Package, Server, Monitor, Smartphone, HardDrive, Database, Search, Download } from 'lucide-react';

import { useAssetInventoryLogic } from '../../hooks/useAssetInventoryLogic';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Badge } from '../../components/atoms/Badge';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';

export const AssetInventoryView: React.FC = () => {
  const {
    assets,
    statistics,
    isLoading,
    error,
    searchText,
    setSearchText,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    refreshData,
    exportAssets,
  } = useAssetInventoryLogic();

  const assetTypes = [
    { id: 'all', label: 'All Assets', icon: Package, count: statistics?.totalAssets || 0 },
    { id: 'servers', label: 'Servers', icon: Server, count: statistics?.servers || 0 },
    { id: 'workstations', label: 'Workstations', icon: Monitor, count: statistics?.workstations || 0 },
    { id: 'mobile', label: 'Mobile Devices', icon: Smartphone, count: statistics?.mobileDevices || 0 },
    { id: 'network', label: 'Network Devices', icon: HardDrive, count: statistics?.networkDevices || 0 },
    { id: 'printers', label: 'Printers', icon: Database, count: statistics?.printers || 0 },
  ];

  const columnDefs = [
    { field: 'name', headerName: 'Name', sortable: true, filter: true },
    { field: 'type', headerName: 'Type', sortable: true, filter: true },
    { field: 'manufacturer', headerName: 'Manufacturer', sortable: true, filter: true },
    { field: 'model', headerName: 'Model', sortable: true, filter: true },
    { field: 'serialNumber', headerName: 'Serial Number', sortable: true },
    { field: 'location', headerName: 'Location', sortable: true, filter: true },
    { field: 'status', headerName: 'Status', sortable: true, filter: true },
  ];

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900" data-cy="asset-inventory-view">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Asset Inventory</h1>
            <p className="text-gray-600 dark:text-gray-400">Complete asset tracking and lifecycle management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={refreshData} disabled={isLoading} data-cy="refresh-btn">
            Refresh
          </Button>
          <Button variant="primary" onClick={exportAssets} icon={<Download className="w-4 h-4" />} data-cy="export-btn">
            Export Inventory
          </Button>
        </div>
      </div>

      {/* Asset Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {assetTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = typeFilter === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300'
                }
              `}
              data-cy={`asset-type-${type.id}`}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className={`w-8 h-8 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</span>
                <Badge variant={isSelected ? 'primary' : 'default'}>{type.count}</Badge>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search assets by name, serial number, or location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10"
            data-cy="asset-search"
          />
        </div>
      </div>

      {/* Asset Grid */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <VirtualizedDataGrid
          data={assets}
          columns={columnDefs}
          loading={isLoading}
         
        />
      </div>
    </div>
  );
};

export default AssetInventoryView;
