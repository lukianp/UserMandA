/**
 * OneDrive Discovery View
 * Comprehensive UI for discovering OneDrive/OneDrive for Business environments
 */

import * as React from 'react';
import {
  Download,
  Play,
  Square,
  Save,
  Settings,
  RefreshCw,
  HardDrive,
  Users,
  Files,
  Share2,
  Database,
  TrendingUp,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { useOneDriveDiscoveryLogic } from '../../hooks/useOneDriveDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import SearchBar from '../../components/molecules/SearchBar';
import { Button } from '../../components/atoms/Button';
import Badge from '../../components/atoms/Badge';
import ProgressBar from '../../components/molecules/ProgressBar';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

/**
 * OneDrive Discovery View Component
 */
const OneDriveDiscoveryView: React.FC = () => {
  const {
    config,
    templates = [],
    currentResult,
    isDiscovering = false,
    isCancelling = false,
    progress,
    selectedTab = 'overview',
    searchText = '',
    filteredData = [],
    columnDefs = [],
    errors = [],
    logs = [],
    showExecutionDialog = false,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    loadTemplate,
    saveAsTemplate,
    exportResults,
    setSelectedTab,
    setSearchText,
    clearLogs,
    setShowExecutionDialog,
  } = useOneDriveDiscoveryLogic();

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="onedrive-discovery-view" data-testid="onedrive-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                OneDrive Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover personal cloud storage to assess compliance risk and plan content consolidation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Template Selector */}
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500"
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                if (template) loadTemplate(template);
              }}
              disabled={isDiscovering}
            >
              <option value="">Select Template...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>

            <Button
              variant="secondary"
              icon={<Settings />}
              onClick={() => {/* TODO: Open config dialog */}}
              disabled={isDiscovering}
              data-cy="config-btn" data-testid="config-btn"
            >
              Configure
            </Button>

            <Button
              variant="secondary"
              icon={<Save />}
              onClick={() => {/* TODO: Open save template dialog */}}
              disabled={isDiscovering}
              data-cy="save-template-btn" data-testid="save-template-btn"
            >
              Save Template
            </Button>

            {isDiscovering ? (
              <Button
                variant="danger"
                icon={<Square />}
                onClick={cancelDiscovery}
                data-cy="cancel-btn" data-testid="cancel-btn"
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={<Play />}
                onClick={startDiscovery}
                data-cy="start-discovery-btn" data-testid="start-discovery-btn"
              >
                Start Discovery
              </Button>
            )}

            <Button
              variant="secondary"
              icon={<Download />}
              onClick={() => exportResults('excel')}
              disabled={!currentResult || isDiscovering}
              data-cy="export-results-btn" data-testid="export-results-btn"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {config.discoverAccounts && (
            <Badge variant="info" data-cy="config-accounts-badge" data-testid="config-accounts-badge">
              <Users className="w-3 h-3" /> Accounts
            </Badge>
          )}
          {config.discoverFiles && (
            <Badge variant="info" data-cy="config-files-badge">
              <Files className="w-3 h-3" /> Files
            </Badge>
          )}
          {config.discoverSharing && (
            <Badge variant="info" data-cy="config-sharing-badge" data-testid="config-sharing-badge">
              <Share2 className="w-3 h-3" /> Sharing
            </Badge>
          )}
          {config.includeExternalShares && (
            <Badge variant="warning" data-cy="config-external-badge" data-testid="config-external-badge">
              <AlertTriangle className="w-3 h-3" /> External Shares
            </Badge>
          )}
          {config.scanForMalware && (
            <Badge variant="success" data-cy="config-malware-badge" data-testid="config-malware-badge">
              <Shield className="w-3 h-3" /> Malware Scan
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {isDiscovering && progress && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-4" data-cy="progress-section" data-testid="progress-section">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {progress.currentOperation}
              </span>
            </div>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {progress.overallProgress}% Complete
            </span>
          </div>
          <ProgressBar
            value={progress.overallProgress}
            variant="default"
            showLabel
          />
          <div className="mt-2 grid grid-cols-4 gap-4 text-xs text-blue-800 dark:text-blue-200">
            <div>Accounts: {progress.accountsProcessed}</div>
            <div>Files: {progress.filesProcessed}</div>
            <div>Shares: {progress.sharesProcessed}</div>
            <div>
              {progress.estimatedTimeRemaining
                ? `ETA: ${Math.ceil(progress.estimatedTimeRemaining / 60)}m`
                : 'Calculating...'}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(errors && Array.isArray(errors) && errors.length > 0) && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-4" data-cy="error-section" data-testid="error-section">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                Discovery Errors
              </h3>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {currentResult && currentResult.statistics && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-5 gap-4">
            {/* Total Accounts */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800" data-cy="stat-accounts" data-testid="stat-accounts">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <Badge variant="info" className="text-xs">
                  {currentResult.statistics?.activeAccounts ?? 0} active
                </Badge>
              </div>
              <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                {(currentResult.statistics?.totalAccounts ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">
                Total Accounts
              </div>
            </div>

            {/* Storage Used */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800" data-cy="stat-storage" data-testid="stat-storage">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <Badge variant="info" className="text-xs">
                  {typeof currentResult?.statistics?.averageStorageUsage === 'number' ? currentResult.statistics.averageStorageUsage.toFixed(1) : '0'}% avg
                </Badge>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatBytes(currentResult.statistics?.totalStorageUsed ?? 0)}
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                Total Storage Used
              </div>
            </div>

            {/* Total Files */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800" data-cy="stat-files" data-testid="stat-files">
              <div className="flex items-center justify-between mb-2">
                <Files className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <Badge variant="info" className="text-xs">
                  {(currentResult.statistics?.totalFolders ?? 0).toLocaleString()} folders
                </Badge>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {(currentResult.statistics?.totalFiles ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Total Files
              </div>
            </div>

            {/* Shared Items */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800" data-cy="stat-sharing" data-testid="stat-sharing">
              <div className="flex items-center justify-between mb-2">
                <Share2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <Badge variant="warning" className="text-xs">
                  {(currentResult.statistics?.externalShares ?? 0).toLocaleString()} external
                </Badge>
              </div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {(currentResult.statistics?.totalShares ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Shared Items
              </div>
            </div>

            {/* Security Metrics */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-800" data-cy="stat-security" data-testid="stat-security">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                <Badge variant="danger" className="text-xs">
                  {currentResult.statistics?.highRiskShares ?? 0} high risk
                </Badge>
              </div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                {(currentResult.statistics?.filesWithExternalAccess ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                External Access
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4">
            <div className="flex space-x-1" role="tablist">
              <button
                role="tab"
                aria-selected={selectedTab === 'overview'}
                onClick={() => setSelectedTab('overview')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'overview'
                    ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                data-cy="tab-overview" data-testid="tab-overview"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Overview
                </div>
              </button>

              <button
                role="tab"
                aria-selected={selectedTab === 'accounts'}
                onClick={() => setSelectedTab('accounts')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'accounts'
                    ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                data-cy="tab-accounts" data-testid="tab-accounts"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Accounts
                  {currentResult && (
                    <Badge variant="default" className="text-xs">
                      {currentResult.accounts?.length || 0}
                    </Badge>
                  )}
                </div>
              </button>

              <button
                role="tab"
                aria-selected={selectedTab === 'files'}
                onClick={() => setSelectedTab('files')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'files'
                    ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                data-cy="tab-files" data-testid="tab-files"
              >
                <div className="flex items-center gap-2">
                  <Files className="w-4 h-4" />
                  Files
                  {currentResult && (
                    <Badge variant="default" className="text-xs">
                      {currentResult.files?.length || 0}
                    </Badge>
                  )}
                </div>
              </button>

              <button
                role="tab"
                aria-selected={selectedTab === 'sharing'}
                onClick={() => setSelectedTab('sharing')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'sharing'
                    ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                data-cy="tab-sharing" data-testid="tab-sharing"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Sharing Links
                  {currentResult && (
                    <Badge variant="default" className="text-xs">
                      {currentResult.sharing?.length || 0}
                    </Badge>
                  )}
                </div>
              </button>
            </div>

            {selectedTab !== 'overview' && (
              <div className="py-2">
                <SearchBar
                  value={searchText}
                  onChange={setSearchText}
                  placeholder={`Search ${selectedTab}...`}
                  data-cy={`search-${selectedTab}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {selectedTab === 'overview' && currentResult ? (
            <div className="h-full overflow-y-auto p-6" data-cy="overview-content" data-testid="overview-content">
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Discovery Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Discovery Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Configuration</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                        {currentResult.configName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tenant</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                        {currentResult.tenantName || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Started</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                        {new Date(currentResult.startTime).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                        {formatDuration(currentResult.duration)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Storage Analysis */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Storage Analysis
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Quota</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatBytes(currentResult.statistics?.totalStorageQuota ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Used</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatBytes(currentResult.statistics?.totalStorageUsed ?? 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatBytes(currentResult.statistics?.totalStorageAvailable ?? 0)}
                      </span>
                    </div>
                    <div className="pt-2">
                      <ProgressBar
                        value={currentResult.statistics?.averageStorageUsage ?? 0}
                        variant="default"
                        showLabel
                      />
                    </div>
                  </div>
                </div>

                {/* Security Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Security & Sharing
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">High Risk Shares</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {currentResult.statistics?.highRiskShares ?? 0}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Share2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">External Shares</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {currentResult.statistics?.externalShares ?? 0}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Unlabeled Files</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {currentResult.statistics?.unlabeledFiles ?? 0}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Stale Files</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {currentResult.statistics?.staleFiles ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedTab !== 'overview' ? (
            <div className="h-full p-4">
              <VirtualizedDataGrid
                data={filteredData}
                columns={columnDefs}
                loading={isDiscovering}
                enableColumnReorder
                data-cy={`${selectedTab}-grid`}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No discovery results yet. Click "Start Discovery" to begin.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="OneDrive Discovery"
        scriptDescription="Discovering OneDrive accounts, files, and sharing permissions"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? { percentage: progress.overallProgress || 0, message: progress.currentOperation || 'Processing...' } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

// Helper function
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export default OneDriveDiscoveryView;


