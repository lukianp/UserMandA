import { FC } from 'react';
import { Key, Play, AlertCircle, Lock, Unlock, Shield } from 'lucide-react';

import { useAzureKeyVaultAccessDiscoveryLogic } from '../../hooks/useAzureKeyVaultAccessDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import { ViewDiscoveredDataButton } from '../../components/molecules/ViewDiscoveredDataButton';

/**
 * Azure Key Vault Access Discovery View
 * Part of AzureHound-inspired enhancements Phase 4
 */
const AzureKeyVaultAccessDiscoveryView: FC = () => {
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
  } = useAzureKeyVaultAccessDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="azure-keyvault-access-discovery-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Key className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Key Vault Access Discovery</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Discover Azure Key Vault access policies and permissions</p>
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
        <div className="px-6 py-4 bg-amber-50 dark:bg-amber-900/10">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-amber-700 dark:text-amber-300 font-medium">
                  {progress.message || 'Discovery in progress...'}
                </span>
                <span className="text-amber-600 dark:text-amber-400">{Math.round(progress.percentage)}%</span>
              </div>
              <div className="w-full h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 dark:bg-amber-400 transition-all duration-300"
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
                icon={<Key className="w-6 h-6" />}
                label="Access Policies"
                value={result.totalCount || 0}
                variant="default"
              />
              <StatCard
                icon={<Lock className="w-6 h-6" />}
                label="Secrets Access"
                value={result.accessPolicies?.filter((p: any) => p.HasSecretsAccess).length || 0}
                variant="default"
              />
              <StatCard
                icon={<Shield className="w-6 h-6" />}
                label="Keys Access"
                value={result.accessPolicies?.filter((p: any) => p.HasKeysAccess).length || 0}
                variant="default"
              />
              <StatCard
                icon={<Unlock className="w-6 h-6" />}
                label="Full Access"
                value={result.accessPolicies?.filter((p: any) => p.HasFullAccess).length || 0}
                variant="danger"
              />
            </div>

            {/* Access Policies List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Key Vault Access Policies</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Key Vault</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Principal</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-center py-2 px-3 text-gray-600 dark:text-gray-400">Secrets</th>
                      <th className="text-center py-2 px-3 text-gray-600 dark:text-gray-400">Keys</th>
                      <th className="text-center py-2 px-3 text-gray-600 dark:text-gray-400">Certs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.accessPolicies?.slice(0, 15).map((policy: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                        <td className="py-2 px-3 font-medium text-gray-900 dark:text-gray-100">{policy.KeyVaultName}</td>
                        <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{policy.PrincipalName || policy.ObjectId}</td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{policy.PrincipalType}</td>
                        <td className="py-2 px-3 text-center">
                          {policy.HasSecretsAccess ? (
                            <span className="text-green-600 dark:text-green-400">Yes</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {policy.HasKeysAccess ? (
                            <span className="text-green-600 dark:text-green-400">Yes</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {policy.HasCertificatesAccess ? (
                            <span className="text-green-600 dark:text-green-400">Yes</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
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
            <Key className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Key Vault Access Discovery Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Start Discovery" to scan Key Vault access policies
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
        scriptName="Key Vault Access Discovery"
        scriptDescription="Discovering Azure Key Vault access policies and permissions"
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

export default AzureKeyVaultAccessDiscoveryView;
