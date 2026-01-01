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
    filteredMailboxes,
    filteredGroups,
    filteredContacts,
    filteredDomains,
    mailboxColumns,
    groupColumns,
    contactColumns,
    domainColumns,
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
              Mailboxes, distribution groups, mail contacts, and accepted domains
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid (3 rows × 4 columns = 12 cards) */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1: Primary metrics */}
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
          icon={Globe}
          label="Accepted Domains"
          value={statistics.totalDomains}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          icon={UserCheck}
          label="Mail Contacts"
          value={statistics.totalContacts}
          gradient="from-yellow-500 to-yellow-600"
        />

        {/* Row 2: Mailbox details */}
        <StatCard
          icon={CheckCircle2}
          label="Active Mailboxes"
          value={statistics.activeMailboxes}
          gradient="from-indigo-500 to-indigo-600"
        />
        <StatCard
          icon={Archive}
          label="With Archive"
          value={statistics.mailboxesWithArchive}
          gradient="from-cyan-500 to-cyan-600"
        />
        <StatCard
          icon={HardDrive}
          label="Total Size (MB)"
          value={statistics.totalMailboxSizeMB}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={FileText}
          label="Total Items"
          value={statistics.totalItems}
          gradient="from-orange-500 to-orange-600"
        />

        {/* Row 3: Advanced metrics */}
        <StatCard
          icon={Forward}
          label="With Forwarding"
          value={statistics.mailboxesWithForwarding}
          gradient="from-rose-500 to-rose-600"
        />
        <StatCard
          icon={Lock}
          label="Litigation Hold"
          value={statistics.mailboxesWithLitigationHold}
          gradient="from-violet-500 to-violet-600"
        />
        <StatCard
          icon={Shield}
          label="Delegated Access"
          value={statistics.mailboxesWithDelegatedAccess}
          gradient="from-teal-500 to-teal-600"
        />
        <StatCard
          icon={Building2}
          label="M365 Groups"
          value={statistics.m365Groups}
          gradient="from-pink-500 to-pink-600"
        />
      </div>

      {/* Tabs */}
      <div className="px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
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
            active={activeTab === 'contacts'}
            onClick={() => setActiveTab('contacts')}
            icon={UserCheck}
            label={`Contacts (${statistics.totalContacts})`}
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
