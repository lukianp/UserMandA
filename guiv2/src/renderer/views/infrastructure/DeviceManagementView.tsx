/**
 * Device Management View Component
 * Displays MDM/Intune device compliance and management
 */

import React from 'react';
import { useDeviceManagementLogic } from '../../hooks/useDeviceManagementLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Select } from '../../components/atoms/Select';
import { Download, RefreshCw, Smartphone, AlertCircle, Shield } from 'lucide-react';
import { ColDef } from 'ag-grid-community';

const DeviceManagementView: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    filter,
    setFilter,
    filteredDevices,
    handleRefresh,
  } = useDeviceManagementLogic();

  const columns: ColDef[] = [
    { field: 'deviceName', headerName: 'Device Name', sortable: true, filter: true, flex: 1 },
    { field: 'deviceType', headerName: 'Type', sortable: true, filter: true, width: 120 },
    { field: 'owner', headerName: 'Owner', sortable: true, filter: true, flex: 1 },
    {
      field: 'complianceStatus',
      headerName: 'Compliance',
      sortable: true,
      filter: true,
      width: 140,
      cellRenderer: (params: any) => {
        const status = params.value;
        const colors = {
          compliant: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          non_compliant: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          in_grace_period: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          not_evaluated: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
            {status.replace(/_/g, ' ').toUpperCase()}
          </span>
        );
      }
    },
    { field: 'osVersion', headerName: 'OS Version', sortable: true, filter: true, width: 160 },
    { field: 'managementType', headerName: 'Management', sortable: true, filter: true, width: 120 },
    {
      field: 'encryptionStatus',
      headerName: 'Encryption',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params: any) => {
        const encrypted = params.value === 'encrypted';
        return (
          <span className={`flex items-center gap-1 ${encrypted ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            <Shield className="w-4 h-4" />
            {encrypted ? 'Yes' : 'No'}
          </span>
        );
      }
    },
    {
      field: 'lastCheckIn',
      headerName: 'Last Check-in',
      sortable: true,
      filter: true,
      width: 180,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'Never'
    },
  ];

  const handleExport = () => {
    const csvContent = convertToCSV(filteredDevices);
    downloadCSV(csvContent, `device-management-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Device Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                MDM/Intune device compliance and policy enforcement
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              loading={isLoading}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={filteredDevices.length === 0}
              icon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {data && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Devices</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{data.metrics.totalDevices}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">Managed</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{data.metrics.managedDevices}</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Compliant</div>
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{data.metrics.compliantDevices}</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">Non-Compliant</div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{data.metrics.nonCompliantDevices}</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Pending Actions</div>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{data.metrics.pendingActions}</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Critical Issues</div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{data.metrics.criticalIssues}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search devices..."
            value={filter.searchText || ''}
            onChange={(e) => setFilter({ ...filter, searchText: e.target.value })}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <Select
            value={filter.deviceType || ''}
            onChange={(value) => setFilter({ ...filter, deviceType: value })}
            options={[
              { value: '', label: 'All Device Types' },
              { value: 'windows', label: 'Windows' },
              { value: 'mac', label: 'Mac' },
              { value: 'ios', label: 'iOS' },
              { value: 'android', label: 'Android' },
              { value: 'linux', label: 'Linux' }
            ]}
            className="min-w-[150px]"
          />
          <Select
            value={filter.complianceStatus || ''}
            onChange={(value) => setFilter({ ...filter, complianceStatus: value })}
            options={[
              { value: '', label: 'All Compliance Status' },
              { value: 'compliant', label: 'Compliant' },
              { value: 'non_compliant', label: 'Non-Compliant' },
              { value: 'in_grace_period', label: 'In Grace Period' },
              { value: 'not_evaluated', label: 'Not Evaluated' }
            ]}
            className="min-w-[150px]"
          />
          <Button
            variant="secondary"
            onClick={() => setFilter({})}
            size="sm"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">Error Loading Data</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1 px-6 py-4">
        <VirtualizedDataGrid
          data={filteredDevices}
          columns={columns}
          loading={isLoading}
          onSelectionChange={(selectedRows: any[]) => {
            // Handle selection if needed
          }}
        />
      </div>
    </div>
  );
};

// Helper functions
function convertToCSV(data: any[]): string {
  if ((data?.length ?? 0) === 0) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    ),
  ];
  return csvRows.join('\n');
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default DeviceManagementView;
