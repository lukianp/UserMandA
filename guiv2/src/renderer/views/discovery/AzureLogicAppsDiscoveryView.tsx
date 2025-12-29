import { FC } from 'react';
import { Workflow, Play, AlertCircle, CheckCircle2, Zap, Activity, Timer } from 'lucide-react';

import { useAzureLogicAppsDiscoveryLogic } from '../../hooks/useAzureLogicAppsDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

/**
 * Azure Logic Apps Discovery View
 * Part of AzureHound-inspired enhancements Phase 2
 */
const AzureLogicAppsDiscoveryView: FC = () => {
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
  } = useAzureLogicAppsDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="azure-logicapps-discovery-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Workflow className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Logic Apps Discovery</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Discover Azure Logic Apps, triggers, and workflow runs</p>
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
      {result && result.totalCount > 0 && (
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Workflow className="w-6 h-6" />}
                label="Logic Apps"
                value={result.totalCount || 0}
                variant="default"
              />
              <StatCard
                icon={<Zap className="w-6 h-6" />}
                label="Total Triggers"
                value={result.logicApps?.reduce((sum: number, la: any) => sum + (la.TriggerCount || 0), 0) || 0}
                variant="default"
              />
              <StatCard
                icon={<Activity className="w-6 h-6" />}
                label="Enabled Apps"
                value={result.logicApps?.filter((la: any) => la.State === 'Enabled').length || 0}
                variant="success"
              />
              <StatCard
                icon={<Timer className="w-6 h-6" />}
                label="Recent Runs"
                value={result.logicApps?.reduce((sum: number, la: any) => sum + (la.RecentRunCount || 0), 0) || 0}
                variant="default"
              />
            </div>

            {/* Logic Apps List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Discovered Logic Apps</h3>
              <div className="space-y-2">
                {result.logicApps?.slice(0, 10).map((la: any, index: number) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{la.Name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({la.ResourceGroupName})</span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        la.State === 'Enabled'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {la.State}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {la.TriggerCount} triggers | {la.RecentRunCount} runs
                      </span>
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
            <Workflow className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Logic Apps Discovery Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click "Start Discovery" to scan your Azure Logic Apps
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
        scriptName="Logic Apps Discovery"
        scriptDescription="Discovering Azure Logic Apps with triggers, run history, and workflow state"
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

export default AzureLogicAppsDiscoveryView;
