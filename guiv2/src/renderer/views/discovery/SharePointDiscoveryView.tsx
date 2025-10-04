/**
 * SharePoint Discovery View
 * Comprehensive UI for discovering SharePoint Online/On-Premises environments
 */

import React from 'react';
import { useSharePointDiscoveryLogic } from '../../hooks/useSharePointDiscoveryLogic';
import VirtualizedDataGrid from '../../components/organisms/VirtualizedDataGrid';
import SearchBar from '../../components/molecules/SearchBar';
import Button from '../../components/atoms/Button';
import Badge from '../../components/atoms/Badge';
import ProgressBar from '../../components/molecules/ProgressBar';
import {
  Download,
  Play,
  Square,
  Save,
  Settings,
  RefreshCw,
  FolderOpen,
  FileText,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  Lock,
  Users,
} from 'lucide-react';

/**
 * SharePoint Discovery View Component
 */
const SharePointDiscoveryView: React.FC = () => {
  const {
    config,
    templates,
    currentResult,
    isDiscovering,
    progress,
    selectedTab,
    searchText,
    filteredData,
    columnDefs,
    errors,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    loadTemplate,
    saveAsTemplate,
    exportResults,
    setSelectedTab,
    setSearchText,
  } = useSharePointDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="sharepoint-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                SharePoint Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover SharePoint sites, lists, libraries, permissions, and content types
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Template Selector */}
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
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
              data-cy="config-btn"
            >
              Configure
            </Button>

            <Button
              variant="secondary"
              icon={<Save />}
              onClick={() => {/* TODO: Open save template dialog */}}
              disabled={isDiscovering}
              data-cy="save-template-btn"
            >
              Save Template
            </Button>

            {!isDiscovering ? (
              <Button
                variant="primary"
                icon={<Play />}
                onClick={startDiscovery}
                data-cy="start-discovery-btn"
              >
                Start Discovery
              </Button>
            ) : (
              <Button
                variant="danger"
                icon={<Square />}
                onClick={cancelDiscovery}
                data-cy="cancel-discovery-btn"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Configuration Summary */}
        {!isDiscovering && (
          <div className="px-4 pb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex flex-wrap gap-2 text-sm">
                <ConfigBadge
                  enabled={config.includeSites}
                  label="Sites"
                  icon={<FolderOpen className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeLists}
                  label="Lists & Libraries"
                  icon={<FileText className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includePermissions}
                  label="Permissions"
                  icon={<Shield className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeContentTypes}
                  label="Content Types"
                  icon={<Database className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeWorkflows}
                  label="Workflows"
                  icon={<Activity className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeExternalSharing}
                  label="External Sharing"
                  icon={<Users className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeStorageMetrics}
                  label="Storage Metrics"
                  icon={<Database className="w-3 h-3" />}
                />
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isDiscovering && progress && (
          <div className="px-4 pb-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  {progress.currentOperation}
                </span>
                <span className="text-sm text-purple-700 dark:text-purple-300">
                  {progress.progress}% complete
                </span>
              </div>
              <ProgressBar value={progress.progress} max={100} />
              <div className="mt-2 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400">
                <span>{progress.objectsProcessed} objects processed</span>
                {progress.estimatedTimeRemaining !== null && (
                  <span>Estimated time remaining: {Math.ceil(progress.estimatedTimeRemaining / 60)} minutes</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="px-4 pb-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">Errors:</h3>
              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {currentResult && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Summary Stats */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<FolderOpen className="w-5 h-5" />}
                label="Total Sites"
                value={currentResult.stats.totalSites}
                subValue={`${currentResult.stats.subsites} subsites`}
                color="purple"
              />
              <StatCard
                icon={<Database className="w-5 h-5" />}
                label="Total Storage"
                value={formatBytes(currentResult.stats.totalStorage)}
                subValue={`${formatBytes(currentResult.stats.storageUsed)} used`}
                color="blue"
              />
              <StatCard
                icon={<FileText className="w-5 h-5" />}
                label="Lists & Libraries"
                value={currentResult.stats.totalLists}
                subValue={`${currentResult.stats.totalDocuments.toLocaleString()} documents`}
                color="green"
              />
              <StatCard
                icon={<Shield className="w-5 h-5" />}
                label="Unique Permissions"
                value={currentResult.stats.uniquePermissions}
                subValue={
                  currentResult.stats.uniquePermissions > 100
                    ? <span className="text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> High complexity
                      </span>
                    : 'Good'
                }
                color="orange"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1 px-4">
              <TabButton
                active={selectedTab === 'overview'}
                onClick={() => setSelectedTab('overview')}
                label="Overview"
                icon={<FolderOpen className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'sites'}
                onClick={() => setSelectedTab('sites')}
                label={`Sites (${currentResult.sites.length})`}
                icon={<FolderOpen className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'lists'}
                onClick={() => setSelectedTab('lists')}
                label={`Lists (${currentResult.lists.length})`}
                icon={<FileText className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'permissions'}
                onClick={() => setSelectedTab('permissions')}
                label={`Permissions (${currentResult.permissions.length})`}
                icon={<Shield className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Search and Actions */}
          {selectedTab !== 'overview' && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <SearchBar
                    value={searchText}
                    onChange={setSearchText}
                    placeholder={`Search ${selectedTab}...`}
                    data-cy="sharepoint-search"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    icon={<RefreshCw />}
                    onClick={startDiscovery}
                    data-cy="refresh-btn"
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Download />}
                    onClick={() => exportResults('excel')}
                    data-cy="export-btn"
                  >
                    Export
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
            {selectedTab === 'overview' ? (
              <OverviewTab result={currentResult} />
            ) : (
              <div className="h-full p-4">
                <VirtualizedDataGrid
                  data={filteredData}
                  columns={columnDefs}
                  loading={false}
                  enableExport
                  enableColumnReorder
                  enableFiltering
                  data-cy={`sharepoint-${selectedTab}-grid`}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!currentResult && !isDiscovering && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <FolderOpen className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Discovery Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure your SharePoint discovery settings and click "Start Discovery" to begin analyzing your SharePoint environment.
            </p>
            <Button
              variant="primary"
              icon={<Play />}
              onClick={startDiscovery}
            >
              Start Discovery
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Config Badge Component
 */
interface ConfigBadgeProps {
  enabled: boolean;
  label: string;
  icon: React.ReactNode;
}

const ConfigBadge: React.FC<ConfigBadgeProps> = ({ enabled, label, icon }) => (
  <div className={`
    flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
    ${enabled
      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-500'}
  `}>
    {icon}
    <span>{label}</span>
    {enabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
  </div>
);

/**
 * Stat Card Component
 */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subValue?: string | React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    gray: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className={`p-1.5 rounded ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      {subValue && <div className="text-xs text-gray-600 dark:text-gray-400">{subValue}</div>}
    </div>
  );
};

/**
 * Tab Button Component
 */
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors
      ${active
        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'}
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

/**
 * Overview Tab Component
 */
interface OverviewTabProps {
  result: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ result }) => (
  <div className="p-6 space-y-6">
    {/* Discovery Summary */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Discovery Summary</h3>
      <div className="space-y-3">
        <SummaryRow label="Discovery ID" value={result.id} />
        <SummaryRow label="Configuration" value={result.configName} />
        <SummaryRow label="Start Time" value={new Date(result.startTime).toLocaleString()} />
        <SummaryRow label="End Time" value={result.endTime ? new Date(result.endTime).toLocaleString() : 'N/A'} />
        <SummaryRow label="Duration" value={`${(result.duration / 1000).toFixed(2)} seconds`} />
        <SummaryRow label="Objects per Second" value={result.objectsPerSecond.toFixed(2)} />
        <SummaryRow label="Status" value={<Badge variant={result.status === 'completed' ? 'success' : 'warning'}>{result.status}</Badge>} />
      </div>
    </div>

    {/* Site Statistics */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Site Statistics</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Sites" value={result.stats.totalSites} />
        <SummaryRow label="Root Sites" value={result.stats.rootSites} />
        <SummaryRow label="Subsites" value={result.stats.subsites} />
        <SummaryRow label="Team Sites" value={result.stats.teamSites} />
        <SummaryRow label="Communication Sites" value={result.stats.communicationSites} />
        <SummaryRow label="Hub Sites" value={result.stats.hubSites} />
        <SummaryRow label="Average Site Size" value={formatBytes(result.stats.averageSiteSize)} />
      </div>
    </div>

    {/* Storage Statistics */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Storage Statistics</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Storage" value={formatBytes(result.stats.totalStorage)} />
        <SummaryRow label="Storage Used" value={formatBytes(result.stats.storageUsed)} />
        <SummaryRow label="Storage Available" value={formatBytes(result.stats.storageAvailable)} />
        <SummaryRow
          label="Storage Utilization"
          value={`${((result.stats.storageUsed / result.stats.totalStorage) * 100).toFixed(1)}%`}
        />
        <SummaryRow label="Total Documents" value={result.stats.totalDocuments.toLocaleString()} />
        <SummaryRow label="Total Lists" value={result.stats.totalLists.toLocaleString()} />
      </div>
    </div>

    {/* Permission Statistics */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Permission Statistics</h3>
      <div className="space-y-3">
        <SummaryRow label="Unique Permissions" value={result.stats.uniquePermissions} />
        <SummaryRow label="Sites with Unique Permissions" value={result.stats.sitesWithUniquePermissions} />
        <SummaryRow label="Items with Unique Permissions" value={result.stats.itemsWithUniquePermissions} />
        <SummaryRow label="External Users" value={result.stats.externalUsers} />
        <SummaryRow label="Externally Shared Items" value={result.stats.externallySharedItems} />
        <SummaryRow
          label="Security Complexity"
          value={
            <Badge variant={result.stats.uniquePermissions > 100 ? 'danger' : result.stats.uniquePermissions > 50 ? 'warning' : 'success'}>
              {result.stats.uniquePermissions > 100 ? 'High' : result.stats.uniquePermissions > 50 ? 'Moderate' : 'Low'}
            </Badge>
          }
        />
      </div>
    </div>

    {/* External Sharing */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">External Sharing</h3>
      <div className="space-y-3">
        <SummaryRow label="Sites Allowing External Sharing" value={result.stats.sitesAllowingExternalSharing} />
        <SummaryRow label="Anonymous Links" value={result.stats.anonymousLinks} />
        <SummaryRow label="Guest Links" value={result.stats.guestLinks} />
        <SummaryRow label="Organization Links" value={result.stats.organizationLinks} />
      </div>
    </div>
  </div>
);

/**
 * Summary Row Component
 */
interface SummaryRowProps {
  label: string;
  value: React.ReactNode;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}:</span>
    <span className="text-sm text-gray-900 dark:text-gray-100">{value}</span>
  </div>
);

/**
 * Format bytes utility
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default SharePointDiscoveryView;
