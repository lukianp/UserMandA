/**
 * Office 365 Discovery View
 * Comprehensive UI for discovering Office 365/Microsoft 365 environments
 */

import * as React from 'react';
import {
  Download,
  Play,
  Square,
  Save,
  Settings,
  RefreshCw,
  Cloud,
  Users,
  Key,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  UserCheck,
  UserX,
} from 'lucide-react';

import { useOffice365DiscoveryLogic } from '../../hooks/useOffice365DiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import SearchBar from '../../components/molecules/SearchBar';
import { Button } from '../../components/atoms/Button';
import Badge from '../../components/atoms/Badge';
import ProgressBar from '../../components/molecules/ProgressBar';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

/**
 * Office 365 Discovery View Component
 */
const Office365DiscoveryView: React.FC = () => {
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
    clearLogs,
    setShowExecutionDialog,
    setSelectedTab,
    setSearchText,
  } = useOffice365DiscoveryLogic();

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="o365-discovery-view" data-testid="o365-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <Cloud size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Office 365 Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover cloud productivity suite to assess license optimization and plan service consolidation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Template Selector */}
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
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

        {/* Configuration Summary */}
        {!isDiscovering && (
          <div className="px-4 pb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex flex-wrap gap-2 text-sm">
                <ConfigBadge
                  enabled={config.includeTenantInfo}
                  label="Tenant Info"
                  icon={<Cloud className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeUsers}
                  label="Users"
                  icon={<Users className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeGuests}
                  label="Guest Users"
                  icon={<Users className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeLicenses}
                  label="Licenses"
                  icon={<Key className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeServices}
                  label="Services"
                  icon={<Activity className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeSecurity}
                  label="Security"
                  icon={<Shield className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeConditionalAccess}
                  label="Conditional Access"
                  icon={<Shield className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeMFAStatus}
                  label="MFA Status"
                  icon={<UserCheck className="w-3 h-3" />}
                />
              </div>
            </div>
          </div>
        )}

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
              <ProgressBar value={progress.progress} max={100} />
              <div className="mt-2 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                <span>{progress.objectsProcessed} objects processed</span>
                {progress.estimatedTimeRemaining !== null && (
                  <span>Estimated time remaining: {Math.ceil(progress.estimatedTimeRemaining / 60)} minutes</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(errors && errors.length > 0) && (
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
                label="Total Users"
                value={currentResult?.stats?.totalUsers ?? 0}
                subValue={`${currentResult?.stats?.enabledUsers ?? 0} enabled`}
                color="blue"
              />
              <StatCard
                icon={<UserCheck className="w-5 h-5" />}
                label="MFA Enabled"
                value={currentResult?.stats?.mfaEnabledUsers ?? 0}
                subValue={`${(((currentResult?.stats?.mfaEnabledUsers ?? 0) / (currentResult?.stats?.totalUsers ?? 1)) * 100).toFixed(1)}% coverage`}
                color="green"
              />
              <StatCard
                icon={<Key className="w-5 h-5" />}
                label="Licenses"
                value={currentResult?.stats?.totalLicenses ?? 0}
                subValue={`${currentResult?.stats?.assignedLicenses ?? 0} assigned`}
                color="purple"
              />
              <StatCard
                icon={<Activity className="w-5 h-5" />}
                label="Services"
                value={currentResult?.stats?.totalServices ?? 0}
                subValue={`${currentResult?.stats?.healthyServices ?? 0} healthy`}
                color="blue"
              />
              <StatCard
                icon={<Award className="w-5 h-5" />}
                label="Admins"
                value={currentResult?.stats?.adminUsers ?? 0}
                color="orange"
              />
              <StatCard
                icon={<Shield className="w-5 h-5" />}
                label="CA Policies"
                value={currentResult?.stats?.conditionalAccessPolicies ?? 0}
                color="green"
              />
            </div>
          </div>

          {/* Tenant Overview (Top Banner) */}
          {currentResult.tenant && selectedTab === 'overview' && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-blue-200 dark:border-blue-700 p-4">
              <div className="flex items-center gap-4">
                <Cloud className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {currentResult.tenant.displayName}
                  </h2>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {currentResult.tenant.primaryDomain} • Tenant ID: {currentResult.tenant.tenantId}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-blue-700 dark:text-blue-300">
                      {currentResult.tenant.verifiedDomains?.length || 0} verified domains
                    </span>
                    <span className="text-blue-700 dark:text-blue-300">
                      {currentResult.tenant.totalLicenses} total licenses
                    </span>
                    <span className="text-blue-700 dark:text-blue-300">
                      Type: {currentResult.tenant.tenantType}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1 px-4">
              <TabButton
                active={selectedTab === 'overview'}
                onClick={() => setSelectedTab('overview')}
                label="Overview"
                icon={<Cloud className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'users'}
                onClick={() => setSelectedTab('users')}
                label={`Users (${(currentResult.users?.length || 0) + (currentResult.guestUsers?.length || 0)})`}
                icon={<Users className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'licenses'}
                onClick={() => setSelectedTab('licenses')}
                label={`Licenses (${currentResult.licenses?.length || 0})`}
                icon={<Key className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'services'}
                onClick={() => setSelectedTab('services')}
                label={`Services (${currentResult.services?.length || 0})`}
                icon={<Activity className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'security'}
                onClick={() => setSelectedTab('security')}
                label="Security"
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
                    data-cy="o365-search" data-testid="o365-search"
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
                    onClick={() => exportResults('excel')}
                    data-cy="export-results-btn" data-testid="export-results-btn"
                  >
                    Export
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
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
                  data-cy={`o365-${selectedTab}-grid`}
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
            <Cloud className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Discovery Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure your Office 365 discovery settings and click "Start Discovery" to begin analyzing your Microsoft 365 tenant.
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

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Office 365 Discovery"
        scriptDescription="Discovering Office 365/Microsoft 365 users, licenses, services, and security configuration"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? { percentage: progress.progress || 0, message: progress.currentOperation || 'Processing...' } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
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
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
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
    {/* Discovery Summary */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Discovery Summary</h3>
      <div className="space-y-3">
        <SummaryRow label="Discovery ID" value={result.id} />
        <SummaryRow label="Configuration" value={result.configName} />
        <SummaryRow label="Start Time" value={new Date(result.startTime).toLocaleString()} />
        <SummaryRow label="End Time" value={result.endTime ? new Date(result.endTime).toLocaleString() : 'N/A'} />
        <SummaryRow label="Duration" value={`${(result.duration / 1000).toFixed(2)} seconds`} />
        <SummaryRow label="Objects per Second" value={(typeof result?.objectsPerSecond === 'number' ? result.objectsPerSecond : 0).toFixed(2)} />
        <SummaryRow label="Status" value={<Badge variant={result.status === 'completed' ? 'success' : 'warning'}>{result.status}</Badge>} />
      </div>
    </div>

    {/* License Summary */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">License Summary</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Licenses" value={result?.stats?.totalLicenses ?? 0} />
        <SummaryRow label="Assigned Licenses" value={result?.stats?.assignedLicenses ?? 0} />
        <SummaryRow label="Available Licenses" value={result?.stats?.availableLicenses ?? 0} />
        <SummaryRow
          label="Utilization Rate"
          value={`${(((result?.stats?.assignedLicenses ?? 0) / (result?.stats?.totalLicenses ?? 1)) * 100).toFixed(1)}%`}
        />
      </div>
    </div>

    {/* MFA Status */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Multi-Factor Authentication</h3>
      <div className="space-y-3">
        <SummaryRow label="MFA Enabled Users" value={result?.stats?.mfaEnabledUsers ?? 0} />
        <SummaryRow label="MFA Registered Users" value={result?.stats?.mfaRegisteredUsers ?? 0} />
        <SummaryRow
          label="MFA Coverage"
          value={`${(((result?.stats?.mfaEnabledUsers ?? 0) / (result?.stats?.totalUsers ?? 1)) * 100).toFixed(1)}%`}
        />
        <SummaryRow
          label="Security Posture"
          value={
            <Badge variant={(result?.stats?.mfaEnabledUsers ?? 0) / (result?.stats?.totalUsers ?? 1) > 0.9 ? 'success' : (result?.stats?.mfaEnabledUsers ?? 0) / (result?.stats?.totalUsers ?? 1) > 0.7 ? 'warning' : 'danger'}>
              {(result?.stats?.mfaEnabledUsers ?? 0) / (result?.stats?.totalUsers ?? 1) > 0.9 ? 'Strong' : (result?.stats?.mfaEnabledUsers ?? 0) / (result?.stats?.totalUsers ?? 1) > 0.7 ? 'Moderate' : 'Weak'}
            </Badge>
          }
        />
      </div>
    </div>

    {/* Service Health */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Service Health</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Services" value={result?.stats?.totalServices ?? 0} />
        <SummaryRow label="Healthy Services" value={result?.stats?.healthyServices ?? 0} />
        <SummaryRow label="Degraded Services" value={result?.stats?.degradedServices ?? 0} />
        <SummaryRow label="Unavailable Services" value={result?.stats?.unavailableServices ?? 0} />
        <SummaryRow
          label="Overall Health"
          value={
            <Badge variant={(result?.stats?.unavailableServices ?? 0) === 0 && (result?.stats?.degradedServices ?? 0) === 0 ? 'success' : (result?.stats?.unavailableServices ?? 0) === 0 ? 'warning' : 'danger'}>
              {(result?.stats?.unavailableServices ?? 0) === 0 && (result?.stats?.degradedServices ?? 0) === 0 ? 'Healthy' : (result?.stats?.unavailableServices ?? 0) === 0 ? 'Degraded' : 'Critical'}
            </Badge>
          }
        />
      </div>
    </div>

    {/* Security Configuration */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Security Configuration</h3>
      <div className="space-y-3">
        <SummaryRow label="Conditional Access Policies" value={result?.stats?.conditionalAccessPolicies ?? 0} />
        <SummaryRow label="DLP Policies" value={result?.stats?.dlpPolicies ?? 0} />
        <SummaryRow label="Retention Policies" value={result?.stats?.retentionPolicies ?? 0} />
        <SummaryRow label="Admin Users" value={result?.stats?.adminUsers ?? 0} />
      </div>
    </div>

    {/* User Statistics */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">User Statistics</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Users" value={result?.stats?.totalUsers ?? 0} />
        <SummaryRow label="Enabled Users" value={result?.stats?.enabledUsers ?? 0} />
        <SummaryRow label="Disabled Users" value={result?.stats?.disabledUsers ?? 0} />
        <SummaryRow label="Guest Users" value={result?.stats?.guestUsers ?? 0} />
        <SummaryRow
          label="Active User Rate"
          value={`${(((result?.stats?.enabledUsers ?? 0) / (result?.stats?.totalUsers ?? 1)) * 100).toFixed(1)}%`}
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

export default Office365DiscoveryView;


