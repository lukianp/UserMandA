/**
 * Azure Discovery View
 * UI for Microsoft 365 / Azure AD discovery
 */

import React from 'react';
import { useAzureDiscoveryLogic } from '../../hooks/useAzureDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import StatusIndicator from '../../components/atoms/StatusIndicator';
import { Play, Square, RefreshCw, Download, Trash2, Cloud, CheckCircle } from 'lucide-react';

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
  } = useAzureDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="azure-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Azure / Microsoft 365 Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover users, groups, Teams, SharePoint, OneDrive, and Exchange Online
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
              label={
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

              <div className="space-y-4">
                {/* Tenant ID */}
                <Input
                  label="Tenant ID"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={formData.tenantId}
                  onChange={(value) => updateFormField('tenantId', value)}
                  disabled={isRunning}
                  required
                  helpText="Your Azure AD Tenant ID or domain name"
                  data-cy="tenant-id-input"
                />

                {/* Test Connection Button */}
                <Button
                  variant="secondary"
                  onClick={testConnection}
                  disabled={!formData.tenantId || connectionStatus === 'connecting'}
                  loading={connectionStatus === 'connecting'}
                  icon={<CheckCircle className="w-4 h-4" />}
                  className="w-full"
                  data-cy="test-connection-btn"
                >
                  Test Connection
                </Button>

                {/* Services to Discover */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Services to Discover
                  </label>

                  {/* Core Services */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Core Directory</p>
                    <Checkbox
                      label="Users"
                      checked={formData.includeUsers}
                      onChange={(checked) => updateFormField('includeUsers', checked)}
                      disabled={isRunning}
                      data-cy="include-users-checkbox"
                    />
                    <Checkbox
                      label="Groups"
                      checked={formData.includeGroups}
                      onChange={(checked) => updateFormField('includeGroups', checked)}
                      disabled={isRunning}
                      data-cy="include-groups-checkbox"
                    />
                    <Checkbox
                      label="Licenses"
                      checked={formData.includeLicenses}
                      onChange={(checked) => updateFormField('includeLicenses', checked)}
                      disabled={isRunning}
                      data-cy="include-licenses-checkbox"
                    />
                  </div>

                  {/* Microsoft 365 Services */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Microsoft 365 Workloads</p>
                    <Checkbox
                      label="Microsoft Teams"
                      checked={formData.includeTeams}
                      onChange={(checked) => updateFormField('includeTeams', checked)}
                      disabled={isRunning}
                      data-cy="include-teams-checkbox"
                    />
                    <Checkbox
                      label="SharePoint Online"
                      checked={formData.includeSharePoint}
                      onChange={(checked) => updateFormField('includeSharePoint', checked)}
                      disabled={isRunning}
                      data-cy="include-sharepoint-checkbox"
                    />
                    <Checkbox
                      label="OneDrive for Business"
                      checked={formData.includeOneDrive}
                      onChange={(checked) => updateFormField('includeOneDrive', checked)}
                      disabled={isRunning}
                      data-cy="include-onedrive-checkbox"
                    />
                    <Checkbox
                      label="Exchange Online"
                      checked={formData.includeExchange}
                      onChange={(checked) => updateFormField('includeExchange', checked)}
                      disabled={isRunning}
                      data-cy="include-exchange-checkbox"
                    />
                  </div>
                </div>

                {/* Advanced Settings */}
                <Input
                  label="Max Results"
                  type="number"
                  value={formData.maxResults.toString()}
                  onChange={(value) => updateFormField('maxResults', parseInt(value) || 50000)}
                  disabled={isRunning}
                  min={1}
                  max={100000}
                  data-cy="max-results-input"
                />

                <Input
                  label="Timeout (seconds)"
                  type="number"
                  value={formData.timeout.toString()}
                  onChange={(value) => updateFormField('timeout', parseInt(value) || 600)}
                  disabled={isRunning}
                  min={60}
                  max={3600}
                  helpText="Recommended: 600s (10 min) for large tenants"
                  data-cy="timeout-input"
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
                      data-cy="start-discovery-btn"
                    >
                      Start Discovery
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={resetForm}
                      icon={<RefreshCw className="w-4 h-4" />}
                      className="w-full"
                      data-cy="reset-form-btn"
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
                    data-cy="cancel-discovery-btn"
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
            {results.length > 0 && (
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
                    data-cy="export-results-btn"
                  >
                    Export
                  </Button>
                </div>
                {results.map((result) => (
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
                {logs.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearLogs}
                    icon={<Trash2 className="w-4 h-4" />}
                    data-cy="clear-logs-btn"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div
                className="bg-gray-900 dark:bg-black rounded-md p-4 h-96 overflow-auto font-mono text-xs"
                data-cy="execution-log"
              >
                {logs.length === 0 ? (
                  <p className="text-gray-500">No logs yet. Start discovery to see output.</p>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className={`mb-1 ${
                        log.includes('ERROR')
                          ? 'text-red-400'
                          : log.includes('successful') || log.includes('completed')
                          ? 'text-green-400'
                          : 'text-gray-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AzureDiscoveryView;
