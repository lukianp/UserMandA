/**
 * Power BI Discovery View
 * Basic UI for Power BI discovery
 */

import { useState } from 'react';
import { BarChart, ChevronUp, ChevronDown } from 'lucide-react';

import { usePowerBIDiscoveryLogic } from '../../hooks/usePowerBIDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const PowerBIDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    isCancelling,
    progress,
    error,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
    startDiscovery,
    cancelDiscovery
  } = usePowerBIDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="power-bi-discovery-view" data-testid="power-bi-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={progress.percentage}
          message={progress.message || 'Discovering Power BI resources...'}
          onCancel={cancelDiscovery}
          data-testid="loading-overlay"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <BarChart className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Power BI Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover Power BI workspaces, reports, and datasets
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={startDiscovery}
            disabled={isDiscovering}
            icon={isDiscovering ? undefined : undefined}
            data-testid="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          data-testid="toggle-config-btn"
        >
          <span className="font-medium">Discovery Configuration</span>
          {configExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {configExpanded && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="space-y-3">
              <Input
                label="Timeout (ms)"
                type="number"
                value={config.timeout?.toString() || '300000'}
                onChange={(e) => {
                  // Basic timeout update - simplified
                  console.log('Timeout changed:', e.target.value);
                }}
                min={60000}
                max={600000}
                data-testid="timeout-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={() => {}} variant="ghost" size="sm">Dismiss</Button>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 p-6">
        {result ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Discovery Results</h3>
            <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Power BI Data Available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Start a discovery to view Power BI resources.</p>
              <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
                {isDiscovering ? 'Discovering...' : 'Start Discovery'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Power BI Discovery"
        scriptDescription="Discovering Power BI workspaces, reports, and datasets"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.percentage || 0,
          message: progress.message || 'Processing...'
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default PowerBIDiscoveryView;
