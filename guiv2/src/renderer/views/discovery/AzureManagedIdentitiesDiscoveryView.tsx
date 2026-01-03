import { FC } from 'react';
import { Fingerprint, Play, AlertCircle, User, Server, Globe } from 'lucide-react';

import { useAzureManagedIdentitiesDiscoveryLogic } from '../../hooks/useAzureManagedIdentitiesDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import { ViewDiscoveredDataButton } from '../../components/molecules/ViewDiscoveredDataButton';

/**
 * Azure Managed Identities Discovery View
 * Part of AzureHound-inspired enhancements Phase 4
 */
const AzureManagedIdentitiesDiscoveryView: FC = () => {
  const {
    config,
    result,
    isDiscovering,
    isCancelling,
    progress,
    error,
    startDiscovery,
    cancelDiscovery,
    clearError,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
  } = useAzureManagedIdentitiesDiscoveryLogic();

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="azure-managed-identities-discovery-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Fingerprint className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Managed Identities Discovery</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Discover Azure Managed Identities and their role assignments</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={startDiscovery}
            disabled={isDiscovering}
            variant="primary"
            icon={<Play />}
            data-testid="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isDiscovering && (
        <div className="px-6 py-4 bg-teal-50 dark:bg-teal-900/10">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-teal-700 dark:text-teal-300 font-medium">
                  {progress.message || 'Discovery in progress...'}
                </span>
                <span className="text-teal-600 dark:text-teal-400">{Math.round(progress.percentage)}%</span>
              </div>
              <div className="w-full h-2 bg-teal-200 dark:bg-teal-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 dark:bg-teal-400 transition-all duration-300"
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
      {result && result.totalCount > 0 && (
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Fingerprint className="w-6 h-6" />}
                label="Managed Identities"
                value={result.totalCount || 0}
                variant="default"
              />
              <StatCard
                icon={<User className="w-6 h-6" />}
                label="User-Assigned"
                value={result.managedIdentities?.filter((mi: any) => mi.Type === 'UserAssigned').length || 0}
                variant="default"
              />
              <StatCard
                icon={<Server className="w-6 h-6" />}
                label="System-Assigned"
                value={result.managedIdentities?.filter((mi: any) => mi.Type === 'SystemAssigned').length || 0}
                variant="default"
              />
              <StatCard
                icon={<Globe className="w-6 h-6" />}
                label="With Role Assignments"
                value={result.managedIdentities?.filter((mi: any) => mi.RoleAssignmentCount > 0).length || 0}
                variant="success"
              />
            </div>

            {/* Managed Identities List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Discovered Managed Identities</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Name</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Resource Type</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Location</th>
                      <th className="text-center py-2 px-3 text-gray-600 dark:text-gray-400">Role Assignments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.managedIdentities?.slice(0, 15).map((mi: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                        <td className="py-2 px-3 font-medium text-gray-900 dark:text-gray-100">{mi.Name}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            mi.Type === 'UserAssigned'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          }`}>
                            {mi.Type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{mi.ResourceType || '-'}</td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{mi.Location}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`font-medium ${
                            mi.RoleAssignmentCount > 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-400'
                          }`}>
                            {mi.RoleAssignmentCount || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !isDiscovering && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Fingerprint className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Managed Identities Discovery Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Start Discovery" to scan Azure Managed Identities
            </p>
            <Button variant="primary" icon={<Play />} onClick={startDiscovery}>
              Start Discovery
            </Button>
          </div>
        </div>
      )}

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Managed Identities Discovery"
        scriptDescription="Discovering Azure Managed Identities and their role assignments"
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

const StatCard: FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}> = ({ icon, label, value, variant = 'default' }) => {
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
      </div>
    </div>
  );
};

export default AzureManagedIdentitiesDiscoveryView;
