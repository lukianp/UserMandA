/**
 * Exchange Discovered View
 *
 * Rich discovered view with statistics, breakdowns, and data grids for Exchange Online
 * Displays mailboxes, distribution groups, mail contacts, and accepted domains
 */

import React from 'react';
import {
  Mail,
  Users,
  Globe,
  UserCheck,
  Archive,
  Shield,
  Forward,
  Lock,
  HardDrive,
  Building2,
  CheckCircle2,
  FileText,
  ArrowRightLeft,
  Network,
  Key,
  AlertTriangle,
  Bug,
  Plane,
  Workflow,
  Server,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { useExchangeDiscoveredLogic } from '../../hooks/useExchangeDiscoveredLogic';

export const ExchangeDiscoveredView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    statistics,
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
    mailboxColumns,
    groupColumns,
    contactColumns,
    domainColumns,
    // Mail flow columns
    transportRuleColumns,
    inboundConnectorColumns,
    outboundConnectorColumns,
    remoteDomainColumns,
    // Security columns
    dkimConfigColumns,
    antiSpamPolicyColumns,
    antiPhishPolicyColumns,
    malwarePolicyColumns,
    // DNS and migration columns
    dnsRecordColumns,
    migrationEndpointColumns,
    migrationBatchColumns,
    exportToCSV,
  } = useExchangeDiscoveredLogic();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Exchange data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <div className="w-12 h-12 mx-auto mb-4">✗</div>
          <p>Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <Mail size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exchange Online</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {statistics.totalMailboxes} mailboxes, {statistics.totalGroups} groups, {statistics.totalTransportRules || 0} transport rules
            </p>
          </div>
        </div>
      </div>

      {/* Tabs - IMMEDIATELY AFTER HEADER */}
      <div className="px-6 pt-4 flex-shrink-0">
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={FileText}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'mailboxes'}
            onClick={() => setActiveTab('mailboxes')}
            icon={Mail}
            label={`Mailboxes (${statistics.totalMailboxes})`}
          />
          <TabButton
            active={activeTab === 'groups'}
            onClick={() => setActiveTab('groups')}
            icon={Users}
            label={`Groups (${statistics.totalGroups})`}
          />
          <TabButton
            active={activeTab === 'transportRules'}
            onClick={() => setActiveTab('transportRules')}
            icon={Workflow}
            label={`Rules (${statistics.totalTransportRules || 0})`}
          />
          <TabButton
            active={activeTab === 'inboundConnectors'}
            onClick={() => setActiveTab('inboundConnectors')}
            icon={ArrowRightLeft}
            label={`Inbound (${statistics.totalInboundConnectors || 0})`}
          />
          <TabButton
            active={activeTab === 'outboundConnectors'}
            onClick={() => setActiveTab('outboundConnectors')}
            icon={ArrowRightLeft}
            label={`Outbound (${statistics.totalOutboundConnectors || 0})`}
          />
          <TabButton
            active={activeTab === 'dns'}
            onClick={() => setActiveTab('dns')}
            icon={Network}
            label={`DNS (${statistics.totalDnsRecords || 0})`}
          />
          <TabButton
            active={activeTab === 'dkim'}
            onClick={() => setActiveTab('dkim')}
            icon={Key}
            label={`DKIM (${statistics.totalDkimConfigs || 0})`}
          />
          <TabButton
            active={activeTab === 'antiSpam'}
            onClick={() => setActiveTab('antiSpam')}
            icon={AlertTriangle}
            label={`Anti-Spam (${statistics.totalAntiSpamPolicies || 0})`}
          />
          <TabButton
            active={activeTab === 'antiPhish'}
            onClick={() => setActiveTab('antiPhish')}
            icon={Shield}
            label={`Anti-Phish (${statistics.totalAntiPhishPolicies || 0})`}
          />
          <TabButton
            active={activeTab === 'malware'}
            onClick={() => setActiveTab('malware')}
            icon={Bug}
            label={`Malware (${statistics.totalMalwarePolicies || 0})`}
          />
          <TabButton
            active={activeTab === 'migrationBatches'}
            onClick={() => setActiveTab('migrationBatches')}
            icon={Plane}
            label={`Migration (${statistics.totalMigrationBatches || 0})`}
          />
          <TabButton
            active={activeTab === 'domains'}
            onClick={() => setActiveTab('domains')}
            icon={Globe}
            label={`Domains (${statistics.totalDomains})`}
          />
        </div>
      </div>

      {/* Search - Only for data tabs */}
      {activeTab !== 'overview' && (
        <div className="px-6 py-4 flex-shrink-0">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2 pl-4 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 pt-4">
            {/* Statistics Cards Grid (3 rows × 4 columns = 12 cards) */}
            <div className="grid grid-cols-4 gap-4">
              <DiscoverySuccessCard
                percentage={statistics.discoverySuccessPercentage || 0}
                received={statistics.dataSourcesReceivedCount || 0}
                total={statistics.dataSourcesTotal || 14}
              />
              <StatCard
                icon={Mail}
                label="Total Mailboxes"
                value={statistics.totalMailboxes}
                gradient="from-sky-500 to-sky-600"
              />
              <StatCard
                icon={Users}
                label="Distribution Groups"
                value={statistics.totalGroups}
                gradient="from-green-500 to-green-600"
              />
              <StatCard
                icon={Workflow}
                label="Transport Rules"
                value={statistics.totalTransportRules || 0}
                gradient="from-purple-500 to-purple-600"
              />

              {/* Row 2: Mail Flow */}
              <StatCard
                icon={Globe}
                label="Accepted Domains"
                value={statistics.totalDomains}
                gradient="from-indigo-500 to-indigo-600"
              />
              <StatCard
                icon={Network}
                label="Remote Domains"
                value={statistics.totalRemoteDomains || 0}
                gradient="from-cyan-500 to-cyan-600"
              />
              <StatCard
                icon={Server}
                label="3rd Party Gateways"
                value={statistics.thirdPartyGatewayDomains || 0}
                gradient="from-emerald-500 to-emerald-600"
              />
              <StatCard
                icon={Key}
                label="DKIM Enabled"
                value={statistics.enabledDkim || 0}
                gradient="from-orange-500 to-orange-600"
              />

              {/* Row 3: Security & Migration */}
              <StatCard
                icon={Shield}
                label="Security Policies"
                value={(statistics.totalAntiSpamPolicies || 0) + (statistics.totalAntiPhishPolicies || 0) + (statistics.totalMalwarePolicies || 0)}
                gradient="from-rose-500 to-rose-600"
              />
              <StatCard
                icon={Plane}
                label="Migration Batches"
                value={statistics.totalMigrationBatches || 0}
                gradient="from-violet-500 to-violet-600"
              />
              <StatCard
                icon={CheckCircle2}
                label="Active Mailboxes"
                value={statistics.activeMailboxes}
                gradient="from-teal-500 to-teal-600"
              />
              <StatCard
                icon={Archive}
                label="With Archive"
                value={statistics.mailboxesWithArchive}
                gradient="from-pink-500 to-pink-600"
              />
            </div>

            {/* Breakdown Panels */}
            <OverviewBreakdownPanels statistics={statistics} />
          </div>
        )}

        {activeTab === 'mailboxes' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid
              data={filteredMailboxes}
              columns={mailboxColumns}
              enableFiltering={true}
              enableColumnResize={true}
            />
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid data={filteredGroups} columns={groupColumns} enableFiltering={true} enableColumnResize={true} />
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid data={filteredContacts} columns={contactColumns} enableFiltering={true} enableColumnResize={true} />
          </div>
        )}

        {activeTab === 'domains' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid data={filteredDomains} columns={domainColumns} enableFiltering={true} enableColumnResize={true} />
          </div>
        )}

        {activeTab === 'transportRules' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid data={filteredTransportRules} columns={transportRuleColumns} enableFiltering={true} enableColumnResize={true} />
          </div>
        )}

        {activeTab === 'inboundConnectors' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid data={filteredInboundConnectors} columns={inboundConnectorColumns} enableFiltering={true} enableColumnResize={true} />
          </div>
        )}

        {activeTab === 'outboundConnectors' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid data={filteredOutboundConnectors} columns={outboundConnectorColumns} enableFiltering={true} enableColumnResize={true} />
          </div>
        )}

        {activeTab === 'dns' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid data={filteredDnsRecords} columns={dnsRecordColumns} enableFiltering={true} enableColumnResize={true} />
          </div>
        )}

        {activeTab === 'dkim' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid data={filteredDkimConfigs} columns={dkimConfigColumns} enableFiltering={true} enableColumnResize={true} />
          </div>
        )}

        {activeTab === 'antiSpam' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid data={filteredAntiSpamPolicies} columns={antiSpamPolicyColumns} enableFiltering={true} enableColumnResize={true} />
          </div>
        )}

        {activeTab === 'antiPhish' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid data={filteredAntiPhishPolicies} columns={antiPhishPolicyColumns} enableFiltering={true} enableColumnResize={true} />
          </div>
        )}

        {activeTab === 'malware' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid data={filteredMalwarePolicies} columns={malwarePolicyColumns} enableFiltering={true} enableColumnResize={true} />
          </div>
        )}

        {activeTab === 'migrationBatches' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid data={filteredMigrationBatches} columns={migrationBatchColumns} enableFiltering={true} enableColumnResize={true} />
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, gradient }) => {
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

// Discovery Success Card - special card showing % of data sources retrieved
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

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<any>;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
        active
          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
};

interface OverviewBreakdownPanelsProps {
  statistics: any;
}

const OverviewBreakdownPanels: React.FC<OverviewBreakdownPanelsProps> = ({ statistics }) => {
  return (
    <div className="grid grid-cols-2 gap-6">
        {/* Mailbox Breakdown */}
        <BreakdownPanel
          title="Mailbox Breakdown"
          icon={Mail}
          items={[
            { label: 'Active Mailboxes', value: statistics.activeMailboxes || 0, total: statistics.totalMailboxes || 1 },
            { label: 'Inactive Mailboxes', value: statistics.inactiveMailboxes || 0, total: statistics.totalMailboxes || 1 },
            { label: 'With Archive', value: statistics.mailboxesWithArchive || 0, total: statistics.totalMailboxes || 1 },
            { label: 'With Forwarding', value: statistics.mailboxesWithForwarding || 0, total: statistics.totalMailboxes || 1 },
            { label: 'Litigation Hold', value: statistics.mailboxesWithLitigationHold || 0, total: statistics.totalMailboxes || 1 },
          ]}
        />

        {/* Mail Flow Configuration */}
        <BreakdownPanel
          title="Mail Flow Configuration"
          icon={Workflow}
          items={[
            { label: 'Transport Rules', value: statistics.totalTransportRules || 0, total: Math.max(statistics.totalTransportRules || 1, 1) },
            { label: 'Enabled Rules', value: statistics.enabledTransportRules || 0, total: statistics.totalTransportRules || 1 },
            { label: 'Inbound Connectors', value: statistics.totalInboundConnectors || 0, total: Math.max((statistics.totalInboundConnectors || 0) + (statistics.totalOutboundConnectors || 0), 1) },
            { label: 'Outbound Connectors', value: statistics.totalOutboundConnectors || 0, total: Math.max((statistics.totalInboundConnectors || 0) + (statistics.totalOutboundConnectors || 0), 1) },
            { label: 'Remote Domains', value: statistics.totalRemoteDomains || 0, total: Math.max(statistics.totalRemoteDomains || 1, 1) },
          ]}
        />

        {/* DNS & Email Authentication */}
        <BreakdownPanel
          title="DNS & Email Authentication"
          icon={Network}
          items={[
            { label: 'Domains with SPF', value: statistics.domainsWithSpf || 0, total: statistics.totalDnsRecords || 1 },
            { label: 'Domains with DKIM', value: statistics.domainsWithDkim || 0, total: statistics.totalDnsRecords || 1 },
            { label: 'Domains with DMARC', value: statistics.domainsWithDmarc || 0, total: statistics.totalDnsRecords || 1 },
            { label: 'DKIM Enabled', value: statistics.enabledDkim || 0, total: statistics.totalDkimConfigs || 1 },
            { label: 'Third-Party Gateways', value: statistics.thirdPartyGatewayDomains || 0, total: statistics.totalDnsRecords || 1 },
          ]}
        />

        {/* Security Policies */}
        <BreakdownPanel
          title="Security Policies"
          icon={Shield}
          items={[
            { label: 'Anti-Spam Policies', value: statistics.totalAntiSpamPolicies || 0, total: Math.max(statistics.totalAntiSpamPolicies || 1, 1) },
            { label: 'Anti-Phishing Policies', value: statistics.totalAntiPhishPolicies || 0, total: Math.max(statistics.totalAntiPhishPolicies || 1, 1) },
            { label: 'Malware Policies', value: statistics.totalMalwarePolicies || 0, total: Math.max(statistics.totalMalwarePolicies || 1, 1) },
            { label: 'Retention Policies', value: statistics.totalRetentionPolicies || 0, total: Math.max(statistics.totalRetentionPolicies || 1, 1) },
            { label: 'Journal Rules', value: statistics.enabledJournalRules || 0, total: statistics.totalJournalRules || 1 },
          ]}
        />

        {/* Group Breakdown */}
        <BreakdownPanel
          title="Group Breakdown"
          icon={Users}
          items={[
            { label: 'Microsoft 365 Groups', value: statistics.m365Groups || 0, total: statistics.totalGroups || 1 },
            { label: 'Distribution Lists', value: statistics.distributionLists || 0, total: statistics.totalGroups || 1 },
            { label: 'Security Enabled', value: statistics.securityGroups || 0, total: statistics.totalGroups || 1 },
            { label: 'Mail Enabled', value: statistics.mailEnabledGroups || 0, total: statistics.totalGroups || 1 },
            { label: 'Public Groups', value: statistics.publicGroups || 0, total: statistics.totalGroups || 1 },
          ]}
        />

        {/* Migration Status */}
        <BreakdownPanel
          title="Migration Status"
          icon={Plane}
          items={[
            { label: 'Migration Endpoints', value: statistics.totalMigrationEndpoints || 0, total: Math.max(statistics.totalMigrationEndpoints || 1, 1) },
            { label: 'Total Batches', value: statistics.totalMigrationBatches || 0, total: Math.max(statistics.totalMigrationBatches || 1, 1) },
            { label: 'Active Batches', value: statistics.activeMigrationBatches || 0, total: statistics.totalMigrationBatches || 1 },
            { label: 'Completed Batches', value: statistics.completedMigrationBatches || 0, total: statistics.totalMigrationBatches || 1 },
            { label: 'Org Relationships', value: statistics.orgRelationshipsCount || 0, total: Math.max(statistics.orgRelationshipsCount || 1, 1) },
          ]}
        />
      </div>
  );
};

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

export default ExchangeDiscoveredView;
