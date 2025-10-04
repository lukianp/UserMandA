/**
 * Teams Discovery View
 * Comprehensive UI for discovering Microsoft Teams environments
 */

import React from 'react';
import { useTeamsDiscoveryLogic } from '../../hooks/useTeamsDiscoveryLogic';
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
  MessageSquare,
  Users,
  Hash,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  UserCheck,
  Calendar,
} from 'lucide-react';

/**
 * Teams Discovery View Component
 */
const TeamsDiscoveryView: React.FC = () => {
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
  } = useTeamsDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="teams-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Teams Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover Microsoft Teams, channels, members, settings, and installed apps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Template Selector */}
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
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
                  enabled={config.includeTeams}
                  label="Teams"
                  icon={<MessageSquare className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeChannels}
                  label="Channels"
                  icon={<Hash className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeMembers}
                  label="Members"
                  icon={<Users className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeApps}
                  label="Installed Apps"
                  icon={<Package className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeSettings}
                  label="Settings"
                  icon={<Settings className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeTabs}
                  label="Tabs"
                  icon={<Activity className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeGuests}
                  label="Guest Access"
                  icon={<UserCheck className="w-3 h-3" />}
                />
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isDiscovering && progress && (
          <div className="px-4 pb-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  {progress.currentOperation}
                </span>
                <span className="text-sm text-indigo-700 dark:text-indigo-300">
                  {progress.progress}% complete
                </span>
              </div>
              <ProgressBar value={progress.progress} max={100} />
              <div className="mt-2 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400">
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
                icon={<MessageSquare className="w-5 h-5" />}
                label="Total Teams"
                value={currentResult.stats.totalTeams}
                subValue={`${currentResult.stats.activeTeams} active`}
                color="indigo"
              />
              <StatCard
                icon={<Hash className="w-5 h-5" />}
                label="Total Channels"
                value={currentResult.stats.totalChannels}
                subValue={`${currentResult.stats.privateChannels} private`}
                color="blue"
              />
              <StatCard
                icon={<Users className="w-5 h-5" />}
                label="Total Members"
                value={currentResult.stats.totalMembers}
                subValue={`${currentResult.stats.guestMembers} guests`}
                color="green"
              />
              <StatCard
                icon={<Package className="w-5 h-5" />}
                label="Installed Apps"
                value={currentResult.stats.totalApps}
                subValue={`${currentResult.stats.customApps} custom`}
                color="purple"
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
                icon={<MessageSquare className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'teams'}
                onClick={() => setSelectedTab('teams')}
                label={`Teams (${currentResult.teams.length})`}
                icon={<MessageSquare className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'channels'}
                onClick={() => setSelectedTab('channels')}
                label={`Channels (${currentResult.channels.length})`}
                icon={<Hash className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'members'}
                onClick={() => setSelectedTab('members')}
                label={`Members (${currentResult.members.length})`}
                icon={<Users className="w-4 h-4" />}
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
                    data-cy="teams-search"
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
                  data-cy={`teams-${selectedTab}-grid`}
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
            <MessageSquare className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Discovery Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure your Teams discovery settings and click "Start Discovery" to begin analyzing your Microsoft Teams environment.
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
      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
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
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    gray: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
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
        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
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

    {/* Teams Statistics */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Teams Statistics</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Teams" value={result.stats.totalTeams} />
        <SummaryRow label="Active Teams" value={result.stats.activeTeams} />
        <SummaryRow label="Archived Teams" value={result.stats.archivedTeams} />
        <SummaryRow label="Public Teams" value={result.stats.publicTeams} />
        <SummaryRow label="Private Teams" value={result.stats.privateTeams} />
        <SummaryRow label="Org-Wide Teams" value={result.stats.orgWideTeams} />
        <SummaryRow label="Average Team Size" value={result.stats.averageTeamSize.toFixed(1)} />
      </div>
    </div>

    {/* Channel Statistics */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Channel Statistics</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Channels" value={result.stats.totalChannels} />
        <SummaryRow label="Standard Channels" value={result.stats.standardChannels} />
        <SummaryRow label="Private Channels" value={result.stats.privateChannels} />
        <SummaryRow label="Shared Channels" value={result.stats.sharedChannels} />
        <SummaryRow label="Average Channels per Team" value={result.stats.averageChannelsPerTeam.toFixed(1)} />
      </div>
    </div>

    {/* Member Statistics */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Member Statistics</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Members" value={result.stats.totalMembers} />
        <SummaryRow label="Internal Members" value={result.stats.internalMembers} />
        <SummaryRow label="Guest Members" value={result.stats.guestMembers} />
        <SummaryRow label="Team Owners" value={result.stats.teamOwners} />
        <SummaryRow label="Team Members" value={result.stats.teamMembers} />
        <SummaryRow
          label="Guest Access"
          value={
            <Badge variant={result.stats.guestMembers > 0 ? 'warning' : 'success'}>
              {result.stats.guestMembers > 0 ? 'Enabled' : 'Disabled'}
            </Badge>
          }
        />
      </div>
    </div>

    {/* App Statistics */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">App Statistics</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Installed Apps" value={result.stats.totalApps} />
        <SummaryRow label="Microsoft Apps" value={result.stats.microsoftApps} />
        <SummaryRow label="Custom Apps" value={result.stats.customApps} />
        <SummaryRow label="Third-Party Apps" value={result.stats.thirdPartyApps} />
        <SummaryRow label="Average Apps per Team" value={result.stats.averageAppsPerTeam.toFixed(1)} />
      </div>
    </div>

    {/* Settings & Features */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Settings & Features</h3>
      <div className="space-y-3">
        <SummaryRow label="Teams with Custom Settings" value={result.stats.teamsWithCustomSettings} />
        <SummaryRow label="Teams with Apps Enabled" value={result.stats.teamsWithAppsEnabled} />
        <SummaryRow label="Teams with Fun Settings" value={result.stats.teamsWithFunSettings} />
        <SummaryRow label="Teams with Meeting Settings" value={result.stats.teamsWithMeetingSettings} />
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

export default TeamsDiscoveryView;
