import { FC } from 'react';
import { Server, Play, AlertCircle, CheckCircle2, HardDrive } from 'lucide-react';

import { useVirtualizationDiscoveryLogic } from '../../hooks/useVirtualizationDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import { ViewDiscoveredDataButton } from '../../components/molecules/ViewDiscoveredDataButton';

/**
 * Virtualization Discovery View Component
 * Provides UI for discovering virtualization infrastructure (Hyper-V, VMware, etc.)
 */
const VirtualizationDiscoveryView: FC = () => {
  const {
    config,
    result,
    isDiscovering,
    isCancelling,
    progress,
    error,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearError,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
  } = useVirtualizationDiscoveryLogic();

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="virtualization-discovery-view" data-cy="virtualization-discovery-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Server className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Virtualization Discovery</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Discover virtualization infrastructure including hosts, VMs, and resources</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={startDiscovery}
            disabled={isDiscovering}
            variant="primary"
            icon={<Play />}
            data-cy="start-discovery-btn" data-testid="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Configuration Badges */}
      <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <ConfigBadge label="Hosts" value={config.includeHosts} />
          <ConfigBadge label="Virtual Machines" value={config.includeVMs} />
          <ConfigBadge label="Datastores" value={config.includeDatastores} />
          <ConfigBadge label="Networks" value={config.includeNetworks} />
          <ConfigBadge label="Resource Pools" value={config.includeResourcePools} />
          <ConfigBadge label="Clusters" value={config.includeClusters} />
        </div>
      </div>

      {/* Progress Bar */}
      {isDiscovering && (
        <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  {progress.message || 'Discovery in progress...'}
                </span>
                <span className="text-blue-600 dark:text-blue-400">{Math.round(progress.percentage)}%</span>
              </div>
              <div className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
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
          <Button variant="ghost" size="sm" onClick={clearError}>Dismiss</Button>
        </div>
      )}

      {/* Results Section */}
      {result && (result.totalHosts || result.totalVMs || result.statistics) && (
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Server className="w-6 h-6" />}
                label="Total Hosts"
                value={result.totalHosts || 0}
                variant="default"
              />
              <StatCard
                icon={<CheckCircle2 className="w-6 h-6" />}
                label="Virtual Machines"
                value={result.totalVMs || 0}
                subValue={`${result.statistics?.runningVMs || 0} running`}
                variant="default"
              />
              <StatCard
                icon={<HardDrive className="w-6 h-6" />}
                label="Total vCPUs"
                value={result.statistics?.totalCPUCores || 0}
                variant="default"
              />
              <StatCard
                icon={<HardDrive className="w-6 h-6" />}
                label="Total Memory"
                value={`${((result.statistics?.totalMemoryGB || 0) / 1024).toFixed(2)} TB`}
                variant="default"
              />
            </div>

            {/* Discovery Summary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Discovery Summary</h3>
              <div className="space-y-2">
                <SummaryRow label="Total Items" value={(result.hosts?.length || 0) + (result.virtualMachines?.length || 0)} />
                <SummaryRow label="Hosts Discovered" value={result.hosts?.length || 0} />
                <SummaryRow label="VMs Discovered" value={result.virtualMachines?.length || 0} />
                <SummaryRow label="Average VMs per Host" value={(result.statistics?.averageVMsPerHost || 0).toFixed(1)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !isDiscovering && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Server className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Virtualization Discovery Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Start Discovery" to scan your virtualization infrastructure
            </p>
            <Button
              variant="primary"
              icon={<Play />}
              onClick={startDiscovery}
            >
              Start Discovery
            </Button>
          </div>
        </div>
      )}

      <div className="px-6 pb-6">
        <ViewDiscoveredDataButton
          moduleId="virtualization"
          recordCount={result?.totalVMs || 0}
          disabled={!result || (result?.totalVMs || 0) === 0}
        />
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Virtualization Discovery"
        scriptDescription="Discovering virtualization infrastructure including Hyper-V hosts, VMs, and resources"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? { percentage: progress.percentage || 0, message: progress.message || 'Processing...' } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

/**
 * Configuration Badge Component
 */
const ConfigBadge: FC<{ label: string; value: boolean | string | number }> = ({ label, value }) => (
  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
    <span className="text-blue-500 dark:text-blue-400">{typeof value === 'boolean' ? (value ? 'Y' : 'N') : ''}</span>
    <span>{label}:</span>
    <span className="font-semibold">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
  </div>
);

/**
 * Statistics Card Component
 */
const StatCard: FC<{
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

/**
 * Summary Row Component
 */
const SummaryRow: FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
  </div>
);

export default VirtualizationDiscoveryView;
