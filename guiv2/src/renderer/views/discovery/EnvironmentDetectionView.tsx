/**
 * Environment Detection Discovery View
 * Local environment introspection: OS, hardware, network, domain, virtualization, cloud, security, software
 * Shows comprehensive environment data after discovery execution
 */

import React, { useState, useEffect } from 'react';
import { Radar, Download, FileSpreadsheet, AlertCircle, Play, XCircle, Server, HardDrive, Network, Shield, Cloud, Package, Database, Route, Square } from 'lucide-react';

import { useEnvironmentDetectionDiscoveryLogic as useEnvironmentDetectionLogic } from '../../hooks/useEnvironmentDetectionLogic';
import { useEnvironmentDetectionDiscoveredLogic } from '../../hooks/useEnvironmentDetectionDiscoveredLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import { ViewDiscoveredDataButton } from '../../components/molecules/ViewDiscoveredDataButton';

const EnvironmentDetectionView: React.FC = () => {
  // Discovery execution logic
  const {
    result,
    isDetecting,
    isCancelling,
    showExecutionDialog,
    progress,
    error,
    errors,
    logs,
    startDetection,
    cancelDetection,
    setShowExecutionDialog,
    clearLogs,
  } = useEnvironmentDetectionLogic();

  // Data display logic (loads actual CSV data after discovery)
  const {
    statistics,
    osData,
    hardwareData,
    networkData,
    domainData,
    virtualizationData,
    cloudData,
    securityData,
    softwareData,
    applicationsData,
    storageData,
    routesData,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filteredData,
    exportToCSV,
  } = useEnvironmentDetectionDiscoveredLogic();

  // Reload discovered data when discovery completes
  useEffect(() => {
    if (result && !isDetecting) {
      // Data will auto-reload via useEnvironmentDetectionDiscoveredLogic watching profile changes
    }
  }, [result, isDetecting]);

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="environment-detection-view" data-testid="environment-detection-view">

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Radar className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Environment Detection</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive environment detection: local systems, Azure connectivity, hybrid classification, and AD Connect sync status</p>
          </div>
        </div>

        <div className="flex gap-3">
          {result && osData.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => exportToCSV()}
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          )}
          {!isDetecting ? (
            <Button
              variant="primary"
              onClick={startDetection}
              icon={<Play className="w-4 h-4" />}
              data-testid="start-discovery-btn"
            >
              Start Detection
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={cancelDetection}
              icon={<Square className="w-4 h-4" />}
              disabled={isCancelling}
              data-testid="cancel-discovery-btn"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel'}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Error</h4>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {result && osData.length > 0 && (
        <div className="p-6 bg-white dark:bg-gray-800 border-b">
          <h3 className="text-sm font-medium mb-4">Environment Statistics</h3>
          <div className="grid grid-cols-4 gap-4">
            {/* Row 1 */}
            <DiscoverySuccessCard
              percentage={statistics.discoverySuccessPercentage}
              received={statistics.dataSourcesReceivedCount}
              total={statistics.dataSourcesTotal}
            />
            <StatCard
              icon={<Server className="w-6 h-6" />}
              value={statistics.osName}
              label="Operating System"
              gradient="from-sky-500 to-blue-600"
            />
            <StatCard
              icon={<HardDrive className="w-6 h-6" />}
              value={`${statistics.osMemoryUsagePercent}%`}
              label={`Memory (${statistics.totalPhysicalMemoryGB} GB)`}
              gradient="from-green-500 to-emerald-600"
            />
            <StatCard
              icon={<Network className="w-6 h-6" />}
              value={statistics.networkAdapterCount}
              label="Network Adapters"
              gradient="from-purple-500 to-violet-600"
            />

            {/* Row 2 */}
            <StatCard
              icon={<HardDrive className="w-6 h-6" />}
              value={`${statistics.processorCores} Cores`}
              label={statistics.processorName.substring(0, 20)}
              gradient="from-indigo-500 to-blue-600"
            />
            <StatCard
              icon={<Shield className="w-6 h-6" />}
              value={statistics.isDomainJoined ? 'Joined' : 'Workgroup'}
              label={statistics.domainName}
              gradient="from-cyan-500 to-teal-600"
            />
            <StatCard
              icon={<Cloud className="w-6 h-6" />}
              value={statistics.virtualizationType}
              label="Environment"
              gradient="from-emerald-500 to-green-600"
            />
            <StatCard
              icon={<Cloud className="w-6 h-6" />}
              value={statistics.cloudProvider}
              label="Cloud Provider"
              gradient="from-orange-500 to-amber-600"
            />

            {/* Row 3 */}
            <StatCard
              icon={<Shield className="w-6 h-6" />}
              value={statistics.windowsDefenderStatus}
              label="Windows Defender"
              gradient="from-rose-500 to-red-600"
            />
            <StatCard
              icon={<Shield className="w-6 h-6" />}
              value={statistics.firewallEnabled ? 'Enabled' : 'Disabled'}
              label="Firewall"
              gradient="from-violet-500 to-purple-600"
            />
            <StatCard
              icon={<Package className="w-6 h-6" />}
              value={applicationsData.length}
              label="Applications"
              gradient="from-teal-500 to-cyan-600"
            />
            <StatCard
              icon={<Database className="w-6 h-6" />}
              value={storageData.length}
              label="Storage Volumes"
              gradient="from-pink-500 to-rose-600"
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      {result && osData.length > 0 && (
        <>
          <div className="flex gap-1 px-6 pt-4 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
            <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <TabButton label="OS" active={activeTab === 'os'} onClick={() => setActiveTab('os')} count={osData.length} />
            <TabButton label="Hardware" active={activeTab === 'hardware'} onClick={() => setActiveTab('hardware')} count={hardwareData.length} />
            <TabButton label="Network" active={activeTab === 'network'} onClick={() => setActiveTab('network')} count={networkData.length} />
            <TabButton label="Domain" active={activeTab === 'domain'} onClick={() => setActiveTab('domain')} count={domainData.length} />
            <TabButton label="Virtualization" active={activeTab === 'virtualization'} onClick={() => setActiveTab('virtualization')} count={virtualizationData.length} />
            <TabButton label="Cloud" active={activeTab === 'cloud'} onClick={() => setActiveTab('cloud')} count={cloudData.length} />
            <TabButton label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} count={securityData.length} />
            <TabButton label="Software" active={activeTab === 'software'} onClick={() => setActiveTab('software')} count={softwareData.length} />
            <TabButton label="Applications" active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} count={applicationsData.length} />
            <TabButton label="Storage" active={activeTab === 'storage'} onClick={() => setActiveTab('storage')} count={storageData.length} />
            <TabButton label="Routes" active={activeTab === 'routes'} onClick={() => setActiveTab('routes')} count={routesData.length} />
          </div>

          {/* Search Bar */}
          {activeTab !== 'overview' && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTab}...`}
              />
            </div>
          )}
        </>
      )}

      {/* Content Grid */}
      <div className="flex-1 px-6 pb-6 bg-gray-50 dark:bg-gray-900">
        {!result || osData.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
            <div className="text-center p-8">
              <Radar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Environment Data</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Click "Start Detection" to analyze the local environment</p>
            </div>
          </div>
        ) : activeTab === 'overview' ? (
          <OverviewTab statistics={statistics} />
        ) : (
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
            <VirtualizedDataGrid
              data={Array.isArray(filteredData) ? filteredData : []}
              columns={
                activeTab === 'os' ? [
                  { field: 'OSName', headerName: 'OS Name', width: 200 },
                  { field: 'OSVersion', headerName: 'Version', width: 150 },
                  { field: 'OSBuildNumber', headerName: 'Build', width: 120 },
                  { field: 'TotalPhysicalMemoryGB', headerName: 'Memory (GB)', width: 120 },
                  { field: 'InstallDate', headerName: 'Install Date', width: 150 },
                ] :
                activeTab === 'hardware' ? [
                  { field: 'Manufacturer', headerName: 'Manufacturer', width: 150 },
                  { field: 'Model', headerName: 'Model', width: 200 },
                  { field: 'ProcessorName', headerName: 'Processor', width: 250 },
                  { field: 'ProcessorCores', headerName: 'Cores', width: 100 },
                  { field: 'TotalPhysicalMemoryGB', headerName: 'Memory (GB)', width: 120 },
                ] :
                activeTab === 'network' ? [
                  { field: 'AdapterName', headerName: 'Adapter Name', width: 200 },
                  { field: 'IPAddress', headerName: 'IP Address', width: 150 },
                  { field: 'MACAddress', headerName: 'MAC Address', width: 150 },
                  { field: 'Status', headerName: 'Status', width: 100 },
                  { field: 'LinkSpeed', headerName: 'Speed', width: 120 },
                ] :
                activeTab === 'domain' ? [
                  { field: 'ComputerName', headerName: 'Computer Name', width: 200 },
                  { field: 'Domain', headerName: 'Domain', width: 200 },
                  { field: 'PartOfDomain', headerName: 'Domain Joined', width: 120 },
                  { field: 'DomainRole', headerName: 'Role', width: 150 },
                ] :
                activeTab === 'virtualization' ? [
                  { field: 'IsVirtual', headerName: 'Is Virtual', width: 120 },
                  { field: 'VirtualizationType', headerName: 'Type', width: 150 },
                  { field: 'HypervisorVendor', headerName: 'Hypervisor', width: 150 },
                ] :
                activeTab === 'cloud' ? [
                  { field: 'IsCloudInstance', headerName: 'Is Cloud', width: 120 },
                  { field: 'CloudProvider', headerName: 'Provider', width: 150 },
                  { field: 'InstanceId', headerName: 'Instance ID', width: 300 },
                ] :
                activeTab === 'security' ? [
                  { field: 'WindowsDefenderStatus', headerName: 'Defender', width: 150 },
                  { field: 'FirewallDomainEnabled', headerName: 'Firewall', width: 120 },
                  { field: 'UACEnabled', headerName: 'UAC', width: 100 },
                  { field: 'BitLockerEnabled', headerName: 'BitLocker', width: 120 },
                ] :
                activeTab === 'software' ? [
                  { field: 'PowerShellVersion', headerName: 'PowerShell', width: 150 },
                  { field: 'DotNetFrameworkVersions', headerName: '.NET Versions', width: 200 },
                  { field: 'WindowsFeaturesEnabled', headerName: 'Features', width: 120 },
                  { field: 'IISInstalled', headerName: 'IIS', width: 100 },
                ] :
                activeTab === 'applications' ? [
                  { field: 'DisplayName', headerName: 'Application Name', width: 300 },
                  { field: 'Publisher', headerName: 'Publisher', width: 200 },
                  { field: 'DisplayVersion', headerName: 'Version', width: 150 },
                  { field: 'InstallDate', headerName: 'Install Date', width: 120 },
                ] :
                activeTab === 'storage' ? [
                  { field: 'DeviceID', headerName: 'Drive', width: 100 },
                  { field: 'VolumeName', headerName: 'Volume Name', width: 150 },
                  { field: 'FileSystem', headerName: 'File System', width: 120 },
                  { field: 'SizeGB', headerName: 'Size (GB)', width: 120 },
                  { field: 'FreeSpaceGB', headerName: 'Free (GB)', width: 120 },
                ] :
                activeTab === 'routes' ? [
                  { field: 'Destination', headerName: 'Destination', width: 150 },
                  { field: 'Netmask', headerName: 'Netmask', width: 150 },
                  { field: 'Gateway', headerName: 'Gateway', width: 150 },
                  { field: 'Interface', headerName: 'Interface', width: 150 },
                  { field: 'Metric', headerName: 'Metric', width: 100 },
                ] : []
              }
              loading={isDetecting}
              enableColumnReorder
              enableColumnResize
            />
          </div>
        )}
      </div>

      {result && osData.length > 0 && (
        <div className="px-6 pb-6">
          <ViewDiscoveredDataButton
            moduleId="environment-detection"
            recordCount={
              osData.length +
              hardwareData.length +
              networkData.length +
              domainData.length +
              virtualizationData.length +
              cloudData.length +
              securityData.length +
              softwareData.length +
              applicationsData.length +
              storageData.length +
              routesData.length
            }
          />
        </div>
      )}

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDetecting && setShowExecutionDialog(false)}
        scriptName="Environment Detection"
        scriptDescription="Comprehensive local environment introspection: OS, hardware, network, security, software"
        logs={logs.map((msg, i) => ({ timestamp: new Date().toISOString(), level: 'info' as const, message: msg }))}
        isRunning={isDetecting}
        isCancelling={isCancelling}
        progress={{
          percentage: progress.percentage || 0,
          message: progress.message || ''
        }}
        onStop={cancelDetection}
      />
    </div>
  );
};

// Discovery Success Card - MANDATORY first statistics card
const DiscoverySuccessCard: React.FC<{ percentage: number; received: number; total: number }> = ({ percentage, received, total }) => {
  const getGradient = () => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-amber-600';
    if (percentage >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  return (
    <div className={`bg-gradient-to-br ${getGradient()} text-white rounded-lg shadow-sm p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium opacity-90 mb-1">Discovery Success</div>
          <div className="text-4xl font-bold">{percentage}%</div>
          <div className="text-xs opacity-80 mt-2">{received} of {total} data sources</div>
        </div>
        <Shield className="w-8 h-8 opacity-80" />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; value: number | string; label: string; gradient: string }> = ({ icon, value, label, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} text-white rounded-lg shadow-sm p-6`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="text-sm font-medium opacity-90 mb-1">{label}</div>
        <div className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
  </div>
);

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; count?: number }> = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 ${
      active ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-600 hover:text-gray-900'
    }`}
  >
    {label}
    {count !== undefined && (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200'}`}>
        {count}
      </span>
    )}
  </button>
);

const OverviewTab: React.FC<{ statistics: any }> = ({ statistics }) => (
  <div className="h-full overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
    <h2 className="text-lg font-semibold mb-6">Environment Detection Summary</h2>

    <div className="grid grid-cols-2 gap-6">
      {/* System Information */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-sky-600" />
          System Information
        </h3>
        <div className="space-y-3">
          <InfoRow label="Operating System" value={statistics.osName} />
          <InfoRow label="OS Version" value={statistics.osVersion} />
          <InfoRow label="Build Number" value={statistics.osBuild} />
          <InfoRow label="Computer Name" value={statistics.computerName} />
          <InfoRow label="Memory" value={`${statistics.totalPhysicalMemoryGB} GB (${statistics.osMemoryUsagePercent}% used)`} />
        </div>
      </div>

      {/* Hardware Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-600" />
          Hardware Summary
        </h3>
        <div className="space-y-3">
          <InfoRow label="Manufacturer" value={statistics.hardwareManufacturer} />
          <InfoRow label="Model" value={statistics.hardwareModel} />
          <InfoRow label="Processor" value={statistics.processorName.substring(0, 35)} />
          <InfoRow label="Cores" value={`${statistics.processorCores} cores, ${statistics.processorLogicalProcessors} logical`} />
          <InfoRow label="Total Memory" value={`${statistics.totalPhysicalMemoryGB} GB`} />
        </div>
      </div>

      {/* Network Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-purple-600" />
          Network Summary
        </h3>
        <div className="space-y-3">
          <InfoRow label="Network Adapters" value={statistics.networkAdapterCount} />
          <InfoRow label="Active Adapters" value={statistics.activeAdapters} />
          <InfoRow label="Total Link Speed" value={`${statistics.totalLinkSpeedGbps.toFixed(1)} Gbps`} />
          <InfoRow label="Domain" value={statistics.domainName} />
          <InfoRow label="Domain Status" value={statistics.isDomainJoined ? 'Joined' : 'Workgroup'} />
        </div>
      </div>

      {/* Environment & Security */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-600" />
          Environment & Security
        </h3>
        <div className="space-y-3">
          <InfoRow label="Environment" value={statistics.virtualizationType} />
          <InfoRow label="Cloud Provider" value={statistics.cloudProvider} />
          <InfoRow label="Windows Defender" value={statistics.windowsDefenderStatus} />
          <InfoRow label="Firewall" value={statistics.firewallEnabled ? 'Enabled' : 'Disabled'} />
          <InfoRow label="UAC" value={statistics.uacEnabled ? 'Enabled' : 'Disabled'} />
        </div>
      </div>
    </div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-medium text-gray-900 dark:text-white">{value}</span>
  </div>
);

export default EnvironmentDetectionView;


