import { FC } from 'react';
import { KeyRound, Play, AlertCircle, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

import { useAzureServicePrincipalCredentialsDiscoveryLogic } from '../../hooks/useAzureServicePrincipalCredentialsDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

/**
 * Azure Service Principal Credentials Discovery View
 * Part of AzureHound-inspired enhancements Phase 5
 */
const AzureServicePrincipalCredentialsDiscoveryView: FC = () => {
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
  } = useAzureServicePrincipalCredentialsDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="azure-sp-credentials-discovery-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <KeyRound className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Principal Credentials Discovery</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Discover app registration secrets and certificates with expiry tracking</p>
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
        <div className="px-6 py-4 bg-orange-50 dark:bg-orange-900/10">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-orange-700 dark:text-orange-300 font-medium">
                  {progress.message || 'Discovery in progress...'}
                </span>
                <span className="text-orange-600 dark:text-orange-400">{Math.round(progress.percentage)}%</span>
              </div>
              <div className="w-full h-2 bg-orange-200 dark:bg-orange-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-600 dark:bg-orange-400 transition-all duration-300"
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
                icon={<KeyRound className="w-6 h-6" />}
                label="Total Credentials"
                value={result.totalCount || 0}
                variant="default"
              />
              <StatCard
                icon={<AlertTriangle className="w-6 h-6" />}
                label="Expired"
                value={result.credentials?.filter((c: any) => c.IsExpired).length || 0}
                variant="danger"
              />
              <StatCard
                icon={<Clock className="w-6 h-6" />}
                label="Expiring Soon"
                value={result.credentials?.filter((c: any) => c.IsExpiringSoon).length || 0}
                variant="warning"
              />
              <StatCard
                icon={<CheckCircle className="w-6 h-6" />}
                label="Valid"
                value={result.credentials?.filter((c: any) => !c.IsExpired && !c.IsExpiringSoon).length || 0}
                variant="success"
              />
            </div>

            {/* Credentials List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Service Principal Credentials</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Application</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Type</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Expiry</th>
                      <th className="text-center py-2 px-3 text-gray-600 dark:text-gray-400">Days Left</th>
                      <th className="text-center py-2 px-3 text-gray-600 dark:text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.credentials?.slice(0, 15).map((cred: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                        <td className="py-2 px-3 font-medium text-gray-900 dark:text-gray-100">{cred.ApplicationName}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            cred.CredentialType === 'Secret'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {cred.CredentialType}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400">
                          {cred.EndDateTime ? new Date(cred.EndDateTime).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`font-medium ${
                            cred.IsExpired ? 'text-red-600 dark:text-red-400' :
                            cred.IsExpiringSoon ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {cred.IsExpired ? 'Expired' : cred.DaysUntilExpiry || '-'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {cred.IsExpired ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Expired</span>
                          ) : cred.IsExpiringSoon ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Expiring</span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Valid</span>
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
            <KeyRound className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Service Principal Credentials Discovery Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Start Discovery" to scan app registration secrets and certificates
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
        scriptName="Service Principal Credentials Discovery"
        scriptDescription="Discovering app registration secrets and certificates with expiry tracking"
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

export default AzureServicePrincipalCredentialsDiscoveryView;
