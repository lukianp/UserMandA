/**
 * Active Directory Discovery View
 * Comprehensive UI for discovering and analyzing Active Directory environments
 */

import React from 'react';
import { Download, Play, Square, Save, FolderOpen, Settings, RefreshCw, Database, Users, Server, FolderTree, Shield, Network } from 'lucide-react';

import { useActiveDirectoryDiscoveryLogic } from '../../hooks/useActiveDirectoryDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import SearchBar from '../../components/molecules/SearchBar';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import Badge from '../../components/atoms/Badge';
import ProgressBar from '../../components/molecules/ProgressBar';

/**
 * Active Directory Discovery View Component
 */
const ActiveDirectoryDiscoveryView: React.FC = () => {
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
  } = useActiveDirectoryDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="ad-discovery-view" data-testid="ad-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Active Directory Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover on-premises directory infrastructure to identify dependencies and plan cloud migration strategies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Template Selector */}
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              onChange={(value) => {
                const template = templates.find(t => t.id === value);
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

            {!isDiscovering ? (
              <Button
                variant="primary"
                icon={<Play />}
                onClick={startDiscovery}
                data-cy="start-discovery-btn" data-testid="start-discovery-btn"
              >
                Start Discovery
              </Button>
            ) : (
              <Button
                variant="danger"
                icon={<Square />}
                onClick={cancelDiscovery}
                data-cy="cancel-discovery-btn" data-testid="cancel-discovery-btn"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isDiscovering && progress && (
          <div className="px-4 pb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {progress.currentOperation}
                </span>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {progress.progress}% complete
                </span>
              </div>
              <ProgressBar value={progress.progress || 0} max={100} />
              {progress.estimatedTimeRemaining !== null && progress.estimatedTimeRemaining !== undefined && typeof progress.estimatedTimeRemaining === 'number' && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  Estimated time remaining: {Math.ceil(progress.estimatedTimeRemaining / 60)} minutes
                </div>
              )}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <StatCard
                icon={<Users className="w-5 h-5" />}
                label="Users"
                value={currentResult.stats?.totalUsers ?? 0}
                subValue={`${currentResult.stats?.enabledUsers ?? 0} enabled`}
                color="blue"
              />
              <StatCard
                icon={<Shield className="w-5 h-5" />}
                label="Groups"
                value={currentResult.stats?.totalGroups ?? 0}
                subValue={`${currentResult.stats?.securityGroups ?? 0} security`}
                color="green"
              />
              <StatCard
                icon={<Server className="w-5 h-5" />}
                label="Computers"
                value={currentResult.stats?.totalComputers ?? 0}
                subValue={`${currentResult.stats?.enabledComputers ?? 0} enabled`}
                color="purple"
              />
              <StatCard
                icon={<FolderTree className="w-5 h-5" />}
                label="OUs"
                value={currentResult.stats?.totalOUs ?? 0}
                color="orange"
              />
              <StatCard
                icon={<Settings className="w-5 h-5" />}
                label="GPOs"
                value={currentResult.stats?.totalGPOs ?? 0}
                color="red"
              />
              <StatCard
                icon={<Network className="w-5 h-5" />}
                label="Duration"
                value={`${Math.round((currentResult.duration ?? 0) / 1000)}s`}
                subValue={`${(currentResult.objectsPerSecond ?? 0).toFixed(1)} obj/s`}
                color="gray"
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
                icon={<Database className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'users'}
                onClick={() => setSelectedTab('users')}
                label={`Users (${currentResult.users.length})`}
                icon={<Users className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'groups'}
                onClick={() => setSelectedTab('groups')}
                label={`Groups (${currentResult.groups.length})`}
                icon={<Shield className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'computers'}
                onClick={() => setSelectedTab('computers')}
                label={`Computers (${currentResult.computers.length})`}
                icon={<Server className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'ous'}
                onClick={() => setSelectedTab('ous')}
                label={`OUs (${currentResult.ous.length})`}
                icon={<FolderTree className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'gpos'}
                onClick={() => setSelectedTab('gpos')}
                label={`GPOs (${currentResult.gpos.length})`}
                icon={<Settings className="w-4 h-4" />}
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
                    data-cy="ad-search" data-testid="ad-search"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    icon={<RefreshCw />}
                    onClick={startDiscovery}
                    data-cy="refresh-btn" data-testid="refresh-btn"
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Download />}
                    onClick={exportResults}
                    data-cy="export-results-btn" data-testid="export-results-btn"
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
                  enableColumnReorder
                  data-cy={`ad-${selectedTab}-grid`}
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
            <Database className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Discovery Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure your discovery settings and click "Start Discovery" to begin analyzing your Active Directory environment.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="primary"
                icon={<Play />}
                onClick={startDiscovery}
              >
                Start Discovery
              </Button>
              <Button
                variant="secondary"
                icon={<FolderOpen />}
                onClick={() => {/* TODO: Load from file */}}
              >
                Load Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Discovery Summary</h3>
      <div className="space-y-3">
        <SummaryRow label="Discovery ID" value={result.id} />
        <SummaryRow label="Configuration" value={result.configName} />
        <SummaryRow label="Start Time" value={new Date(result.startTime).toLocaleString()} />
        <SummaryRow label="End Time" value={result.endTime ? new Date(result.endTime).toLocaleString() : 'N/A'} />
        <SummaryRow label="Duration" value={`${(result.duration / 1000).toFixed(2)} seconds`} />
        <SummaryRow label="Status" value={<Badge variant={result.status === 'completed' ? 'success' : 'warning'}>{result.status}</Badge>} />
      </div>
    </div>

    {result.forest && (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Forest Information</h3>
        <div className="space-y-3">
          <SummaryRow label="Forest Name" value={(result?.forest?.name ?? 0)} />
          <SummaryRow label="Forest Mode" value={(result?.forest?.forestMode ?? 0)} />
          <SummaryRow label="Domains" value={(result?.forest?.domains ?? 0).length} />
          <SummaryRow label="Sites" value={(result?.forest?.sites ?? 0).length} />
          <SummaryRow label="Global Catalogs" value={(result?.forest?.globalCatalogs ?? 0).length} />
        </div>
      </div>
    )}
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

export default ActiveDirectoryDiscoveryView;
