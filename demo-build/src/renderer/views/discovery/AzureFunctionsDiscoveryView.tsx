import { FC } from 'react';
import { Zap, Play, AlertCircle, CheckCircle2, Code, Globe } from 'lucide-react';

import { useAzureFunctionsDiscoveryLogic } from '../../hooks/useAzureFunctionsDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import { ViewDiscoveredDataButton } from '../../components/molecules/ViewDiscoveredDataButton';

/**
 * Azure Functions Discovery View
 * Part of AzureHound-inspired enhancements
 */
const AzureFunctionsDiscoveryView: FC = () => {
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
  } = useAzureFunctionsDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="azure-functions-discovery-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Function Apps Discovery</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Discover Azure Function Apps across subscriptions</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={<Zap className="w-6 h-6" />}
                label="Total Function Apps"
                value={result.totalCount || 0}
                variant="default"
              />
              <StatCard
                icon={<CheckCircle2 className="w-6 h-6" />}
                label="Running"
                value={result.functionApps?.filter((f: any) => f.State === 'Running').length || 0}
                variant="success"
              />
              <StatCard
                icon={<Code className="w-6 h-6" />}
                label="Runtimes"
                value={new Set(result.functionApps?.map((f: any) => f.Runtime).filter(Boolean)).size || 0}
                variant="default"
              />
            </div>

            {/* Function Apps List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Discovered Function Apps</h3>
              <div className="space-y-2">
                {result.functionApps?.slice(0, 10).map((func: any, index: number) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{func.Name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({func.ResourceGroupName})</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm px-2 py-0.5 rounded ${func.State === 'Running' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {func.State}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{func.Runtime}</span>
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
            <Zap className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Function Apps Discovery Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Start Discovery" to scan your Azure Function Apps
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
        scriptName="Function Apps Discovery"
        scriptDescription="Discovering Azure Function Apps with runtime and hosting configuration"
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

export default AzureFunctionsDiscoveryView;
