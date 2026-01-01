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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <Mail size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Exchange Online
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mailboxes, mail flow, security policies, DNS, and migration configuration
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid (3 rows × 4 columns = 12 cards) */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Discovery Success % Card - prominent first position */}
        <DiscoverySuccessCard
          percentage={statistics.discoverySuccessPercentage || 0}
          received={statistics.dataSourcesReceivedCount || 0}
          total={statistics.dataSourcesTotal || 14}
        />
        <StatCard
          icon={Mail}
          label="Total Mailboxes"
          value={statistics.totalMailboxes}
          gradient="from-blue-500 to-blue-600"
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

      {/* Tabs - Scrollable for many tabs */}
      <div className="px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
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

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && (
          <OverviewTab statistics={statistics} />
        )}

        {activeTab === 'mailboxes' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredMailboxes}
            columns={mailboxColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_mailboxes"
          />
        )}

        {activeTab === 'groups' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredGroups}
            columns={groupColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_groups"
          />
        )}

        {activeTab === 'contacts' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredContacts}
            columns={contactColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_contacts"
          />
        )}

        {activeTab === 'domains' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredDomains}
            columns={domainColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_domains"
          />
        )}

        {/* Mail Flow Tabs */}
        {activeTab === 'transportRules' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredTransportRules}
            columns={transportRuleColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_transport_rules"
          />
        )}

        {activeTab === 'inboundConnectors' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredInboundConnectors}
            columns={inboundConnectorColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_inbound_connectors"
          />
        )}

        {activeTab === 'outboundConnectors' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredOutboundConnectors}
            columns={outboundConnectorColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_outbound_connectors"
          />
        )}

        {/* DNS Tab */}
        {activeTab === 'dns' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredDnsRecords}
            columns={dnsRecordColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_dns_records"
          />
        )}

        {/* Security Tabs */}
        {activeTab === 'dkim' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredDkimConfigs}
            columns={dkimConfigColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_dkim"
          />
        )}

        {activeTab === 'antiSpam' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredAntiSpamPolicies}
            columns={antiSpamPolicyColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_antispam"
          />
        )}

        {activeTab === 'antiPhish' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredAntiPhishPolicies}
            columns={antiPhishPolicyColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_antiphish"
          />
        )}

        {activeTab === 'malware' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredMalwarePolicies}
            columns={malwarePolicyColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_malware"
          />
        )}

        {/* Migration Tab */}
        {activeTab === 'migrationBatches' && (
          <DataTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            data={filteredMigrationBatches}
            columns={migrationBatchColumns}
            exportToCSV={exportToCSV}
            csvFileName="exchange_migration_batches"
          />
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
      className={`
        flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2
        ${active
          ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }
      `}
    >
      <Icon size={16} />
      {label}
    </button>
  );
};

interface DataTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  data: any[];
  columns: any[];
  exportToCSV: () => void;
  csvFileName: string;
}

const DataTab: React.FC<DataTabProps> = ({
  searchTerm,
  setSearchTerm,
  data,
  columns,
  exportToCSV,
  csvFileName,
}) => {
  return (
    <div className="h-full flex flex-col p-6">
      {/* Search and Export */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        />
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Data Grid */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <VirtualizedDataGrid
          data={data}
          columns={columns}
          enableFiltering={true}
          enableColumnResize={true}
        />
      </div>
    </div>
  );
};

interface OverviewTabProps {
  statistics: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ statistics }) => {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
