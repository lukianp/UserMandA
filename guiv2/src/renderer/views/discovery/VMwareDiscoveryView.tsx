import { FC } from 'react';
import { Server, Play, Download, FileText, AlertCircle, CheckCircle2, HardDrive } from 'lucide-react';

import { useVMwareDiscoveryLogic } from '../../hooks/useVMwareDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import { ViewDiscoveredDataButton } from '../../components/molecules/ViewDiscoveredDataButton';
import type { VMwareDiscoveryResult } from '../../types/models/vmware';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const ConfigBadge: React.FC<{ label: string; value: boolean | string | number }> = ({ label, value }) => (
  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-md text-xs font-medium">
    <span className="text-violet-500 dark:text-violet-400">•</span>
    <span>{label}:</span>
    <span className="font-semibold">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
  </div>
);

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}> = ({ icon, label, value, subValue, variant = 'default' }) => {
  const colors = {
    default: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    success: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg ${colors[variant]}`}>
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm opacity-80">{label}</div>
        {subValue && <div className="text-xs opacity-60 mt-0.5">{subValue}</div>}
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
      active
        ? 'bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
    }`}
  >
    {children}
  </button>
);

const OverviewTab: React.FC<{ data: VMwareDiscoveryResult }> = ({ data }) => {
  const SummaryRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Discovery Summary</h3>
        <div className="space-y-1">
          <SummaryRow label="Start Time" value={new Date(data.startTime as any).toLocaleString()} />
          <SummaryRow label="End Time" value={new Date(data.endTime as any).toLocaleString()} />
          <SummaryRow label="Duration" value={`${Math.round((new Date(data.endTime as any).getTime() - new Date(data.startTime as any).getTime()) / 60000)} minutes`} />
          <SummaryRow label="Status" value={data.status} />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Infrastructure Statistics</h3>
        <div className="space-y-1">
          <SummaryRow label="Total Hosts" value={data.hosts?.length || 0} />
          <SummaryRow label="Total VMs" value={data.vms?.length || 0} />
          <SummaryRow label="Clusters" value={data.clusters?.length || 0} />
          <SummaryRow label="Datastores" value={data.datastores?.length || 0} />
        </div>
      </div>
    </div>
  );
};

const VMwareDiscoveryView: React.FC = () => {
  const {
    config,
    setConfig,
    result,
    isLoading,
    isCancelling,
    progress,
    error,
    searchText,
    setSearchText,
    activeTab,
    setActiveTab,
    templates,
    handleStartDiscovery,
    cancelDiscovery,
    handleApplyTemplate,
    handleExport,
    filteredHosts,
    filteredVMs,
    filteredClusters,
    hostColumns,
    vmColumns,
    clusterColumns,
    stats,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
  } = useVMwareDiscoveryLogic();

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="vmware-discovery-view" data-testid="vmware-discovery-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Server className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">VMware Discovery</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Discover virtualized infrastructure to identify consolidation opportunities and plan hybrid cloud strategies</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value=""
            onChange={(value) => {
              const template = templates.find((t) => t.id === value);
              if (template) handleApplyTemplate(template);
            }}
            options={[
              { value: '', label: 'Select Template...' },
              ...templates.map((template) => ({ value: template.id, label: template.name }))
            ]}
            data-cy="template-select" data-testid="template-select"
          />
          <Button
            onClick={handleStartDiscovery}
            disabled={isLoading}
            variant="primary"
            icon={<Play />}
            data-cy="start-discovery-btn" data-testid="start-discovery-btn"
          >
            {isLoading ? 'Discovering...' : 'Start Discovery'}
          </Button>
          {result && (
            <Button onClick={handleExport} icon={<Download />} data-cy="export-results-btn" data-testid="export-results-btn">
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <ConfigBadge label="Hosts" value={config.includeHosts} />
          <ConfigBadge label="Virtual Machines" value={config.includeVMs} />
          <ConfigBadge label="Clusters" value={config.includeClusters} />
          <ConfigBadge label="Datastores" value={config.includeDatastores} />
          <ConfigBadge label="Snapshots" value={config.includeSnapshots} />
          <ConfigBadge label="Networks" value={config.includeNetworking} />
        </div>
      </div>

      {/* Progress Bar */}
      {isLoading && (
        <div className="px-6 py-4 bg-violet-50 dark:bg-violet-900/10">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-violet-700 dark:text-violet-300 font-medium">Discovery in progress...</span>
                <span className="text-violet-600 dark:text-violet-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-violet-200 dark:bg-violet-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-600 dark:bg-violet-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-100">Discovery Failed</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && stats && (
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Server />}
                label="Total Hosts"
                value={stats?.totalHosts ?? 0}
                variant="default"
              />
              <StatCard
                icon={<CheckCircle2 />}
                label="Virtual Machines"
                value={stats?.totalVMs ?? 0}
                subValue={`${stats?.poweredOnVMs ?? 0} powered on`}
                variant="default"
              />
              <StatCard
                icon={<FileText />}
                label="Clusters"
                value={stats?.totalClusters ?? 0}
                variant="default"
              />
              <StatCard
                icon={<HardDrive />}
                label="Storage"
                value={`${typeof stats?.totalStorageTB === 'number' ? stats.totalStorageTB.toFixed(2) : '0'} TB`}
                subValue={`${typeof stats?.usedStorageTB === 'number' ? stats.usedStorageTB.toFixed(2) : '0'} TB used`}
                variant={(stats?.usedStorageTB ?? 0) / (stats?.totalStorageTB ?? 0) > 0.9 ? 'warning' : 'default'}
              />
            </div>

            {/* Tabs */}
            <div>
              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                  Overview
                </TabButton>
                <TabButton active={activeTab === 'hosts'} onClick={() => setActiveTab('hosts')}>
                  Hosts ({filteredHosts?.length || 0})
                </TabButton>
                <TabButton active={activeTab === 'vms'} onClick={() => setActiveTab('vms')}>
                  Virtual Machines ({filteredVMs?.length || 0})
                </TabButton>
                <TabButton active={activeTab === 'clusters'} onClick={() => setActiveTab('clusters')}>
                  Clusters ({filteredClusters?.length || 0})
                </TabButton>
              </div>

              <div className="mt-4">
                {activeTab === 'overview' && <OverviewTab data={result} />}

                {activeTab !== 'overview' && (
                  <>
                    {/* Search Bar */}
                    <div className="mb-4 flex gap-2">
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="flex-1"
                        data-cy="search-input" data-testid="search-input"
                      />
                    </div>

                    {/* Data Grid */}
                    <div className="h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      {activeTab === 'hosts' && (
                        <VirtualizedDataGrid
                          data={filteredHosts}
                          columns={hostColumns}
                          loading={isLoading}
                          enableExport
                          data-cy="vmware-hosts-grid" data-testid="vmware-hosts-grid"
                        />
                      )}
                      {activeTab === 'vms' && (
                        <VirtualizedDataGrid
                          data={filteredVMs}
                          columns={vmColumns}
                          loading={isLoading}
                          enableExport
                          data-cy="vmware-vms-grid" data-testid="vmware-vms-grid"
                        />
                      )}
                      {activeTab === 'clusters' && (
                        <VirtualizedDataGrid
                          data={filteredClusters}
                          columns={clusterColumns}
                          loading={isLoading}
                          enableExport
                          data-cy="vmware-clusters-grid" data-testid="vmware-clusters-grid"
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Server className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No VMware Discovery Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Start Discovery" to scan your VMware infrastructure
            </p>
          </div>
        </div>
      )}

      <div className="px-6 pb-6">
        <ViewDiscoveredDataButton
          moduleId="vmware"
          recordCount={stats?.totalVMs || 0}
          disabled={!result || (filteredVMs?.length || 0) === 0}
        />
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isLoading && setShowExecutionDialog(false)}
        scriptName="VMware Discovery"
        scriptDescription="Discovering VMware vSphere infrastructure including hosts, VMs, clusters, and datastores"
        logs={logs}
        isRunning={isLoading}
        isCancelling={isCancelling}
        progress={progress ? { percentage: progress, message: 'Discovery in progress...' } : undefined}
        onStart={handleStartDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default VMwareDiscoveryView;
