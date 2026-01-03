/**
 * Environment Detection Discovered View
 * Rich visualization of comprehensive environment detection data
 */

import React from 'react';
import {
  Server,
  HardDrive,
  Network,
  Shield,
  Cloud,
  Package,
  Database,
  Route,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Monitor,
  Cpu,
  Building2,
  Activity,
  Lock,
  RefreshCw,
  Globe,
  Layers
} from 'lucide-react';
import { useEnvironmentDetectionDiscoveredLogic } from '../../hooks/useEnvironmentDetectionDiscoveredLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const DiscoverySuccessCard: React.FC<{ percentage: number; received: number; total: number }> = ({ percentage, received, total }) => {
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
    <div className={`bg-gradient-to-br ${getGradient()} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
          <Icon size={32} />
        </div>
        <div className="flex-1">
          <p className="text-sm opacity-90 font-medium">Discovery Success</p>
          <p className="text-4xl font-bold mt-1">{percentage}%</p>
          <p className="text-sm opacity-90 mt-1">{received}/{total} data sources collected</p>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: any;
  label: string;
  value: string | number;
  gradient: string;
  subtitle?: string;
}> = ({ icon: Icon, label, value, gradient, subtitle }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all`}>
    <div className="flex items-center gap-3 mb-2">
      <Icon size={24} className="opacity-90" />
      <p className="text-sm opacity-90 font-medium">{label}</p>
    </div>
    <p className="text-3xl font-bold">{value}</p>
    {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
  </div>
);

export const EnvironmentdetectionDiscoveredView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    statistics: stats,
    filteredData,
    exportToCSV,
    osData,
    hardwareData,
    networkData,
    storageData,
    applicationsData,
  } = useEnvironmentDetectionDiscoveredLogic();

  if (loading) {
    return <LoadingOverlay message="Loading environment detection data..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <XCircle className="mx-auto text-red-500 mb-4" size={48} />
          <p className="text-lg text-gray-700">Error loading data</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'hybrid', label: 'Hybrid Status', icon: Layers },
    { id: 'os', label: 'Operating System', icon: Monitor, count: osData.length },
    { id: 'hardware', label: 'Hardware', icon: Cpu, count: hardwareData.length },
    { id: 'network', label: 'Network', icon: Network, count: networkData.length },
    { id: 'domain', label: 'Domain', icon: Building2, count: 1 },
    { id: 'virtualization', label: 'Virtualization', icon: Server, count: 1 },
    { id: 'cloud', label: 'Cloud', icon: Cloud, count: 1 },
    { id: 'security', label: 'Security', icon: Shield, count: 1 },
    { id: 'software', label: 'Software', icon: Package, count: 1 },
    { id: 'applications', label: 'Applications', icon: Package, count: applicationsData.length },
    { id: 'storage', label: 'Storage', icon: Database, count: storageData.length },
    { id: 'routes', label: 'Network Routes', icon: Route, count: stats.totalRoutes },
    { id: 'azure', label: 'Azure Connectivity', icon: Globe, count: 1 },
    { id: 'sync', label: 'AD Connect Sync', icon: RefreshCw, count: 1 },
  ];

  // Column definitions for each tab
  const getColumns = () => {
    switch (activeTab) {
      case 'os':
        return [
          { field: 'OSName', headerName: 'OS Name', width: 250 },
          { field: 'OSVersion', headerName: 'Version', width: 150 },
          { field: 'OSBuildNumber', headerName: 'Build', width: 120 },
          { field: 'OSArchitecture', headerName: 'Architecture', width: 120 },
          { field: 'TotalPhysicalMemoryGB', headerName: 'Total RAM (GB)', width: 130 },
          { field: 'FreePhysicalMemoryGB', headerName: 'Free RAM (GB)', width: 130 },
          { field: 'PowerShellVersion', headerName: 'PowerShell', width: 150 },
          { field: 'InstallDate', headerName: 'Install Date', width: 180 },
          { field: 'LastBootUpTime', headerName: 'Last Boot', width: 180 },
        ];
      case 'hardware':
        return [
          { field: 'Manufacturer', headerName: 'Manufacturer', width: 200 },
          { field: 'Model', headerName: 'Model', width: 250 },
          { field: 'ProcessorName', headerName: 'Processor', width: 300 },
          { field: 'ProcessorCores', headerName: 'Cores', width: 100 },
          { field: 'ProcessorLogicalProcessors', headerName: 'Logical Processors', width: 150 },
          { field: 'ProcessorMaxClockSpeed', headerName: 'Max Speed (MHz)', width: 150 },
          { field: 'TotalPhysicalMemoryGB', headerName: 'RAM (GB)', width: 120 },
          { field: 'BIOSVersion', headerName: 'BIOS Version', width: 150 },
        ];
      case 'network':
        return [
          { field: 'AdapterName', headerName: 'Adapter Name', width: 200 },
          { field: 'InterfaceDescription', headerName: 'Description', width: 300 },
          { field: 'MACAddress', headerName: 'MAC Address', width: 150 },
          { field: 'LinkSpeed', headerName: 'Link Speed', width: 120 },
          { field: 'IPAddress', headerName: 'IP Address', width: 150 },
          { field: 'SubnetMask', headerName: 'Subnet', width: 100 },
          { field: 'DefaultGateway', headerName: 'Gateway', width: 150 },
          { field: 'DNSServers', headerName: 'DNS Servers', width: 200 },
          { field: 'Status', headerName: 'Status', width: 100 },
        ];
      case 'domain':
        return [
          { field: 'ComputerName', headerName: 'Computer Name', width: 200 },
          { field: 'Domain', headerName: 'Domain', width: 200 },
          { field: 'DomainRole', headerName: 'Domain Role', width: 200 },
          { field: 'PartOfDomain', headerName: 'Domain Joined', width: 120 },
          { field: 'LogonServer', headerName: 'Logon Server', width: 150 },
          { field: 'UserDomain', headerName: 'User Domain', width: 150 },
        ];
      case 'applications':
        return [
          { field: 'ApplicationName', headerName: 'Application', width: 300 },
          { field: 'Version', headerName: 'Version', width: 150 },
          { field: 'Publisher', headerName: 'Publisher', width: 200 },
          { field: 'Architecture', headerName: 'Architecture', width: 120 },
          { field: 'InstallDate', headerName: 'Install Date', width: 120 },
          { field: 'EstimatedSizeMB', headerName: 'Size (MB)', width: 120 },
          { field: 'InstallLocation', headerName: 'Install Location', width: 300 },
        ];
      case 'storage':
        return [
          { field: 'DriveLetter', headerName: 'Drive', width: 100 },
          { field: 'VolumeName', headerName: 'Volume Name', width: 200 },
          { field: 'DriveType', headerName: 'Type', width: 150 },
          { field: 'FileSystem', headerName: 'File System', width: 120 },
          { field: 'TotalSizeGB', headerName: 'Total (GB)', width: 120 },
          { field: 'UsedSpaceGB', headerName: 'Used (GB)', width: 120 },
          { field: 'FreeSpaceGB', headerName: 'Free (GB)', width: 120 },
          { field: 'PercentFree', headerName: '% Free', width: 100 },
          { field: 'HealthStatus', headerName: 'Health', width: 120 },
        ];
      case 'routes':
        return [
          { field: 'DestinationPrefix', headerName: 'Destination', width: 200 },
          { field: 'NextHop', headerName: 'Next Hop', width: 150 },
          { field: 'InterfaceAlias', headerName: 'Interface', width: 200 },
          { field: 'RouteMetric', headerName: 'Metric', width: 100 },
          { field: 'Protocol', headerName: 'Protocol', width: 120 },
          { field: 'AddressFamily', headerName: 'Family', width: 100 },
          { field: 'State', headerName: 'State', width: 100 },
        ];
      case 'azure':
        return [
          { field: 'IsAzureConnected', headerName: 'Connected', width: 120 },
          { field: 'TenantName', headerName: 'Tenant Name', width: 250 },
          { field: 'TenantId', headerName: 'Tenant ID', width: 300 },
          { field: 'TenantType', headerName: 'Tenant Type', width: 150 },
          { field: 'VerifiedDomains', headerName: 'Verified Domains', width: 300 },
          { field: 'ConnectionMethod', headerName: 'Connection Method', width: 200 },
          { field: 'LastTestTime', headerName: 'Last Test', width: 180 },
          { field: 'ErrorDetails', headerName: 'Error Details', width: 300 },
        ];
      case 'sync':
        return [
          { field: 'DirSyncEnabled', headerName: 'Sync Enabled', width: 120 },
          { field: 'SyncType', headerName: 'Sync Type', width: 120 },
          { field: 'SyncPercentage', headerName: 'Sync %', width: 100 },
          { field: 'SyncedUserCount', headerName: 'Synced Users', width: 130 },
          { field: 'CloudOnlyUserCount', headerName: 'Cloud-Only Users', width: 150 },
          { field: 'TotalUserCount', headerName: 'Total Users', width: 120 },
          { field: 'LastDirSyncTime', headerName: 'Last Sync', width: 180 },
          { field: 'OnPremisesDomainName', headerName: 'On-Prem Domain', width: 200 },
          { field: 'OnPremisesNetBiosName', headerName: 'NetBIOS Name', width: 150 },
        ];
      case 'hybrid':
        return [
          { field: 'EnvironmentType', headerName: 'Environment Type', width: 200 },
          { field: 'Description', headerName: 'Description', width: 400 },
          { field: 'IsDomainJoined', headerName: 'Domain Joined', width: 130 },
          { field: 'IsAzureConnected', headerName: 'Azure Connected', width: 150 },
          { field: 'IsDirSyncEnabled', headerName: 'Sync Enabled', width: 130 },
          { field: 'SyncType', headerName: 'Sync Type', width: 120 },
          { field: 'SyncPercentage', headerName: 'Sync %', width: 100 },
          { field: 'OnPremDomain', headerName: 'On-Prem Domain', width: 200 },
          { field: 'AzureTenantName', headerName: 'Azure Tenant', width: 200 },
          { field: 'ClassificationTime', headerName: 'Classification Time', width: 180 },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Environment Detection</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive local environment introspection and topology analysis
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Row 1 - Discovery Success & Hybrid Environment */}
          <DiscoverySuccessCard
            percentage={stats.discoverySuccessPercentage}
            received={stats.dataSourcesReceivedCount}
            total={stats.dataSourcesTotal}
          />
          <StatCard
            icon={Layers}
            label="Environment Type"
            value={stats.environmentType}
            gradient={
              stats.environmentType.includes('FullSync') ? 'from-green-500 to-emerald-600' :
              stats.environmentType.includes('PartialSync') ? 'from-yellow-500 to-amber-600' :
              stats.environmentType.includes('NoSync') ? 'from-orange-500 to-orange-600' :
              stats.environmentType === 'PureAzure' ? 'from-sky-500 to-blue-600' :
              stats.environmentType === 'PureOnPrem' ? 'from-indigo-500 to-indigo-600' :
              'from-gray-500 to-gray-600'
            }
            subtitle={stats.isDomainJoined ? `Domain: ${stats.domainName}` : 'Not domain-joined'}
          />
          <StatCard
            icon={Globe}
            label="Azure Tenant"
            value={stats.azureTenantName}
            gradient={stats.isAzureConnected ? 'from-blue-500 to-blue-600' : 'from-gray-500 to-gray-600'}
            subtitle={stats.isAzureConnected ? stats.azureTenantType : 'Not connected'}
          />
          <StatCard
            icon={RefreshCw}
            label="AD Connect Status"
            value={stats.isDirSyncEnabled ? `${stats.syncPercentage}% synced` : 'Not syncing'}
            gradient={
              stats.isDirSyncEnabled && stats.syncPercentage >= 80 ? 'from-green-500 to-green-600' :
              stats.isDirSyncEnabled && stats.syncPercentage >= 40 ? 'from-yellow-500 to-yellow-600' :
              stats.isDirSyncEnabled ? 'from-orange-500 to-orange-600' :
              'from-gray-500 to-gray-600'
            }
            subtitle={stats.isDirSyncEnabled ? `${stats.syncedUserCount}/${stats.totalUserCount} users` : 'No directory sync'}
          />

          {/* Row 2 - Infrastructure */}
          <StatCard icon={Cpu} label="Processor" value={`${stats.processorCores} cores`} gradient="from-indigo-500 to-indigo-600" subtitle={stats.processorName.substring(0, 30)} />
          <StatCard icon={Building2} label="Domain Status" value={stats.isDomainJoined ? 'Domain' : 'Workgroup'} gradient="from-cyan-500 to-cyan-600" subtitle={stats.domainName} />
          <StatCard icon={Server} label="Environment" value={stats.virtualizationType} gradient="from-emerald-500 to-emerald-600" subtitle={stats.hypervisorVendor} />
          <StatCard icon={Cloud} label="Cloud Provider" value={stats.cloudProvider} gradient="from-orange-500 to-orange-600" subtitle={stats.isCloudInstance ? 'Cloud' : 'On-Premises'} />

          {/* Row 3 - Security & Software */}
          <StatCard icon={Shield} label="Windows Defender" value={stats.windowsDefenderStatus} gradient="from-rose-500 to-rose-600" subtitle={`${stats.antivirusCount} AV products`} />
          <StatCard icon={Lock} label="Firewall" value={stats.firewallEnabled ? 'Enabled' : 'Disabled'} gradient="from-violet-500 to-violet-600" subtitle={`UAC: ${stats.uacEnabled ? 'On' : 'Off'}`} />
          <StatCard icon={Package} label="Applications" value={stats.totalApplications} gradient="from-teal-500 to-teal-600" subtitle={`${stats.applicationsByArchitecture.x64} x64, ${stats.applicationsByArchitecture.x86} x86`} />
          <StatCard icon={Database} label="Storage" value={`${stats.totalStorageCapacityGB.toFixed(0)} GB`} gradient="from-pink-500 to-pink-600" subtitle={`${stats.storageUsagePercent}% used`} />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'overview' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Monitor className="text-blue-500" size={20} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">System Information</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">OS Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.osName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Version:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.osVersion}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Build:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.osBuild}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Architecture:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.osArchitecture}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Install Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{new Date(stats.osInstallDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">PowerShell:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.powerShellVersion}</span>
                  </div>
                </div>
              </div>

              {/* Hardware Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="text-indigo-500" size={20} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Hardware Summary</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Manufacturer:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.hardwareManufacturer}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Model:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.hardwareModel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Processor:</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate ml-2" title={stats.processorName}>{stats.processorName.substring(0, 30)}...</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Cores / Threads:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.processorCores} / {stats.processorLogicalProcessors}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Memory:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.totalPhysicalMemoryGB.toFixed(1)} GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">BIOS:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.biosVersion}</span>
                  </div>
                </div>
              </div>

              {/* Network Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Network className="text-purple-500" size={20} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Network Summary</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Adapters:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.networkAdapterCount} ({stats.activeAdapters} active)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Bandwidth:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.totalLinkSpeedGbps.toFixed(1)} Gbps</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Configured IPs:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.adaptersWithIP}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Routes:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.totalRoutes} ({stats.ipv4Routes} IPv4, {stats.ipv6Routes} IPv6)</span>
                  </div>
                </div>
              </div>

              {/* Security Posture */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="text-rose-500" size={20} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Security Posture</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Windows Defender:</span>
                    <span className={`font-medium ${stats.windowsDefenderStatus === 'Enabled' ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.windowsDefenderStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Firewall:</span>
                    <span className={`font-medium ${stats.firewallEnabled ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.firewallEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">UAC:</span>
                    <span className={`font-medium ${stats.uacEnabled ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.uacEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">AV Products:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.antivirusCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">BitLocker Volumes:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{stats.bitlockerVolumes}</span>
                  </div>
                </div>
              </div>

              {/* Top Publishers (if applications exist) */}
              {stats.topPublishers.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="text-teal-500" size={20} />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Top Application Publishers</h3>
                  </div>
                  <div className="space-y-2">
                    {stats.topPublishers.slice(0, 5).map((pub, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-32 text-sm text-gray-600 dark:text-gray-400 truncate">{pub.name}</div>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                            style={{ width: `${(pub.count / stats.totalApplications) * 100}%` }}
                          >
                            {pub.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'hybrid' ? (
          <div className="p-6 overflow-y-auto h-full bg-gray-50 dark:bg-gray-900">
            {/* Hybrid Status 3-Panel Layout */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              {/* Panel 1: On-Premises */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Building2 className="text-indigo-600 dark:text-indigo-400" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">On-Premises</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Domain Status</p>
                    <p className={`text-lg font-semibold ${stats.isDomainJoined ? 'text-green-600' : 'text-gray-600'}`}>
                      {stats.isDomainJoined ? 'Domain Joined' : 'Not Joined'}
                    </p>
                  </div>
                  {stats.isDomainJoined && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Domain Name</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.domainName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Computer Name</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.computerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Domain Role</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.domainRole}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Panel 2: Azure */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                    <Cloud className="text-sky-600 dark:text-sky-400" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Azure</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Connection Status</p>
                    <p className={`text-lg font-semibold ${stats.isAzureConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.isAzureConnected ? 'Connected' : 'Not Connected'}
                    </p>
                  </div>
                  {stats.isAzureConnected && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tenant Name</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.azureTenantName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tenant Type</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.azureTenantType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Connection Method</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{stats.azureConnectionMethod}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Panel 3: AD Connect Sync */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <RefreshCw className="text-purple-600 dark:text-purple-400" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">AD Connect</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sync Status</p>
                    <p className={`text-lg font-semibold ${stats.isDirSyncEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                      {stats.isDirSyncEnabled ? 'Enabled' : 'Not Enabled'}
                    </p>
                  </div>
                  {stats.isDirSyncEnabled && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sync Type</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.syncType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sync Percentage</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div
                              className={`h-full rounded-full ${
                                stats.syncPercentage >= 80 ? 'bg-green-500' :
                                stats.syncPercentage >= 40 ? 'bg-yellow-500' :
                                'bg-orange-500'
                              }`}
                              style={{ width: `${stats.syncPercentage}%` }}
                            />
                          </div>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.syncPercentage}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Synced Users</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {stats.syncedUserCount} / {stats.totalUserCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Sync</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {stats.lastDirSyncTime === 'Never' ? 'Never' : new Date(stats.lastDirSyncTime).toLocaleString()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Classification Panel */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg shadow-md p-8 border border-purple-200 dark:border-purple-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <Layers className="text-purple-600 dark:text-purple-400" size={32} />
                Environment Classification
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Type:</span>
                  <span className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                    stats.environmentType.includes('FullSync') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    stats.environmentType.includes('PartialSync') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    stats.environmentType.includes('NoSync') ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                    stats.environmentType === 'PureAzure' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400' :
                    stats.environmentType === 'PureOnPrem' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {stats.environmentType}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                  {stats.environmentDescription}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-screen overflow-hidden">
            {/* Search and Export Bar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export CSV
              </button>
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-900">
              <VirtualizedDataGrid
                data={filteredData}
                columns={getColumns()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironmentdetectionDiscoveredView;
