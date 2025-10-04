/**
 * Exchange Discovery View
 * Comprehensive UI for discovering Exchange Online/On-Premises environments
 */

import React from 'react';
import { useExchangeDiscoveryLogic } from '../../hooks/useExchangeDiscoveryLogic';
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
  Mail,
  Users,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  Inbox,
  Send,
} from 'lucide-react';

/**
 * Exchange Discovery View Component
 */
const ExchangeDiscoveryView: React.FC = () => {
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
  } = useExchangeDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="exchange-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Exchange Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover Exchange mailboxes, distribution groups, transport rules, and connectors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Template Selector */}
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500"
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
                  enabled={config.includeMailboxes}
                  label="Mailboxes"
                  icon={<Inbox className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeDistributionGroups}
                  label="Distribution Groups"
                  icon={<Users className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeTransportRules}
                  label="Transport Rules"
                  icon={<Shield className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeConnectors}
                  label="Connectors"
                  icon={<Send className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includePublicFolders}
                  label="Public Folders"
                  icon={<Database className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeMailboxPermissions}
                  label="Permissions"
                  icon={<Shield className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeStatistics}
                  label="Statistics"
                  icon={<Activity className="w-3 h-3" />}
                />
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isDiscovering && progress && (
          <div className="px-4 pb-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  {progress.currentOperation}
                </span>
                <span className="text-sm text-green-700 dark:text-green-300">
                  {progress.progress}% complete
                </span>
              </div>
              <ProgressBar value={progress.progress} max={100} />
              <div className="mt-2 flex items-center justify-between text-xs text-green-600 dark:text-green-400">
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
                icon={<Inbox className="w-5 h-5" />}
                label="Total Mailboxes"
                value={currentResult.stats.totalMailboxes}
                subValue={`Avg size: ${formatBytes(currentResult.stats.averageMailboxSize)}`}
                color="green"
              />
              <StatCard
                icon={<Database className="w-5 h-5" />}
                label="Total Storage"
                value={formatBytes(currentResult.stats.totalStorage)}
                subValue={`${currentResult.stats.totalItems.toLocaleString()} items`}
                color="blue"
              />
              <StatCard
                icon={<Users className="w-5 h-5" />}
                label="Distribution Groups"
                value={currentResult.stats.totalDistributionGroups}
                subValue={`${currentResult.stats.dynamicGroups} dynamic`}
                color="purple"
              />
              <StatCard
                icon={<Shield className="w-5 h-5" />}
                label="Transport Rules"
                value={currentResult.stats.totalTransportRules}
                subValue={`${currentResult.stats.enabledTransportRules} enabled`}
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
                icon={<Mail className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'mailboxes'}
                onClick={() => setSelectedTab('mailboxes')}
                label={`Mailboxes (${currentResult.mailboxes.length})`}
                icon={<Inbox className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'groups'}
                onClick={() => setSelectedTab('groups')}
                label={`Groups (${currentResult.distributionGroups.length})`}
                icon={<Users className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'transportRules'}
                onClick={() => setSelectedTab('transportRules')}
                label={`Transport Rules (${currentResult.transportRules.length})`}
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
                    data-cy="exchange-search"
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
                  data-cy={`exchange-${selectedTab}-grid`}
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
            <Mail className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Discovery Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure your Exchange discovery settings and click "Start Discovery" to begin analyzing your Exchange environment.
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
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
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
  subValue?: string;
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
        ? 'border-green-500 text-green-600 dark:text-green-400'
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

    {/* Mailbox Statistics */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Mailbox Statistics</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Mailboxes" value={result.stats.totalMailboxes} />
        <SummaryRow label="User Mailboxes" value={result.stats.userMailboxes} />
        <SummaryRow label="Shared Mailboxes" value={result.stats.sharedMailboxes} />
        <SummaryRow label="Resource Mailboxes" value={result.stats.resourceMailboxes} />
        <SummaryRow label="Average Mailbox Size" value={formatBytes(result.stats.averageMailboxSize)} />
        <SummaryRow label="Largest Mailbox" value={formatBytes(result.stats.largestMailboxSize)} />
        <SummaryRow label="Total Storage" value={formatBytes(result.stats.totalStorage)} />
      </div>
    </div>

    {/* Distribution Groups */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Distribution Groups</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Distribution Groups" value={result.stats.totalDistributionGroups} />
        <SummaryRow label="Static Groups" value={result.stats.staticGroups} />
        <SummaryRow label="Dynamic Groups" value={result.stats.dynamicGroups} />
        <SummaryRow label="Mail-Enabled Security Groups" value={result.stats.mailEnabledSecurityGroups} />
        <SummaryRow label="Average Members per Group" value={result.stats.averageMembersPerGroup.toFixed(1)} />
      </div>
    </div>

    {/* Transport Rules */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Transport Rules</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Transport Rules" value={result.stats.totalTransportRules} />
        <SummaryRow label="Enabled Rules" value={result.stats.enabledTransportRules} />
        <SummaryRow label="Disabled Rules" value={result.stats.disabledTransportRules} />
        <SummaryRow
          label="Compliance Coverage"
          value={
            <Badge variant={result.stats.enabledTransportRules > 5 ? 'success' : result.stats.enabledTransportRules > 2 ? 'warning' : 'danger'}>
              {result.stats.enabledTransportRules > 5 ? 'Good' : result.stats.enabledTransportRules > 2 ? 'Moderate' : 'Low'}
            </Badge>
          }
        />
      </div>
    </div>

    {/* Connectors */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Connectors</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Connectors" value={result.stats.totalConnectors} />
        <SummaryRow label="Inbound Connectors" value={result.stats.inboundConnectors} />
        <SummaryRow label="Outbound Connectors" value={result.stats.outboundConnectors} />
        <SummaryRow label="Enabled Connectors" value={result.stats.enabledConnectors} />
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

export default ExchangeDiscoveryView;
