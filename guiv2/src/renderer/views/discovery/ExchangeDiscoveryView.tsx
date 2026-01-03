/**
 * Exchange Discovery View
 * Comprehensive UI for discovering Exchange Online/On-Premises environments
 */

import * as React from 'react';
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
  Globe,
  UserCheck,
  Archive,
  Forward,
  Lock,
  HardDrive,
  Building2,
  CheckCircle2,
  FileText,
  Workflow,
  ArrowRightLeft,
  Network,
  Key,
  Bug,
  Plane,
  TrendingUp,
} from 'lucide-react';

import { useExchangeDiscoveryLogic } from '../../hooks/useExchangeDiscoveryLogic';
import { useExchangeDiscoveredLogic } from '../../hooks/useExchangeDiscoveredLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { SearchBar } from '../../components/molecules/SearchBar';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { ProgressBar } from '../../components/molecules/ProgressBar';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

/**
 * Exchange Discovery View Component
 */
const ExchangeDiscoveryView: React.FC = () => {
  const {
    config,
    setConfig,
    result,
    isDiscovering,
    progress,
    error,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    templates,
    selectedTemplate,
    loadTemplate,
    saveAsTemplate,
    startDiscovery,
    cancelDiscovery,
    mailboxes,
    groups,
    rules,
    mailboxFilter,
    setMailboxFilter,
    groupFilter,
    setGroupFilter,
    ruleFilter,
    setRuleFilter,
    mailboxColumns,
    groupColumns,
    ruleColumns,
    exportData,
    selectedTab,
    setSelectedTab,
    statistics,
  } = useExchangeDiscoveryLogic();

  // Use discovered logic for rich CSV-based results
  const {
    activeTab: discoveredTab,
    setActiveTab: setDiscoveredTab,
    searchTerm: discoveredSearchTerm,
    setSearchTerm: setDiscoveredSearchTerm,
    loading: discoveredLoading,
    error: discoveredError,
    statistics: discoveredStatistics,
    // Core data
    filteredMailboxes,
    filteredGroups,
    filteredContacts,
    filteredDomains,
    // Mail flow data
    filteredTransportRules,
    filteredInboundConnectors,
    filteredOutboundConnectors,
    filteredRemoteDomains,
    // Security data
    filteredDkimConfigs,
    filteredAntiSpamPolicies,
    filteredAntiPhishPolicies,
    filteredMalwarePolicies,
    // DNS and migration data
    filteredDnsRecords,
    filteredMigrationEndpoints,
    filteredMigrationBatches,
    // Core columns
    mailboxColumns: discoveredMailboxColumns,
    groupColumns: discoveredGroupColumns,
    contactColumns: discoveredContactColumns,
    domainColumns: discoveredDomainColumns,
    // Mail flow columns
    transportRuleColumns: discoveredTransportRuleColumns,
    inboundConnectorColumns: discoveredInboundConnectorColumns,
    outboundConnectorColumns: discoveredOutboundConnectorColumns,
    remoteDomainColumns: discoveredRemoteDomainColumns,
    // Security columns
    dkimConfigColumns: discoveredDkimConfigColumns,
    antiSpamPolicyColumns: discoveredAntiSpamPolicyColumns,
    antiPhishPolicyColumns: discoveredAntiPhishPolicyColumns,
    malwarePolicyColumns: discoveredMalwarePolicyColumns,
    // DNS and migration columns
    dnsRecordColumns: discoveredDnsRecordColumns,
    migrationEndpointColumns: discoveredMigrationEndpointColumns,
    migrationBatchColumns: discoveredMigrationBatchColumns,
    exportToCSV,
  } = useExchangeDiscoveredLogic();

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="exchange-discovery-view" data-testid="exchange-discovery-view">
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
                Discover messaging infrastructure to assess migration readiness and plan cloud adoption strategies
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
                  enabled={config.discoverMailboxes}
                  label="Mailboxes"
                  icon={<Inbox className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.discoverDistributionGroups}
                  label="Distribution Groups"
                  icon={<Users className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.discoverTransportRules}
                  label="Transport Rules"
                  icon={<Shield className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.discoverConnectors}
                  label="Connectors"
                  icon={<Send className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.discoverPublicFolders}
                  label="Public Folders"
                  icon={<Database className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeMailboxPermissions}
                  label="Permissions"
                  icon={<Shield className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeMailboxStatistics}
                  label="Statistics"
                  icon={<Activity className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.discoverRemoteDomains}
                  label="Remote Domains"
                  icon={<Globe className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.discoverSecurityPolicies}
                  label="Security Policies"
                  icon={<Lock className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.discoverMigrationConfig}
                  label="Migration"
                  icon={<Forward className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.discoverDnsRecords}
                  label="DNS Records"
                  icon={<Globe className="w-3 h-3" />}
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
                  {progress.phaseLabel || progress.currentItem || 'Processing...'}
                </span>
                <span className="text-sm text-green-700 dark:text-green-300">
                  {progress.percentComplete}% complete
                </span>
              </div>
              <ProgressBar value={progress.percentComplete} max={100} />
              <div className="mt-2 flex items-center justify-between text-xs text-green-600 dark:text-green-400">
                <span>{progress.itemsProcessed} of {progress.totalItems} items processed</span>
                {progress.estimatedTimeRemaining !== undefined && (
                  <span>Estimated time remaining: {Math.ceil(progress.estimatedTimeRemaining / 60)} minutes</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="px-4 pb-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">Error:</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && !discoveredLoading && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Rich Statistics Cards (3 rows × 4 columns = 12 cards) */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Discovery Success % Card - prominent first position */}
              <DiscoverySuccessCard
                percentage={discoveredStatistics.discoverySuccessPercentage || 0}
                received={discoveredStatistics.dataSourcesReceivedCount || 0}
                total={discoveredStatistics.dataSourcesTotal || 14}
              />
              <RichStatCard
                icon={Mail}
                label="Total Mailboxes"
                value={discoveredStatistics.totalMailboxes}
                gradient="from-blue-500 to-blue-600"
              />
              <RichStatCard
                icon={Users}
                label="Distribution Groups"
                value={discoveredStatistics.totalGroups}
                gradient="from-green-500 to-green-600"
              />
              <RichStatCard
                icon={Workflow}
                label="Transport Rules"
                value={discoveredStatistics.totalTransportRules || 0}
                gradient="from-purple-500 to-purple-600"
              />

              {/* Row 2: Mail Flow & Connectors */}
              <RichStatCard
                icon={Globe}
                label="Accepted Domains"
                value={discoveredStatistics.totalDomains}
                gradient="from-indigo-500 to-indigo-600"
              />
              <RichStatCard
                icon={Network}
                label="Remote Domains"
                value={discoveredStatistics.totalRemoteDomains || 0}
                gradient="from-cyan-500 to-cyan-600"
              />
              <RichStatCard
                icon={Key}
                label="DKIM Enabled"
                value={discoveredStatistics.enabledDkim || 0}
                gradient="from-emerald-500 to-emerald-600"
              />
              <RichStatCard
                icon={Shield}
                label="Security Policies"
                value={(discoveredStatistics.totalAntiSpamPolicies || 0) + (discoveredStatistics.totalAntiPhishPolicies || 0) + (discoveredStatistics.totalMalwarePolicies || 0)}
                gradient="from-orange-500 to-orange-600"
              />

              {/* Row 3: Mailbox Details & Migration */}
              <RichStatCard
                icon={CheckCircle2}
                label="Active Mailboxes"
                value={discoveredStatistics.activeMailboxes}
                gradient="from-rose-500 to-rose-600"
              />
              <RichStatCard
                icon={Archive}
                label="With Archive"
                value={discoveredStatistics.mailboxesWithArchive}
                gradient="from-violet-500 to-violet-600"
              />
              <RichStatCard
                icon={Plane}
                label="Migration Batches"
                value={discoveredStatistics.totalMigrationBatches || 0}
                gradient="from-teal-500 to-teal-600"
              />
              <RichStatCard
                icon={Building2}
                label="M365 Groups"
                value={discoveredStatistics.m365Groups}
                gradient="from-pink-500 to-pink-600"
              />
            </div>
          </div>

          {/* Tabs - Scrollable for many tabs */}
          <div className="px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <TabButton
                active={discoveredTab === 'overview'}
                onClick={() => setDiscoveredTab('overview')}
                label="Overview"
                icon={<FileText className="w-4 h-4" />}
              />
              <TabButton
                active={discoveredTab === 'mailboxes'}
                onClick={() => setDiscoveredTab('mailboxes')}
                label={`Mailboxes (${discoveredStatistics.totalMailboxes})`}
                icon={<Mail className="w-4 h-4" />}
              />
              <TabButton
                active={discoveredTab === 'groups'}
                onClick={() => setDiscoveredTab('groups')}
                label={`Groups (${discoveredStatistics.totalGroups})`}
                icon={<Users className="w-4 h-4" />}
              />
              <TabButton
                active={discoveredTab === 'transportRules'}
                onClick={() => setDiscoveredTab('transportRules')}
                label={`Rules (${discoveredStatistics.totalTransportRules || 0})`}
                icon={<Workflow className="w-4 h-4" />}
              />
              <TabButton
                active={discoveredTab === 'inboundConnectors'}
                onClick={() => setDiscoveredTab('inboundConnectors')}
                label={`Inbound (${discoveredStatistics.totalInboundConnectors || 0})`}
                icon={<ArrowRightLeft className="w-4 h-4" />}
              />
              <TabButton
                active={discoveredTab === 'outboundConnectors'}
                onClick={() => setDiscoveredTab('outboundConnectors')}
                label={`Outbound (${discoveredStatistics.totalOutboundConnectors || 0})`}
                icon={<ArrowRightLeft className="w-4 h-4" />}
              />
              <TabButton
                active={discoveredTab === 'dns'}
                onClick={() => setDiscoveredTab('dns')}
                label={`DNS (${discoveredStatistics.totalDnsRecords || 0})`}
                icon={<Network className="w-4 h-4" />}
              />
              <TabButton
                active={discoveredTab === 'dkim'}
                onClick={() => setDiscoveredTab('dkim')}
                label={`DKIM (${discoveredStatistics.totalDkimConfigs || 0})`}
                icon={<Key className="w-4 h-4" />}
              />
              <TabButton
                active={discoveredTab === 'antiSpam'}
                onClick={() => setDiscoveredTab('antiSpam')}
                label={`Anti-Spam (${discoveredStatistics.totalAntiSpamPolicies || 0})`}
                icon={<AlertTriangle className="w-4 h-4" />}
              />
              <TabButton
                active={discoveredTab === 'antiPhish'}
                onClick={() => setDiscoveredTab('antiPhish')}
                label={`Anti-Phish (${discoveredStatistics.totalAntiPhishPolicies || 0})`}
                icon={<Shield className="w-4 h-4" />}
              />
              <TabButton
                active={discoveredTab === 'malware'}
                onClick={() => setDiscoveredTab('malware')}
                label={`Malware (${discoveredStatistics.totalMalwarePolicies || 0})`}
                icon={<Bug className="w-4 h-4" />}
              />
              <TabButton
                active={discoveredTab === 'migrationBatches'}
                onClick={() => setDiscoveredTab('migrationBatches')}
                label={`Migration (${discoveredStatistics.totalMigrationBatches || 0})`}
                icon={<Plane className="w-4 h-4" />}
              />
              <TabButton
                active={discoveredTab === 'domains'}
                onClick={() => setDiscoveredTab('domains')}
                label={`Domains (${discoveredStatistics.totalDomains})`}
                icon={<Globe className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Actions */}
          {discoveredTab !== 'overview' && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={discoveredSearchTerm}
                  onChange={(e) => setDiscoveredSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
                <Button
                  variant="secondary"
                  icon={<Download />}
                  onClick={exportToCSV}
                  data-cy="export-results-btn" data-testid="export-results-btn"
                >
                  Export CSV
                </Button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
            {discoveredTab === 'overview' ? (
              <DiscoveredOverviewTab statistics={discoveredStatistics} />
            ) : (
              <div className="h-full p-4">
                <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <VirtualizedDataGrid
                    data={(
                      discoveredTab === 'mailboxes' ? filteredMailboxes :
                      discoveredTab === 'groups' ? filteredGroups :
                      discoveredTab === 'contacts' ? filteredContacts :
                      discoveredTab === 'domains' ? filteredDomains :
                      discoveredTab === 'transportRules' ? filteredTransportRules :
                      discoveredTab === 'inboundConnectors' ? filteredInboundConnectors :
                      discoveredTab === 'outboundConnectors' ? filteredOutboundConnectors :
                      discoveredTab === 'dns' ? filteredDnsRecords :
                      discoveredTab === 'dkim' ? filteredDkimConfigs :
                      discoveredTab === 'antiSpam' ? filteredAntiSpamPolicies :
                      discoveredTab === 'antiPhish' ? filteredAntiPhishPolicies :
                      discoveredTab === 'malware' ? filteredMalwarePolicies :
                      discoveredTab === 'migrationBatches' ? filteredMigrationBatches : []
                    ) as any[]}
                    columns={
                      discoveredTab === 'mailboxes' ? discoveredMailboxColumns :
                      discoveredTab === 'groups' ? discoveredGroupColumns :
                      discoveredTab === 'contacts' ? discoveredContactColumns :
                      discoveredTab === 'domains' ? discoveredDomainColumns :
                      discoveredTab === 'transportRules' ? discoveredTransportRuleColumns :
                      discoveredTab === 'inboundConnectors' ? discoveredInboundConnectorColumns :
                      discoveredTab === 'outboundConnectors' ? discoveredOutboundConnectorColumns :
                      discoveredTab === 'dns' ? discoveredDnsRecordColumns :
                      discoveredTab === 'dkim' ? discoveredDkimConfigColumns :
                      discoveredTab === 'antiSpam' ? discoveredAntiSpamPolicyColumns :
                      discoveredTab === 'antiPhish' ? discoveredAntiPhishPolicyColumns :
                      discoveredTab === 'malware' ? discoveredMalwarePolicyColumns :
                      discoveredTab === 'migrationBatches' ? discoveredMigrationBatchColumns : []
                    }
                    enableFiltering={true}
                    enableColumnResize={true}
                    data-cy={`exchange-${discoveredTab}-grid`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !isDiscovering && (
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

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Exchange Discovery"
        scriptDescription="Discovering Exchange mailboxes, groups, and transport rules"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={false}
        progress={progress ? {
          percentage: progress.percentComplete || 0,
          message: progress.phaseLabel || 'Processing...'
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={() => {}}
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
        <SummaryRow label="Objects per Second" value={(typeof result?.objectsPerSecond === 'number' ? result.objectsPerSecond : 0).toFixed(2)} />
        <SummaryRow label="Status" value={<Badge variant={result.status === 'completed' ? 'success' : 'warning'}>{result.status}</Badge>} />
      </div>
    </div>

    {/* Mailbox Statistics */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Mailbox Statistics</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Mailboxes" value={(result?.statistics?.totalMailboxes ?? 0)} />
        <SummaryRow label="User Mailboxes" value={(result?.statistics?.userMailboxes ?? 0)} />
        <SummaryRow label="Shared Mailboxes" value={(result?.statistics?.sharedMailboxes ?? 0)} />
        <SummaryRow label="Resource Mailboxes" value={(result?.statistics?.resourceMailboxes ?? 0)} />
        <SummaryRow label="Average Mailbox Size" value={formatBytes((result?.statistics?.averageMailboxSize ?? 0))} />
        <SummaryRow label="Largest Mailbox" value={formatBytes((result?.statistics?.largestMailboxSize ?? 0))} />
        <SummaryRow label="Total Storage" value={formatBytes((result?.statistics?.totalStorage ?? 0))} />
      </div>
    </div>

    {/* Distribution Groups */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Distribution Groups</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Distribution Groups" value={(result?.statistics?.totalDistributionGroups ?? 0)} />
        <SummaryRow label="Static Groups" value={(result?.statistics?.staticGroups ?? 0)} />
        <SummaryRow label="Dynamic Groups" value={(result?.statistics?.dynamicGroups ?? 0)} />
        <SummaryRow label="Mail-Enabled Security Groups" value={(result?.statistics?.mailEnabledSecurityGroups ?? 0)} />
        <SummaryRow label="Average Members per Group" value={(typeof result?.statistics?.averageMembersPerGroup === 'number' ? result.statistics.averageMembersPerGroup : 0).toFixed(1)} />
      </div>
    </div>

    {/* Transport Rules */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Transport Rules</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Transport Rules" value={(result?.statistics?.totalTransportRules ?? 0)} />
        <SummaryRow label="Enabled Rules" value={(result?.statistics?.enabledTransportRules ?? 0)} />
        <SummaryRow label="Disabled Rules" value={(result?.statistics?.disabledTransportRules ?? 0)} />
        <SummaryRow
          label="Compliance Coverage"
          value={
            <Badge variant={(result?.statistics?.enabledTransportRules ?? 0) > 5 ? 'success' : (result?.statistics?.enabledTransportRules ?? 0) > 2 ? 'warning' : 'danger'}>
              {(result?.statistics?.enabledTransportRules ?? 0) > 5 ? 'Good' : (result?.statistics?.enabledTransportRules ?? 0) > 2 ? 'Moderate' : 'Low'}
            </Badge>
          }
        />
      </div>
    </div>

    {/* Connectors */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Connectors</h3>
      <div className="space-y-3">
        <SummaryRow label="Total Connectors" value={(result?.statistics?.totalConnectors ?? 0)} />
        <SummaryRow label="Inbound Connectors" value={(result?.statistics?.inboundConnectors ?? 0)} />
        <SummaryRow label="Outbound Connectors" value={(result?.statistics?.outboundConnectors ?? 0)} />
        <SummaryRow label="Enabled Connectors" value={(result?.statistics?.enabledConnectors ?? 0)} />
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
 * Rich Stat Card Component (for discovered statistics)
 */
interface RichStatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  gradient: string;
}

const RichStatCard: React.FC<RichStatCardProps> = ({ icon: Icon, label, value, gradient }) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{label}</p>
          <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
        </div>
        <Icon size={40} className="opacity-80" />
      </div>
    </div>
  );
};

/**
 * Discovery Success Card - special card showing % of data sources retrieved
 */
interface DiscoverySuccessCardProps {
  percentage: number;
  received: number;
  total: number;
}

const DiscoverySuccessCard: React.FC<DiscoverySuccessCardProps> = ({ percentage, received, total }) => {
  // Color gradient based on percentage
  const getGradient = () => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-amber-600';
    if (percentage >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getIcon = () => {
    if (percentage >= 80) return CheckCircle;
    if (percentage >= 40) return TrendingUp;
    return XCircle;
  };

  const Icon = getIcon();

  return (
    <div className={`bg-gradient-to-br ${getGradient()} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">Discovery Success</p>
          <p className="text-3xl font-bold mt-2">{percentage}%</p>
          <p className="text-xs opacity-75 mt-1">{received}/{total} data sources</p>
        </div>
        <Icon size={40} className="opacity-80" />
      </div>
    </div>
  );
};

/**
 * Discovered Overview Tab Component
 */
interface DiscoveredOverviewTabProps {
  statistics: any;
}

const DiscoveredOverviewTab: React.FC<DiscoveredOverviewTabProps> = ({ statistics }) => {
  return (
    <div className="p-6 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mailbox Breakdown */}
        <BreakdownPanel
          title="Mailbox Breakdown"
          icon={Mail}
          items={[
            { label: 'Active Mailboxes', value: statistics.activeMailboxes, total: statistics.totalMailboxes },
            { label: 'Inactive Mailboxes', value: statistics.inactiveMailboxes, total: statistics.totalMailboxes },
            { label: 'With Archive', value: statistics.mailboxesWithArchive, total: statistics.totalMailboxes },
            { label: 'With Forwarding', value: statistics.mailboxesWithForwarding, total: statistics.totalMailboxes },
            { label: 'Litigation Hold', value: statistics.mailboxesWithLitigationHold, total: statistics.totalMailboxes },
          ]}
        />

        {/* Group Breakdown */}
        <BreakdownPanel
          title="Group Breakdown"
          icon={Users}
          items={[
            { label: 'Microsoft 365 Groups', value: statistics.m365Groups, total: statistics.totalGroups },
            { label: 'Distribution Lists', value: statistics.distributionLists, total: statistics.totalGroups },
            { label: 'Security Enabled', value: statistics.securityGroups, total: statistics.totalGroups },
            { label: 'Mail Enabled', value: statistics.mailEnabledGroups, total: statistics.totalGroups },
            { label: 'Public Groups', value: statistics.publicGroups, total: statistics.totalGroups },
          ]}
        />

        {/* Top Departments */}
        <BreakdownPanel
          title="Top Departments"
          icon={Building2}
          items={statistics.topDepartments?.slice(0, 10).map((dept: any) => ({
            label: dept.name,
            value: dept.count,
            total: statistics.totalMailboxes,
          })) || []}
        />

        {/* Top Groups by Members */}
        <BreakdownPanel
          title="Top Groups by Members"
          icon={Users}
          items={statistics.topGroupsByMembers?.slice(0, 10).map((group: any) => ({
            label: group.name,
            value: group.count,
            total: statistics.totalGroupMembers,
          })) || []}
        />
      </div>
    </div>
  );
};

/**
 * Breakdown Panel Component
 */
interface BreakdownPanelProps {
  title: string;
  icon: React.ComponentType<any>;
  items: Array<{ label: string; value: number; total: number }>;
}

const BreakdownPanel: React.FC<BreakdownPanelProps> = ({ title, icon: Icon, items }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
          <Icon size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {item.value.toLocaleString()}
                {item.total > 0 && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    ({Math.round((item.value / item.total) * 100)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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


