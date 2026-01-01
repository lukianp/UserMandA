/**
 * Entra ID & Microsoft 365 Discovery View
 *
 * Discovers identity, security, and collaboration services from Microsoft cloud:
 * - Entra ID (Azure AD): Users, Groups, Administrative Units, Guest Accounts
 * - Security: Conditional Access Policies, Directory Roles, App Registrations
 * - Microsoft 365: Exchange Online, SharePoint Online, Microsoft Teams
 * - Devices: Entra ID Joined, Hybrid Joined, Intune Managed
 */

import React, { useState, useMemo } from 'react';
import {
  Cloud,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Users,
  UsersRound,
  Key,
  Mail,
  Share2,
  MessageSquare,
  HardDrive,
  LayoutDashboard,
  Shield,
  Building2
} from 'lucide-react';

import { useAzureDiscoveryLogic } from '../../hooks/useAzureDiscoveryLogic';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
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
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    selectedProfile,
    showExecutionDialog,
    setShowExecutionDialog,
  } = useAzureDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');

  // Compute stats from results
  const stats = useMemo(() => {
    if (!results || results.length === 0) return null;

    const latestResult = results[results.length - 1];
    return {
      totalItems: latestResult?.itemCount || 0,
      duration: latestResult?.duration || 0,
      summary: latestResult?.summary || '',
      filePath: latestResult?.filePath || '',
    };
  }, [results]);

  // Get services that were enabled for discovery
  const enabledServices = useMemo(() => {
    const services: string[] = [];
    if (formData.includeUsers) services.push('Users');
    if (formData.includeGroups) services.push('Groups');
    if (formData.includeLicenses) services.push('Licenses');
    if (formData.includeExchange) services.push('Exchange');
    if (formData.includeSharePoint) services.push('SharePoint');
    if (formData.includeTeams) services.push('Teams');
    if (formData.includeOneDrive) services.push('OneDrive');
    return services;
  }, [formData]);

  const handleExportCSV = () => {
    exportResults();
  };

  const handleExportExcel = () => {
    // For now, use the same export function
    exportResults();
  };

  const clearError = () => {
    // The hook doesn't expose a clearError, so we just use resetForm
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="azure-discovery-view" data-testid="azure-discovery-view">
      {isRunning && (
        <LoadingOverlay
          progress={progress?.overallProgress || 0}
          onCancel={cancelDiscovery}
          message={progress?.message || 'Discovering Entra ID & Microsoft 365 resources...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg">
            <Cloud size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Entra ID & Microsoft 365 Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover users, groups, security policies, and M365 services (Exchange, SharePoint, Teams) for identity consolidation and tenant migration planning
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {stats && stats.totalItems > 0 && (
            <>
              <Button
                onClick={handleExportCSV}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={handleExportExcel}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
                data-cy="export-excel-btn" data-testid="export-excel-btn"
              >
                Export Excel
              </Button>
            </>
          )}
          <Button
            onClick={startDiscovery}
            disabled={isRunning || !isFormValid}
            variant="primary"
            data-cy="start-discovery-btn" data-testid="start-discovery-btn"
          >
            {isRunning ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={resetForm} variant="ghost" size="sm">Dismiss</Button>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="mx-6 mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          data-cy="config-toggle" data-testid="config-toggle"
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 dark:text-white">Discovery Configuration</span>
            {selectedProfile && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                • Profile: <span className="font-medium text-blue-600 dark:text-blue-400">{selectedProfile.name}</span>
                {selectedProfile.tenantId && (
                  <span className="ml-2">• Tenant: {selectedProfile.tenantId.substring(0, 8)}...</span>
                )}
              </span>
            )}
          </div>
          {configExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {configExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Services to Discover */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Services to Discover
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  label="Licenses"
                  checked={formData.includeLicenses}
                  onChange={(checked) => updateFormField('includeLicenses', checked)}
                  disabled={isRunning}
                  data-cy="include-licenses-checkbox" data-testid="include-licenses-checkbox"
                />
                <Checkbox
                  label="Exchange Online"
                  checked={formData.includeExchange}
                  onChange={(checked) => updateFormField('includeExchange', checked)}
                  disabled={isRunning}
                  data-cy="include-exchange-checkbox" data-testid="include-exchange-checkbox"
                />
                <Checkbox
                  label="SharePoint Online"
                  checked={formData.includeSharePoint}
                  onChange={(checked) => updateFormField('includeSharePoint', checked)}
                  disabled={isRunning}
                  data-cy="include-sharepoint-checkbox" data-testid="include-sharepoint-checkbox"
                />
                <Checkbox
                  label="Microsoft Teams"
                  checked={formData.includeTeams}
                  onChange={(checked) => updateFormField('includeTeams', checked)}
                  disabled={isRunning}
                  data-cy="include-teams-checkbox" data-testid="include-teams-checkbox"
                />
                <Checkbox
                  label="OneDrive"
                  checked={formData.includeOneDrive}
                  onChange={(checked) => updateFormField('includeOneDrive', checked)}
                  disabled={isRunning}
                  data-cy="include-onedrive-checkbox" data-testid="include-onedrive-checkbox"
                />
              </div>
            </div>

            {/* Execution Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="flex items-end">
                <Checkbox
                  label="Use External Terminal (Advanced)"
                  checked={formData.showWindow}
                  onChange={(checked) => updateFormField('showWindow', checked)}
                  disabled={isRunning}
                  data-cy="show-window-checkbox" data-testid="show-window-checkbox"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={resetForm}
                disabled={isRunning}
                data-cy="reset-form-btn" data-testid="reset-form-btn"
              >
                Reset Configuration
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && stats.totalItems > 0 && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <div className="p-4 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Building2 className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalItems.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Items</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{enabledServices.length}</div>
                <div className="text-sm opacity-90">Services Scanned</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats.duration / 1000).toFixed(1)}s</div>
                <div className="text-sm opacity-90">Duration</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <LayoutDashboard className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{results.length}</div>
                <div className="text-sm opacity-90">Discovery Runs</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview" data-testid="tab-overview"
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'logs'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-logs" data-testid="tab-logs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Execution Log
            {logs.length > 0 && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{logs.length}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (
          <div className="space-y-6 overflow-auto">
            {/* No data state */}
            {(!stats || stats.totalItems === 0) && (
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Discovery Data Available</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Configure your services and start a discovery to view Entra ID & Microsoft 365 data.
                  </p>
                  <Button onClick={startDiscovery} disabled={isRunning || !isFormValid} variant="primary">
                    {isRunning ? 'Discovering...' : 'Start Discovery'}
                  </Button>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {stats && stats.totalItems > 0 && (
              <>
                {/* Services Discovered */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Services Discovered</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.includeUsers && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Users</span>
                      </div>
                    )}
                    {formData.includeGroups && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <UsersRound className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Groups</span>
                      </div>
                    )}
                    {formData.includeLicenses && (
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Key className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Licenses</span>
                      </div>
                    )}
                    {formData.includeExchange && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Mail className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Exchange</span>
                      </div>
                    )}
                    {formData.includeSharePoint && (
                      <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                        <Share2 className="w-5 h-5 text-teal-600" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">SharePoint</span>
                      </div>
                    )}
                    {formData.includeTeams && (
                      <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Teams</span>
                      </div>
                    )}
                    {formData.includeOneDrive && (
                      <div className="flex items-center gap-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                        <HardDrive className="w-5 h-5 text-cyan-600" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">OneDrive</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Discovery Results */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Discovery Results</h3>
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div key={result.id || index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Discovery Run #{results.length - index}
                          </span>
                          <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                            {result.itemCount?.toLocaleString() || 0} items
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>{result.summary}</p>
                          <p>Duration: {((result.duration || 0) / 1000).toFixed(2)}s</p>
                          {result.filePath && (
                            <p className="font-mono text-xs break-all mt-2">
                              Output: {result.filePath}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {logs.length} log entries
              </span>
              {logs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearLogs}
                  data-cy="clear-logs-btn" data-testid="clear-logs-btn"
                >
                  Clear Logs
                </Button>
              )}
            </div>
            <div
              className="flex-1 bg-gray-900 dark:bg-black rounded-lg p-4 overflow-auto font-mono text-xs"
              data-cy="execution-log" data-testid="execution-log"
            >
              {logs.length === 0 ? (
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
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isRunning && setShowExecutionDialog(false)}
        scriptName="Entra ID & Microsoft 365 Discovery"
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
