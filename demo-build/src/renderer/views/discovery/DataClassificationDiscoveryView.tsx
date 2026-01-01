/**
 * Data Classification Discovery View
 * UI for discovering and classifying sensitive data across the organization
 */

import React, { useState } from 'react';
import { Shield, Play, Square, Download, AlertTriangle, Info, FileSearch } from 'lucide-react';

import { useDataClassificationDiscoveryLogic } from '../../hooks/useDataClassificationDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import Checkbox from '../../components/atoms/Checkbox';
import { Input } from '../../components/atoms/Input';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const DataClassificationDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    progress,
    error,
    logs,
    showExecutionDialog,
    isCancelling,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    clearLogs,
    setShowExecutionDialog,
  } = useDataClassificationDiscoveryLogic();

  const [showConfig, setShowConfig] = useState(true);

  return (
    <div
      className="h-full flex flex-col bg-gray-50 dark:bg-gray-900"
      data-testid="data-classification-discovery-view"
      data-cy="data-classification-discovery-view"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Data Classification Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover and classify sensitive data to ensure compliance and protect confidential information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showConfig ? 'secondary' : 'ghost'}
              onClick={() => setShowConfig(!showConfig)}
              data-cy="toggle-config-btn"
            >
              {showConfig ? 'Hide' : 'Show'} Configuration
            </Button>
            {!isDiscovering ? (
              <Button
                variant="primary"
                icon={<Play className="w-4 h-4" />}
                onClick={startDiscovery}
                data-cy="start-discovery-btn"
              >
                Start Discovery
              </Button>
            ) : (
              <Button
                variant="danger"
                icon={<Square className="w-4 h-4" />}
                onClick={cancelDiscovery}
                disabled={isCancelling}
                data-cy="cancel-discovery-btn"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Configuration
            </h2>
            <div className="space-y-6">
              {/* Classification Types */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Classification Types
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={config?.includeSensitiveData ?? true}
                      onChange={(checked) => updateConfig({ includeSensitiveData: checked })}
                      disabled={isDiscovering}
                    />
                    <span className="text-gray-700 dark:text-gray-300">Sensitive Data</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={config?.includePII ?? true}
                      onChange={(checked) => updateConfig({ includePII: checked })}
                      disabled={isDiscovering}
                    />
                    <span className="text-gray-700 dark:text-gray-300">PII (Personal Identifiable Information)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={config?.includePHI ?? true}
                      onChange={(checked) => updateConfig({ includePHI: checked })}
                      disabled={isDiscovering}
                    />
                    <span className="text-gray-700 dark:text-gray-300">PHI (Protected Health Information)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={config?.includePCI ?? true}
                      onChange={(checked) => updateConfig({ includePCI: checked })}
                      disabled={isDiscovering}
                    />
                    <span className="text-gray-700 dark:text-gray-300">PCI (Payment Card Information)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={config?.includeConfidentialData ?? true}
                      onChange={(checked) => updateConfig({ includeConfidentialData: checked })}
                      disabled={isDiscovering}
                    />
                    <span className="text-gray-700 dark:text-gray-300">Confidential Data</span>
                  </label>
                </div>
              </div>

              {/* Scan Settings */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Scan Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Max Files to Scan
                    </label>
                    <Input
                      type="number"
                      value={config?.maxFilesToScan ?? 10000}
                      onChange={(e) => updateConfig({ maxFilesToScan: parseInt(e.target.value) || 10000 })}
                      disabled={isDiscovering}
                      min="100"
                      max="100000"
                      step="1000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Discovery Error</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Files Scanned</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {result.totalFilesScanned ?? 0}
                      </p>
                    </div>
                    <FileSearch className="w-10 h-10 text-blue-500" />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sensitive Files</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {result.totalSensitiveFiles ?? 0}
                      </p>
                    </div>
                    <Shield className="w-10 h-10 text-orange-500" />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">PII Matches</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {result.totalPIIMatches ?? 0}
                      </p>
                    </div>
                    <AlertTriangle className="w-10 h-10 text-yellow-500" />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">PHI Matches</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {result.totalPHIMatches ?? 0}
                      </p>
                    </div>
                    <Shield className="w-10 h-10 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Output Path */}
              {result.outputPath && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-800 dark:text-blue-200">Results Saved</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-mono break-all">
                        {result.outputPath}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!result && !isDiscovering && (
            <div className="text-center py-12">
              <Shield className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Discovery Results
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Configure your settings and click "Start Discovery" to begin classifying sensitive data
              </p>
              <Button
                variant="primary"
                icon={<Play className="w-4 h-4" />}
                onClick={startDiscovery}
              >
                Start Discovery
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Data Classification Discovery"
        scriptDescription="Discovering and classifying sensitive data"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.percentage || 0,
          message: progress.message || ''
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />

      {/* Loading Overlay */}
      {isDiscovering && <LoadingOverlay message={progress?.message || 'Discovering and classifying data...'} />}
    </div>
  );
};

export default DataClassificationDiscoveryView;


