import React from "react";
import { Play, Square, Cloud } from 'lucide-react';

import { useProfileStore } from "../../store/useProfileStore";
import { useAzureResourceDiscoveryLogic } from "../../hooks/useAzureResourceDiscoveryLogic";
import { Button } from "../../components/atoms/Button";
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

export default function AzureResourceDiscoveryView(){
  const { selectedSourceProfile } = useProfileStore();
  const {
    isRunning,
    isCancelling,
    progress,
    results,
    error,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    startDiscovery,
    cancelDiscovery,
    clearLogs,
  } = useAzureResourceDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="azure-resource-discovery-view" data-cy="azure-resource-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Azure Resource Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover Azure cloud resources including VMs, storage accounts, and network resources
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button
                variant="primary"
                icon={<Play />}
                onClick={startDiscovery}
                disabled={!selectedSourceProfile}
                data-cy="start-discovery-btn"
                data-testid="start-discovery-btn"
              >
                Start Discovery
              </Button>
            ) : (
              <Button
                variant="danger"
                icon={<Square />}
                onClick={cancelDiscovery}
                data-cy="cancel-discovery-btn"
                data-testid="cancel-discovery-btn"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Discovery Results</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {results.success ? 'Success' : 'Failed'}
                </span>
              </div>
              {results.data?.summary && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Resources:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {results.data.summary.totalResources ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Resource Types:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {results.data.summary.resourceTypes ?? 0}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!results && !isRunning && !error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Cloud className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Discovery Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Click "Start Discovery" to begin discovering Azure resources.
            </p>
            <Button
              variant="primary"
              icon={<Play />}
              onClick={startDiscovery}
              disabled={!selectedSourceProfile}
            >
              Start Discovery
            </Button>
          </div>
        </div>
      )}

      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isRunning && setShowExecutionDialog(false)}
        scriptName="Azure Resource Discovery"
        scriptDescription="Discovering Azure cloud resources"
        logs={logs.map(log => ({
          timestamp: log.timestamp,
          message: log.message,
          level: log.level as 'info' | 'success' | 'warning' | 'error'
        }))}
        isRunning={isRunning}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.percentage || 0,
          message: progress.message || progress.currentPhase || ''
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
}
