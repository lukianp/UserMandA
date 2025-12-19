/**
 * Entra ID & Microsoft 365 Discovery View
 *
 * Discovers identity, security, and collaboration services from Microsoft cloud:
 * - Entra ID (Azure AD): Users, Groups, Administrative Units, Guest Accounts
 * - Security: Conditional Access Policies, Directory Roles, App Registrations
 * - Microsoft 365: Exchange Online, SharePoint Online, Microsoft Teams
 * - Devices: Entra ID Joined, Hybrid Joined, Intune Managed
 */

import React from 'react';
import { Play, Square, RefreshCw, Download, Trash2, Cloud, CheckCircle } from 'lucide-react';

import { useAzureDiscoveryLogic } from '../../hooks/useAzureDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import StatusIndicator from '../../components/atoms/StatusIndicator';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const AzureDiscoveryView: React.FC = () => {
  const {
    formData,
    updateFormField,
    resetForm,
    isFormValid,
    isRunning,
    isCancelling,
    progress,
    results,
    error,
    logs,
    connectionStatus,
    testConnection,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    selectedProfile,
    showExecutionDialog,
    setShowExecutionDialog,
  } = useAzureDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="azure-discovery-view" data-testid="azure-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg">
              <Cloud size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Entra ID & Microsoft 365 Discovery
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Discover users, groups, security policies, and M365 services (Exchange, SharePoint, Teams) for identity consolidation and tenant migration planning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {selectedProfile && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Profile: <span className="font-semibold">{selectedProfile.name}</span>
              </div>
            )}
            <StatusIndicator
              status={connectionStatus === 'connected' ? 'success' : connectionStatus === 'error' ? 'error' : 'warning'}
              text={
                connectionStatus === 'connected' ? 'Connected' :
                connectionStatus === 'connecting' ? 'Connecting...' :
                connectionStatus === 'error' ? 'Connection Error' :
                'Not Connected'
              }
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Configuration
              </h2>

              {/* Show profile info */}
              {selectedProfile && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Profile:</span> {selectedProfile.name}
                  </p>
                  {selectedProfile.tenantId && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-semibold">Tenant:</span> {selectedProfile.tenantId}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Using credentials from company profile
                  </p>
                </div>
              )}

              <div className="space-y-4">

                {/* Advanced Settings */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Execution Options
                  </label>
                  <Checkbox
                    label="Use External Terminal (Advanced)"
                    checked={formData.showWindow}
                    onChange={(checked) => updateFormField('showWindow', checked)}
                    disabled={isRunning}
                    data-cy="show-window-checkbox" data-testid="show-window-checkbox"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                    Unchecked (default): Modern integrated dialog with controls. Checked: External DOS terminal window.
                  </p>
                </div>

                <Input
                  label="Max Results"
                  type="number"
                  value={formData.maxResults?.toString() ?? ''}
                  onChange={(e) => updateFormField('maxResults', parseInt(e.target.value) || 50000)}
                  disabled={isRunning}
                  min={1}
                  max={100000}
                  data-cy="max-results-input" data-testid="max-results-input"
                />

                <Input
                  label="Timeout (seconds)"
                  type="number"
                  value={formData.timeout?.toString() ?? ''}
                  onChange={(e) => updateFormField('timeout', parseInt(e.target.value) || 600)}
                  disabled={isRunning}
                  min={60}
                  max={3600}
                  helperText="Recommended: 600s (10 min) for large tenants"
                  data-cy="timeout-input" data-testid="timeout-input"
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                {!isRunning ? (
                  <>
                    <Button
                      variant="primary"
                      onClick={startDiscovery}
                      disabled={!isFormValid}
                      icon={<Play className="w-4 h-4" />}
                      className="w-full"
                      data-cy="start-discovery-btn" data-testid="start-discovery-btn"
                    >
                      Start Discovery
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={resetForm}
                      icon={<RefreshCw className="w-4 h-4" />}
                      className="w-full"
                      data-cy="reset-form-btn" data-testid="reset-form-btn"
                    >
                      Reset Form
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="danger"
                    onClick={cancelDiscovery}
                    disabled={isCancelling}
                    loading={isCancelling}
                    icon={<Square className="w-4 h-4" />}
                    className="w-full"
                    data-cy="cancel-discovery-btn" data-testid="cancel-discovery-btn"
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Discovery'}
                  </Button>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results and Logs Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            {progress && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Progress
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {progress.currentOperation}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {progress.overallProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.overallProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {progress.message}
                  </p>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {(Array.isArray(results) ? results.length : 0) > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Results
                  </h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={exportResults}
                    icon={<Download className="w-4 h-4" />}
                    data-cy="export-results-btn" data-testid="export-results-btn"
                  >
                    Export
                  </Button>
                </div>
                {(results ?? []).map((result) => (
                  <div key={result.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Items Discovered
                      </span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {result.itemCount}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>{result.summary}</p>
                      <p>Duration: {(result.duration / 1000).toFixed(2)}s</p>
                      {result.filePath && (
                        <p className="mt-2 font-mono text-xs break-all">
                          Output: {result.filePath}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Execution Log
                </h3>
                {(Array.isArray(logs) ? logs.length : 0) > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearLogs}
                    icon={<Trash2 className="w-4 h-4" />}
                    data-cy="clear-logs-btn" data-testid="clear-logs-btn"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div
                className="bg-gray-900 dark:bg-black rounded-md p-4 h-96 overflow-auto font-mono text-xs"
                data-cy="execution-log" data-testid="execution-log"
              >
                {(Array.isArray(logs) ? logs.length : 0) === 0 ? (
                  <p className="text-gray-500">No logs yet. Start discovery to see output.</p>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className={`mb-1 ${
                        log.level === 'error'
                          ? 'text-red-400'
                          : log.level === 'success'
                          ? 'text-green-400'
                          : log.level === 'warning'
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isRunning && setShowExecutionDialog(false)}
        scriptName="Azure Discovery"
        scriptDescription="Discovering users, groups, Teams, SharePoint, OneDrive, and Exchange Online"
        logs={logs}
        isRunning={isRunning}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.overallProgress,
          message: progress.message
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default AzureDiscoveryView;
