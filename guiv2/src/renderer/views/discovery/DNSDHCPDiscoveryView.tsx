import { useState, useMemo } from 'react';
import {
  Network,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Globe,
  Server,
  Layers,
  Activity,
  Database,
  Zap
} from 'lucide-react';

import { useDNSDHCPDiscoveryLogic } from '../../hooks/useDNSDHCPDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { ColDef } from 'ag-grid-community';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const DNSDHCPDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    progress,
    error,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
    clearLogs,
  } = useDNSDHCPDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'dns-servers' | 'dns-zones' | 'dhcp-servers' | 'dhcp-scopes' | 'leases'>('overview');
  const [searchText, setSearchText] = useState('');

  // Statistics
  const stats = useMemo(() => {
    if (!result) return null;

    return {
      totalDNSServers: result.totalDNSServers || 0,
      totalDHCPServers: result.totalDHCPServers || 0,
      totalZones: result.totalZones || 0,
      totalRecords: result.totalRecords || 0,
      totalScopes: result.totalScopes || 0,
      totalLeases: result.totalLeases || 0,
      activeLeases: result.statistics?.activeLeases || 0,
      expiredLeases: result.statistics?.expiredLeases || 0,
    };
  }, [result]);

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = (data: any[], filename: string) => {
    console.log('Export to Excel:', filename, data);
  };

  // Data grid columns
  const dnsServerColumns: ColDef[] = [
    { field: 'name', headerName: 'Server Name', width: 200, sortable: true },
    { field: 'ipAddress', headerName: 'IP Address', width: 150, sortable: true },
    { field: 'zones', headerName: 'Zones', width: 100, sortable: true },
    { field: 'version', headerName: 'Version', width: 120, sortable: true },
  ];

  const dnsZoneColumns: ColDef[] = [
    { field: 'name', headerName: 'Zone Name', width: 250, sortable: true },
    { field: 'type', headerName: 'Type', width: 120, sortable: true },
    { field: 'records', headerName: 'Records', width: 100, sortable: true },
    { field: 'dynamic', headerName: 'Dynamic', width: 100, sortable: true },
  ];

  const dhcpServerColumns: ColDef[] = [
    { field: 'name', headerName: 'Server Name', width: 200, sortable: true },
    { field: 'ipAddress', headerName: 'IP Address', width: 150, sortable: true },
    { field: 'scopes', headerName: 'Scopes', width: 100, sortable: true },
    { field: 'leases', headerName: 'Active Leases', width: 120, sortable: true },
  ];

  const dhcpScopeColumns: ColDef[] = [
    { field: 'name', headerName: 'Scope Name', width: 200, sortable: true },
    { field: 'subnet', headerName: 'Subnet', width: 150, sortable: true },
    { field: 'range', headerName: 'IP Range', width: 200, sortable: true },
    { field: 'leases', headerName: 'Leases', width: 100, sortable: true },
    { field: 'utilization', headerName: 'Utilization %', width: 130, sortable: true },
  ];

  const leaseColumns: ColDef[] = [
    { field: 'ipAddress', headerName: 'IP Address', width: 150, sortable: true },
    { field: 'hostname', headerName: 'Hostname', width: 200, sortable: true },
    { field: 'mac', headerName: 'MAC Address', width: 180, sortable: true },
    { field: 'expires', headerName: 'Expires', width: 180, sortable: true },
    { field: 'scope', headerName: 'Scope', width: 150, sortable: true },
  ];

  // Filtered data
  const filteredDNSServers = useMemo(() => {
    if (!result?.dnsServers) return [];
    if (!searchText) return result.dnsServers;
    return result.dnsServers.filter((server: any) =>
      server.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [result, searchText]);

  const filteredDNSZones = useMemo(() => {
    if (!result?.dnsZones) return [];
    if (!searchText) return result.dnsZones;
    return result.dnsZones.filter((zone: any) =>
      zone.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [result, searchText]);

  const filteredDHCPServers = useMemo(() => {
    if (!result?.dhcpServers) return [];
    if (!searchText) return result.dhcpServers;
    return result.dhcpServers.filter((server: any) =>
      server.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [result, searchText]);

  const filteredDHCPScopes = useMemo(() => {
    if (!result?.dhcpScopes) return [];
    if (!searchText) return result.dhcpScopes;
    return result.dhcpScopes.filter((scope: any) =>
      scope.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [result, searchText]);

  const filteredLeases = useMemo(() => {
    if (!result?.dhcpLeases) return [];
    if (!searchText) return result.dhcpLeases;
    return result.dhcpLeases.filter((lease: any) =>
      lease.ipAddress?.toLowerCase().includes(searchText.toLowerCase()) ||
      lease.hostname?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [result, searchText]);

  // Export payload
  const exportPayload = useMemo(() => {
    switch (activeTab) {
      case 'dns-servers':
        return filteredDNSServers;
      case 'dns-zones':
        return filteredDNSZones;
      case 'dhcp-servers':
        return filteredDHCPServers;
      case 'dhcp-scopes':
        return filteredDHCPScopes;
      case 'leases':
        return filteredLeases;
      default:
        return [];
    }
  }, [activeTab, filteredDNSServers, filteredDNSZones, filteredDHCPServers, filteredDHCPScopes, filteredLeases]);

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="dnsdhcp-discovery-view" data-testid="dnsdhcp-discovery-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Network className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DNS & DHCP Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover DNS zones, records, DHCP scopes, and lease assignments to assess network infrastructure
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {exportPayload.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(exportPayload, `dnsdhcp-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                aria-label="Export as CSV"
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(exportPayload, `dnsdhcp-${activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`)}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
                aria-label="Export as Excel"
                data-cy="export-excel-btn" data-testid="export-excel-btn"
              >
                Export Excel
              </Button>
            </>
          )}
          <Button
            onClick={startDiscovery}
            disabled={isDiscovering}
            variant="primary"
            aria-label="Start discovery"
            data-cy="start-discovery-btn" data-testid="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={clearError} variant="ghost" size="sm">Dismiss</Button>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="mx-6 mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          data-cy="config-toggle" data-testid="config-toggle"
        >
          <span className="font-semibold text-gray-900 dark:text-white">Discovery Configuration</span>
          {configExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {configExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Checkbox
                label="Include DNS Servers"
                checked={config.includeDNS}
                onChange={(checked) => updateConfig({ includeDNS: checked })}
                data-cy="include-dns-checkbox" data-testid="include-dns-checkbox"
              />
              <Checkbox
                label="Include DHCP Servers"
                checked={config.includeDHCP}
                onChange={(checked) => updateConfig({ includeDHCP: checked })}
                data-cy="include-dhcp-checkbox" data-testid="include-dhcp-checkbox"
              />
              <Checkbox
                label="Include DNS Zones"
                checked={config.includeZones}
                onChange={(checked) => updateConfig({ includeZones: checked })}
                data-cy="include-zones-checkbox" data-testid="include-zones-checkbox"
              />
              <Checkbox
                label="Include DNS Records"
                checked={config.includeRecords}
                onChange={(checked) => updateConfig({ includeRecords: checked })}
                data-cy="include-records-checkbox" data-testid="include-records-checkbox"
              />
              <Checkbox
                label="Include DHCP Scopes"
                checked={config.includeScopes}
                onChange={(checked) => updateConfig({ includeScopes: checked })}
                data-cy="include-scopes-checkbox" data-testid="include-scopes-checkbox"
              />
              <Checkbox
                label="Include DHCP Leases"
                checked={config.includeLeases}
                onChange={(checked) => updateConfig({ includeLeases: checked })}
                data-cy="include-leases-checkbox" data-testid="include-leases-checkbox"
              />
              <Checkbox
                label="Include DHCP Reservations"
                checked={config.includeReservations}
                onChange={(checked) => updateConfig({ includeReservations: checked })}
                data-cy="include-reservations-checkbox" data-testid="include-reservations-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Records Per Zone
              </label>
              <Input
                type="number"
                value={config.maxRecordsPerZone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = parseInt(e.target.value, 10);
                  updateConfig({ maxRecordsPerZone: isNaN(value) ? 10000 : value });
                }}
                min={100}
                max={100000}
                step={1000}
                data-cy="max-records-input" data-testid="max-records-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalDNSServers.toLocaleString()}</div>
                <div className="text-sm opacity-90">DNS Servers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalZones.toLocaleString()}</div>
                <div className="text-sm opacity-90">DNS Zones</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalDHCPServers.toLocaleString()}</div>
                <div className="text-sm opacity-90">DHCP Servers</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Database className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalScopes.toLocaleString()}</div>
                <div className="text-sm opacity-90">DHCP Scopes</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Zap className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalRecords.toLocaleString()}</div>
                <div className="text-sm opacity-90">DNS Records</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Activity className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.activeLeases.toLocaleString()}</div>
                <div className="text-sm opacity-90">Active Leases</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Activity className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.expiredLeases.toLocaleString()}</div>
                <div className="text-sm opacity-90">Expired Leases</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Network className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalLeases.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Leases</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview" data-testid="tab-overview"
          >
            <Network className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('dns-servers')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'dns-servers'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-dns-servers" data-testid="tab-dns-servers"
          >
            <Globe className="w-4 h-4" />
            DNS Servers
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalDNSServers}</span>}
          </button>
          <button
            onClick={() => setActiveTab('dns-zones')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'dns-zones'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-dns-zones" data-testid="tab-dns-zones"
          >
            <Layers className="w-4 h-4" />
            DNS Zones
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalZones}</span>}
          </button>
          <button
            onClick={() => setActiveTab('dhcp-servers')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'dhcp-servers'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-dhcp-servers" data-testid="tab-dhcp-servers"
          >
            <Server className="w-4 h-4" />
            DHCP Servers
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalDHCPServers}</span>}
          </button>
          <button
            onClick={() => setActiveTab('dhcp-scopes')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'dhcp-scopes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-dhcp-scopes" data-testid="tab-dhcp-scopes"
          >
            <Database className="w-4 h-4" />
            DHCP Scopes
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalScopes}</span>}
          </button>
          <button
            onClick={() => setActiveTab('leases')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'leases'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-leases" data-testid="tab-leases"
          >
            <Activity className="w-4 h-4" />
            Leases
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalLeases}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (!stats || (stats.totalDNSServers === 0 && stats.totalDHCPServers === 0)) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No DNS/DHCP Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view DNS and DHCP infrastructure.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (stats.totalDNSServers > 0 || stats.totalDHCPServers > 0) && (
          <div className="space-y-6 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">DNS/DHCP Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">DNS Servers</span>
                  <span className="text-lg font-bold text-blue-600">{stats.totalDNSServers}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">DNS Zones</span>
                  <span className="text-lg font-bold text-green-600">{stats.totalZones}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">DHCP Servers</span>
                  <span className="text-lg font-bold text-purple-600">{stats.totalDHCPServers}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Leases</span>
                  <span className="text-lg font-bold text-yellow-600">{stats.activeLeases}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <>
            {/* Search */}
            <div className="mb-4">
              <Input
                value={searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                placeholder="Search..."
                data-cy="search-input" data-testid="search-input"
              />
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {activeTab === 'dns-servers' && (
                <VirtualizedDataGrid
                  data={filteredDNSServers}
                  columns={dnsServerColumns}
                  loading={isDiscovering}
                  enableColumnReorder
                  enableColumnResize
                />
              )}
              {activeTab === 'dns-zones' && (
                <VirtualizedDataGrid
                  data={filteredDNSZones}
                  columns={dnsZoneColumns}
                  loading={isDiscovering}
                  enableColumnReorder
                  enableColumnResize
                />
              )}
              {activeTab === 'dhcp-servers' && (
                <VirtualizedDataGrid
                  data={filteredDHCPServers}
                  columns={dhcpServerColumns}
                  loading={isDiscovering}
                  enableColumnReorder
                  enableColumnResize
                />
              )}
              {activeTab === 'dhcp-scopes' && (
                <VirtualizedDataGrid
                  data={filteredDHCPScopes}
                  columns={dhcpScopeColumns}
                  loading={isDiscovering}
                  enableColumnReorder
                  enableColumnResize
                />
              )}
              {activeTab === 'leases' && (
                <VirtualizedDataGrid
                  data={filteredLeases}
                  columns={leaseColumns}
                  loading={isDiscovering}
                  enableColumnReorder
                  enableColumnResize
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="DNS & DHCP Discovery"
        scriptDescription="Discovering DNS zones, records, DHCP scopes, and lease assignments"
        logs={logs.map(log => ({
          timestamp: log.timestamp,
          message: log.message,
          level: log.level as 'info' | 'success' | 'warning' | 'error'
        }))}
        isRunning={isDiscovering}
        isCancelling={false}
        progress={progress ? {
          percentage: progress.percentage || 0,
          message: progress.message || 'Processing...'
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default DNSDHCPDiscoveryView;
