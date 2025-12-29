import { FC } from 'react';
import { Package, Play, AlertCircle, CheckCircle2, Lock, Globe } from 'lucide-react';

import { useAzureACRDiscoveryLogic } from '../../hooks/useAzureACRDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

/**
 * Azure Container Registry Discovery View
 * Part of AzureHound-inspired enhancements
 */
const AzureACRDiscoveryView: FC = () => {
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
  } = useAzureACRDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="azure-acr-discovery-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Container Registry Discovery</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Discover Azure Container Registries across subscriptions</p>
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
        <div className="px-6 py-4 bg-purple-50 dark:bg-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-purple-700 dark:text-purple-300 font-medium">
                  {progress.message || 'Discovery in progress...'}
                </span>
                <span className="text-purple-600 dark:text-purple-400">{Math.round(progress.percentage)}%</span>
              </div>
              <div className="w-full h-2 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 dark:bg-purple-400 transition-all duration-300"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={<Package className="w-6 h-6" />}
                label="Total Registries"
                value={result.totalCount || 0}
                variant="default"
              />
              <StatCard
                icon={<Lock className="w-6 h-6" />}
                label="Admin Enabled"
                value={result.containerRegistries?.filter((r: any) => r.AdminUserEnabled).length || 0}
                variant="warning"
              />
              <StatCard
                icon={<Globe className="w-6 h-6" />}
                label="Public Access"
                value={result.containerRegistries?.filter((r: any) => r.PublicNetworkAccess === 'Enabled').length || 0}
                variant="default"
              />
            </div>

            {/* Registries List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Discovered Container Registries</h3>
              <div className="space-y-2">
                {result.containerRegistries?.slice(0, 10).map((acr: any, index: number) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{acr.Name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{acr.LoginServer}</span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${acr.Sku === 'Premium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : acr.Sku === 'Standard' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {acr.Sku}
                      </span>
                      {acr.AdminUserEnabled && (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !isDiscovering && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Container Registry Discovery Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Start Discovery" to scan your Azure Container Registries
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
        scriptName="Container Registry Discovery"
        scriptDescription="Discovering Azure Container Registries with SKU and access settings"
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

export default AzureACRDiscoveryView;
