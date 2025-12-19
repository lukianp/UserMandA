/**
 * Domain Discovery View
 * UI for Active Directory domain discovery
 */

import React from 'react';
import { Play, Square, RefreshCw, Download, Trash2, Server } from 'lucide-react';

import { useDomainDiscoveryLogic } from '../../hooks/useDomainDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';

const DomainDiscoveryView: React.FC = () => {
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
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    selectedProfile,
  } = useDomainDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="domain-discovery-view" data-testid="domain-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <Server size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Domain Discovery
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Discover directory structure to identify organizational hierarchy and access permission consolidation needs
              </p>
            </div>
          </div>
          {selectedProfile && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Profile: <span className="font-semibold">{selectedProfile.name}</span>
            </div>
          )}
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
                {/* Domain Controller */}
                <Input
                  label="Domain Controller"
                  placeholder="dc.contoso.com"
                  value={formData.domainController}
                  onChange={(e) => updateFormField('domainController', e.target.value)}
                  disabled={isRunning}
                  required
                  data-cy="domain-controller-input" data-testid="domain-controller-input"
                />

                {/* Search Base */}
                <Input
                  label="Search Base (Optional)"
                  placeholder="OU=Users,DC=contoso,DC=com"
                  value={formData.searchBase}
                  onChange={(e) => updateFormField('searchBase', e.target.value)}
                  disabled={isRunning}
                  helperText="Leave empty to search from root"
                  data-cy="search-base-input" data-testid="search-base-input"
                />

                {/* Object Types */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Object Types
                  </label>
                  <Checkbox
                    label="Users"
                    checked={formData.includeUsers}
                    onChange={(checked) => updateFormField('includeUsers', checked)}
                    disabled={isRunning}
                    data-cy="include-users-checkbox" data-testid="include-users-checkbox"
                  />
                  <Checkbox
                    label="Groups"
                    checked={formData.includeGroups}
                    onChange={(checked) => updateFormField('includeGroups', checked)}
                    disabled={isRunning}
                    data-cy="include-groups-checkbox" data-testid="include-groups-checkbox"
                  />
                  <Checkbox
                    label="Computers"
                    checked={formData.includeComputers}
                    onChange={(checked) => updateFormField('includeComputers', checked)}
                    disabled={isRunning}
                    data-cy="include-computers-checkbox" data-testid="include-computers-checkbox"
                  />
                  <Checkbox
                    label="Organizational Units"
                    checked={formData.includeOUs}
                    onChange={(checked) => updateFormField('includeOUs', checked)}
                    disabled={isRunning}
                    data-cy="include-ous-checkbox" data-testid="include-ous-checkbox"
                  />
                </div>

                {/* Advanced Settings */}
                <Input
                  label="Max Results"
                  type="number"
                  value={formData?.maxResults?.toString() || '10000'}
                  onChange={(e) => updateFormField('maxResults', parseInt(e.target.value) || 10000)}
                  disabled={isRunning}
                  min={1}
                  max={100000}
                  data-cy="max-results-input" data-testid="max-results-input"
                />

                <Input
                  label="Timeout (seconds)"
                  type="number"
                  value={formData?.timeout?.toString() || '300'}
                  onChange={(e) => updateFormField('timeout', parseInt(e.target.value) || 300)}
                  disabled={isRunning}
                  min={10}
                  max={3600}
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
                      {progress?.currentOperation || 'Processing'}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {progress?.overallProgress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress?.overallProgress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {progress?.currentOperation || 'Processing...'}
                  </p>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {results && (Array.isArray(results) ? results.length : 0) > 0 && (
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
                {(results ?? []).map((result, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Items Discovered
                      </span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {(result.users || 0) + (result.groups || 0) + (result.computers || 0) + (result.ous || 0)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Discovery completed at {result.timestamp}</p>
                      <p>
                        Users: {result.users || 0}, Groups: {result.groups || 0},
                        Computers: {result.computers || 0}, OUs: {result.ous || 0}
                      </p>
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
                        log && typeof log === 'string' && log.includes('ERROR')
                          ? 'text-red-400'
                          : log && typeof log === 'string' && (log.includes('SUCCESS') || log.includes('completed'))
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

export default DomainDiscoveryView;
