import React from 'react';
import { Shield, Lock, Cloud, FileText, AlertCircle, Settings, Play, Plus, Search, RefreshCw } from 'lucide-react';

import { Button } from '../../components/atoms/Button';
import DataTableOrganism from '../../components/organisms/DataTable';
import { Badge } from '../../components/atoms/Badge';
import { Input } from '../../components/atoms/Input';

import { useEndpointProtectionLogic } from '../../hooks/useEndpointProtectionLogic';

export const EndpointProtectionView: React.FC = () => {
  const {
    protectionData,
    isLoading,
    error,
    getEndpoints,
    getDashboardMetrics,
    quarantineEndpoint,
    scanEndpoint,
    refreshData,
  } = useEndpointProtectionLogic();

  const [selectedEndpoints, setSelectedEndpoints] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');

  const metrics = getDashboardMetrics();
  const endpoints = getEndpoints();

  const endpointColumns: any[] = [
    {
      id: 'hostname',
      header: 'Endpoint',
      accessor: 'hostname',
      sortable: true,
      cell: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            row.status === 'online' ? 'bg-green-500' :
            row.status === 'offline' ? 'bg-gray-500' :
            row.status === 'quarantined' ? 'bg-red-500' : 'bg-orange-500'
          }`} />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      id: 'osType',
      header: 'OS',
      accessor: 'osType',
      sortable: true,
      width: '100px',
      cell: (value: any, row: any) => (
        <Badge variant="info" className="text-xs">
          {value} {row.osVersion}
        </Badge>
      ),
    },
    {
      id: 'complianceStatus',
      header: 'Compliance',
      accessor: (row: any) => row.complianceStatus.overall,
      sortable: true,
      width: '120px',
      cell: (value: any) => (
        <Badge
          variant={value === 'compliant' ? 'success' : 'warning'}
          className="text-xs"
        >
          {value === 'compliant' ? 'Compliant' : 'Non-compliant'}
        </Badge>
      ),
    },
    {
      id: 'policies',
      header: 'Policies',
      accessor: (row: any) => row.policies?.length || 0,
      sortable: false,
      width: '100px',
      cell: (value: any) => (
        <span className="text-sm text-gray-600">{value}</span>
      ),
    },
    {
      id: 'vulnerabilities',
      header: 'Vulnerabilities',
      accessor: (row: any) => row.vulnerabilities?.length || 0,
      sortable: false,
      width: '120px',
      cell: (value: any) => (
        <Badge variant="danger" className="text-xs">
          {value} found
        </Badge>
      ),
    },
    {
      id: 'lastSeen',
      header: 'Last Seen',
      accessor: 'lastSeen',
      sortable: true,
      width: '140px',
      cell: (value: any) => new Date(value).toLocaleString(),
    },
  ];

  const handleQuarantine = React.useCallback(async (endpointId: string) => {
    await quarantineEndpoint(endpointId, 'Manual quarantine from UI');
    refreshData();
  }, [quarantineEndpoint, refreshData]);

  const handleScan = React.useCallback(async (endpointId: string) => {
    await scanEndpoint(endpointId, 'full');
    refreshData();
  }, [scanEndpoint, refreshData]);

  const handleBulkScan = React.useCallback(async () => {
    for (const endpointId of selectedEndpoints) {
      await handleScan(endpointId);
    }
  }, [selectedEndpoints, handleScan]);

  if (error) {
    return (
    <div className="flex flex-col h-full p-6" data-testid="endpoint-protection-view" data-cy="endpoint-protection-view">
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">Error loading endpoint protection data</p>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Endpoint Protection</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage endpoint security, policies, and threat detection
          </p>
        </div>
        <Button
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={refreshData}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <Shield className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Total Endpoints</h3>
          <div className="text-2xl font-bold">{metrics.endpoints.total}</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.endpoints.online} online • {metrics.endpoints.offline} offline
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <Lock className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Compliance Score</h3>
          <div className="text-2xl font-bold">{Math.round(metrics.compliance.overallScore)}%</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.compliance.compliantEndpoints} compliant
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <AlertCircle className="w-8 h-8 text-orange-500 mb-3" />
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Active Threats</h3>
          <div className="text-2xl font-bold">{metrics.threats.active}</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.threats.contained} contained
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <FileText className="w-8 h-8 text-purple-500 mb-3" />
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Open Vulnerabilities</h3>
          <div className="text-2xl font-bold">{metrics.vulnerabilities.total}</div>
          <div className="text-xs text-gray-500 mt-1">
            {metrics.vulnerabilities.critical} critical
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search endpoints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Play className="w-4 h-4" />}
            onClick={handleBulkScan}
            disabled={selectedEndpoints.length === 0}
          >
            Scan Selected ({selectedEndpoints.length})
          </Button>
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
            Add Policy
          </Button>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <DataTableOrganism
          data={endpoints.filter(endpoint =>
            endpoint.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            endpoint.ipAddress.includes(searchTerm) ||
            endpoint.osType.toLowerCase().includes(searchTerm.toLowerCase())
          )}
          columns={endpointColumns}
          loading={isLoading}
          selectable={true}
          onSelectionChange={(selectedRows: any[]) => setSelectedEndpoints(selectedRows.map(r => r.id))}
          emptyMessage="No endpoints found"
        />
      </div>
    </div>
  );
};


export default EndpointProtectionView;
