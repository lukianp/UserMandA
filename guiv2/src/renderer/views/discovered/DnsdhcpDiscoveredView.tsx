/**
 * DNS/DHCP Infrastructure Discovered View
 *
 * Rich discovered view with statistics, breakdowns, and data grids for network infrastructure
 */

import React from 'react';
import {
  Server,
  Network,
  HardDrive,
  Globe,
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Database,
  Users,
  Layers,
} from 'lucide-react';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { useDNSDHCPDiscoveredLogic } from '../../hooks/useDNSDHCPDiscoveredLogic';

// Discovery Success Card Component
const DiscoverySuccessCard: React.FC<{
  percentage: number;
  received: number;
  total: number;
}> = ({ percentage, received, total }) => {
  const getGradient = () => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-amber-600';
    if (percentage >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getIcon = () => {
    if (percentage >= 80) return CheckCircle2;
    if (percentage >= 60) return AlertTriangle;
    return XCircle;
  };

  const Icon = getIcon();

  return (
    <div className={`bg-gradient-to-br ${getGradient()} rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs opacity-80">Discovery Success</p>
          <p className="text-2xl font-bold">{percentage}%</p>
          <p className="text-xs opacity-80">
            {received}/{total} data sources
          </p>
        </div>
      </div>
    </div>
  );
};

// Statistics Card Component
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  gradient: string;
}> = ({ icon: Icon, label, value, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4 text-white shadow-lg`}>
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/20 rounded-lg">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs opacity-80">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

// Tab Button Component
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
      active
        ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
    }`}
  >
    <Icon size={18} />
    <span className="font-medium">{label}</span>
  </button>
);

// Overview Tab Component
const OverviewTab: React.FC<{
  statistics: any;
}> = ({ statistics }) => {
  return (
    <div className="p-6 overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DNS Server Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Server className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              DNS Server Status
            </h3>
          </div>
          <div className="space-y-3">
            {Object.entries(statistics.dnsServerStatusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${((count as number) / statistics.totalDNSServers) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {String(count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DNS Server Source Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Network className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              DNS Server Discovery Source
            </h3>
          </div>
          <div className="space-y-3">
            {Object.entries(statistics.dnsServerSourceBreakdown).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{source}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${((count as number) / statistics.totalDNSServers) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                    {String(count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DNS Zone Type Breakdown */}
        {statistics.totalDNSZones > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="text-purple-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                DNS Zone Types
              </h3>
            </div>
            <div className="space-y-3">
              {Object.entries(statistics.dnsZoneTypeBreakdown).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: `${((count as number) / statistics.totalDNSZones) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top DNS Record Types */}
        {statistics.topDNSRecordTypes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-indigo-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top DNS Record Types
              </h3>
            </div>
            <div className="space-y-3">
              {statistics.topDNSRecordTypes.slice(0, 5).map((item: any) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${(item.count / statistics.totalDNSRecords) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DnsdhcpDiscoveredView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    filteredData,
    statistics,
    exportToCSV,
  } = useDNSDHCPDiscoveredLogic();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading DNS/DHCP data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <XCircle className="w-12 h-12 mx-auto mb-4" />
          <p>Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <Network size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              DNS & DHCP Infrastructure
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Network foundation services - DNS servers, zones, records, DHCP servers, scopes, leases
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid (3 rows × 4 columns = 12 cards) */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1 - FIRST CARD MUST BE DISCOVERY SUCCESS */}
        <DiscoverySuccessCard
          percentage={statistics.discoverySuccessPercentage}
          received={statistics.dataSourcesReceivedCount}
          total={statistics.dataSourcesTotal}
        />
        <StatCard
          icon={Server}
          label="DNS Servers"
          value={statistics.totalDNSServers}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Responsive DNS"
          value={statistics.responsiveDNSServers}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={Globe}
          label="DNS Zones"
          value={statistics.totalDNSZones}
          gradient="from-purple-500 to-purple-600"
        />

        {/* Row 2 */}
        <StatCard
          icon={Database}
          label="DNS Records"
          value={statistics.totalDNSRecords}
          gradient="from-indigo-500 to-indigo-600"
        />
        <StatCard
          icon={HardDrive}
          label="DHCP Servers"
          value={statistics.totalDHCPServers}
          gradient="from-cyan-500 to-cyan-600"
        />
        <StatCard
          icon={Activity}
          label="Accessible DHCP"
          value={statistics.accessibleDHCPServers}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={Layers}
          label="DHCP Scopes"
          value={statistics.totalDHCPScopes}
          gradient="from-orange-500 to-orange-600"
        />

        {/* Row 3 */}
        <StatCard
          icon={Users}
          label="DHCP Leases"
          value={statistics.totalDHCPLeases}
          gradient="from-rose-500 to-rose-600"
        />
        <StatCard
          icon={Shield}
          label="DHCP Reservations"
          value={statistics.totalDHCPReservations}
          gradient="from-violet-500 to-violet-600"
        />
        <StatCard
          icon={XCircle}
          label="Unresponsive DNS"
          value={statistics.unresponsiveDNSServers}
          gradient="from-teal-500 to-teal-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Inaccessible DHCP"
          value={statistics.inaccessibleDHCPServers}
          gradient="from-pink-500 to-pink-600"
        />
      </div>

      {/* Tabs */}
      <div className="px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2 overflow-x-auto">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={FileText}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'dns-servers'}
            onClick={() => setActiveTab('dns-servers')}
            icon={Server}
            label={`DNS Servers (${statistics.totalDNSServers})`}
          />
          {statistics.totalDNSZones > 0 && (
            <TabButton
              active={activeTab === 'dns-zones'}
              onClick={() => setActiveTab('dns-zones')}
              icon={Globe}
              label={`DNS Zones (${statistics.totalDNSZones})`}
            />
          )}
          {statistics.totalDNSRecords > 0 && (
            <TabButton
              active={activeTab === 'dns-records'}
              onClick={() => setActiveTab('dns-records')}
              icon={Database}
              label={`DNS Records (${statistics.totalDNSRecords})`}
            />
          )}
          {statistics.totalDHCPServers > 0 && (
            <TabButton
              active={activeTab === 'dhcp-servers'}
              onClick={() => setActiveTab('dhcp-servers')}
              icon={HardDrive}
              label={`DHCP Servers (${statistics.totalDHCPServers})`}
            />
          )}
          {statistics.totalDHCPScopes > 0 && (
            <TabButton
              active={activeTab === 'dhcp-scopes'}
              onClick={() => setActiveTab('dhcp-scopes')}
              icon={Layers}
              label={`DHCP Scopes (${statistics.totalDHCPScopes})`}
            />
          )}
          {statistics.totalDHCPLeases > 0 && (
            <TabButton
              active={activeTab === 'dhcp-leases'}
              onClick={() => setActiveTab('dhcp-leases')}
              icon={Users}
              label={`DHCP Leases (${statistics.totalDHCPLeases})`}
            />
          )}
          {statistics.totalDHCPReservations > 0 && (
            <TabButton
              active={activeTab === 'dhcp-reservations'}
              onClick={() => setActiveTab('dhcp-reservations')}
              icon={Shield}
              label={`DHCP Reservations (${statistics.totalDHCPReservations})`}
            />
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && <OverviewTab statistics={statistics} />}

        {activeTab !== 'overview' && (() => {
          // Define columns based on active tab
          let columns: any[] = [];

          if (activeTab === 'dnsServers') {
            columns = [
              { field: 'IPAddress', headerName: 'IP Address', width: 150 },
              { field: 'Name', headerName: 'Name', width: 200 },
              { field: 'ComputerName', headerName: 'Computer Name', width: 200 },
              { field: 'Source', headerName: 'Source', width: 150 },
              { field: 'Status', headerName: 'Status', width: 120 },
              { field: 'Version', headerName: 'Version', width: 120 },
              { field: 'Forest', headerName: 'Forest', width: 150 },
              { field: 'Domain', headerName: 'Domain', width: 150 },
            ];
          } else if (activeTab === 'dnsZones') {
            columns = [
              { field: 'ZoneName', headerName: 'Zone Name', width: 250 },
              { field: 'ZoneType', headerName: 'Zone Type', width: 150 },
              { field: 'IsDsIntegrated', headerName: 'DS Integrated', width: 140 },
              { field: 'DynamicUpdate', headerName: 'Dynamic Update', width: 150 },
              { field: 'ReplicationScope', headerName: 'Replication Scope', width: 180 },
              { field: 'IsReverseLookupZone', headerName: 'Reverse Zone', width: 140 },
            ];
          } else if (activeTab === 'dnsRecords') {
            columns = [
              { field: 'ZoneName', headerName: 'Zone Name', width: 200 },
              { field: 'RecordName', headerName: 'Record Name', width: 250 },
              { field: 'RecordType', headerName: 'Type', width: 100 },
              { field: 'RecordData', headerName: 'Data', width: 300 },
              { field: 'TimeToLive', headerName: 'TTL', width: 100 },
            ];
          } else if (activeTab === 'dhcpServers') {
            columns = [
              { field: 'Name', headerName: 'Name', width: 200 },
              { field: 'ComputerName', headerName: 'Computer Name', width: 200 },
              { field: 'IPAddress', headerName: 'IP Address', width: 150 },
              { field: 'Source', headerName: 'Source', width: 150 },
              { field: 'Status', headerName: 'Status', width: 120 },
            ];
          } else if (activeTab === 'dhcpScopes') {
            columns = [
              { field: 'ScopeId', headerName: 'Scope ID', width: 150 },
              { field: 'Name', headerName: 'Name', width: 200 },
              { field: 'StartRange', headerName: 'Start Range', width: 150 },
              { field: 'EndRange', headerName: 'End Range', width: 150 },
              { field: 'SubnetMask', headerName: 'Subnet Mask', width: 150 },
              { field: 'State', headerName: 'State', width: 120 },
            ];
          } else if (activeTab === 'dhcpLeases') {
            columns = [
              { field: 'IPAddress', headerName: 'IP Address', width: 150 },
              { field: 'ClientId', headerName: 'Client ID', width: 200 },
              { field: 'HostName', headerName: 'Host Name', width: 200 },
              { field: 'AddressState', headerName: 'State', width: 120 },
              { field: 'LeaseExpiryTime', headerName: 'Expiry Time', width: 180 },
            ];
          } else if (activeTab === 'dhcpReservations') {
            columns = [
              { field: 'IPAddress', headerName: 'IP Address', width: 150 },
              { field: 'ClientId', headerName: 'Client ID', width: 200 },
              { field: 'Name', headerName: 'Name', width: 200 },
              { field: 'Description', headerName: 'Description', width: 300 },
            ];
          }

          return (
            <div className="flex flex-col h-full">
              {/* Search and Export Bar */}
              <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex gap-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Export CSV
                </button>
              </div>

              {/* Data Grid */}
              <div className="flex-1 overflow-hidden">
                <VirtualizedDataGrid
                  data={filteredData as any[]}
                  columns={columns}
                  loading={isLoading}
                  enableColumnReorder
                  enableColumnResize
                />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default DnsdhcpDiscoveredView;
