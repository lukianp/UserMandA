/**
 * Application Discovery View
 * Comprehensive UI for discovering installed applications, services, and processes
 */

import React from 'react';
import { useApplicationDiscoveryLogic } from '../../hooks/useApplicationDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import SearchBar from '../../components/molecules/SearchBar';
import { Button } from '../../components/atoms/Button';
import Badge from '../../components/atoms/Badge';
import ProgressBar from '../../components/molecules/ProgressBar';
import Checkbox from '../../components/atoms/Checkbox';
import {
  Download,
  Play,
  Square,
  Save,
  FolderOpen,
  Settings,
  RefreshCw,
  Package,
  Activity,
  Server,
  Network,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

/**
 * Application Discovery View Component
 */
const ApplicationDiscoveryView: React.FC = () => {
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
  } = useApplicationDiscoveryLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="app-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Application Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover installed software, services, processes, and network ports
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
                  enabled={config.includeSoftware}
                  label="Installed Software"
                  icon={<Package className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeProcesses}
                  label="Running Processes"
                  icon={<Activity className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeServices}
                  label="Services"
                  icon={<Server className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.scanRegistry}
                  label="Registry Scan"
                  icon={<Settings className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.scanFilesystem}
                  label="Filesystem Scan"
                  icon={<FolderOpen className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.scanPorts}
                  label="Port Scan"
                  icon={<Network className="w-3 h-3" />}
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
                  {progress.currentOperation || progress.message}
                </span>
                <span className="text-sm text-purple-700 dark:text-purple-300">
                  {progress.progress ?? progress.percentage}% complete
                </span>
              </div>
              <ProgressBar value={progress.progress ?? progress.percentage ?? 0} max={100} />
              <div className="mt-2 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400">
                <span>{progress.objectsProcessed ?? progress.current} objects processed</span>
                {progress.estimatedTimeRemaining && (
                  <span>Estimated time remaining: {progress.estimatedTimeRemaining}</span>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <StatCard
                icon={<Package className="w-5 h-5" />}
                label="Applications"
                value={currentResult.stats.totalApplications}
                subValue={`${currentResult.stats.licensedApplications} licensed`}
                color="purple"
              />
              <StatCard
                icon={<Activity className="w-5 h-5" />}
                label="Processes"
                value={currentResult.stats.totalProcesses}
                color="blue"
              />
              <StatCard
                icon={<Server className="w-5 h-5" />}
                label="Services"
                value={currentResult.stats.totalServices}
                subValue={`${currentResult.stats.runningServices} running`}
                color="green"
              />
              <StatCard
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Updates Needed"
                value={currentResult.stats.applicationsNeedingUpdate}
                color="orange"
              />
              <StatCard
                icon={<Shield className="w-5 h-5" />}
                label="Security Risks"
                value={currentResult.stats.securityRisks}
                color="red"
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
                icon={<Package className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'applications'}
                onClick={() => setSelectedTab('applications')}
                label={`Applications (${currentResult.applications.length})`}
                icon={<Package className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'processes'}
                onClick={() => setSelectedTab('processes')}
                label={`Processes (${currentResult.processes.length})`}
                icon={<Activity className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'services'}
                onClick={() => setSelectedTab('services')}
                label={`Services (${currentResult.services.length})`}
                icon={<Server className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'ports'}
                onClick={() => setSelectedTab('ports')}
                label={`Ports (${currentResult.ports.length})`}
                icon={<Network className="w-4 h-4" />}
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
                    data-cy="app-search"
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
                    onClick={() => console.log('Export data')}
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
                  data-cy={`app-${selectedTab}-grid`}
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
            <Package className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Discovery Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure your discovery settings and click "Start Discovery" to begin analyzing installed applications, services, and processes.
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

    {/* License Compliance */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">License Compliance</h3>
      <div className="space-y-3">
        <SummaryRow label="Licensed Applications" value={result.stats.licensedApplications} />
        <SummaryRow label="Unlicensed Applications" value={result.stats.unlicensedApplications} />
        <SummaryRow
          label="Compliance Rate"
          value={`${((result.stats.licensedApplications / result.stats.totalApplications) * 100).toFixed(1)}%`}
        />
      </div>
    </div>

    {/* Update Status */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Update Status</h3>
      <div className="space-y-3">
        <SummaryRow label="Applications Needing Updates" value={result.stats.applicationsNeedingUpdate} />
        <SummaryRow
          label="Up-to-Date Rate"
          value={`${(((result.stats.totalApplications - result.stats.applicationsNeedingUpdate) / result.stats.totalApplications) * 100).toFixed(1)}%`}
        />
      </div>
    </div>

    {/* Security */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Security</h3>
      <div className="space-y-3">
        <SummaryRow label="Security Risks Detected" value={result.stats.securityRisks} />
        <SummaryRow
          label="Security Risk Level"
          value={
            <Badge variant={result.stats.securityRisks === 0 ? 'success' : result.stats.securityRisks < 5 ? 'warning' : 'danger'}>
              {result.stats.securityRisks === 0 ? 'Low' : result.stats.securityRisks < 5 ? 'Medium' : 'High'}
            </Badge>
          }
        />
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

export default ApplicationDiscoveryView;
