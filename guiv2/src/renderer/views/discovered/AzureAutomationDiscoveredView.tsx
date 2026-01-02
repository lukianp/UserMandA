/**
 * Azure Automation Accounts Discovered View
 *
 * Rich discovered view with statistics, breakdowns, and data grids
 * for Azure Automation Accounts including runbooks, schedules, and credentials
 */

import React from 'react';
import {
  Settings,
  Server,
  Play,
  Calendar,
  Key,
  Variable,
  MapPin,
  FolderTree,
  CheckCircle2,
  XCircle,
  FileText,
  Zap,
} from 'lucide-react';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { useAzureAutomationDiscoveredLogic } from '../../hooks/useAzureAutomationDiscoveredLogic';
import { DiscoverySuccessCard } from '../../components/molecules/DiscoverySuccessCard';

export const AzureAutomationDiscoveredView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchText,
    setSearchText,
    isLoading,
    error,
    filteredData,
    stats,
    columns,
    exportToCSV,
    accounts,
  } = useAzureAutomationDiscoveredLogic();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Azure Automation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <XCircle className="w-12 h-12 mx-auto mb-4" />
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
            <Zap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Azure Automation Accounts
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Automation accounts with runbooks, schedules, variables, and credentials
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid (3 rows × 4 columns = 12 cards) */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1 - Discovery Success FIRST */}
        <DiscoverySuccessCard
          percentage={stats?.discoverySuccessPercentage ?? 0}
          received={stats?.dataSourcesReceivedCount ?? 0}
          total={stats?.dataSourcesTotal ?? 1}
          showAnimation={true}
        />
        <StatCard
          icon={Server}
          label="Total Accounts"
          value={stats?.totalAccounts ?? 0}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={Play}
          label="Total Runbooks"
          value={stats?.totalRunbooks ?? 0}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={Calendar}
          label="Total Schedules"
          value={stats?.totalSchedules ?? 0}
          gradient="from-purple-500 to-purple-600"
        />

        {/* Row 2 */}
        <StatCard
          icon={Key}
          label="Total Credentials"
          value={stats?.totalCredentials ?? 0}
          gradient="from-yellow-500 to-yellow-600"
        />
        <StatCard
          icon={Variable}
          label="Total Variables"
          value={stats?.totalVariables ?? 0}
          gradient="from-indigo-500 to-indigo-600"
        />
        <StatCard
          icon={MapPin}
          label="Unique Locations"
          value={stats?.accountsByLocation?.length ?? 0}
          gradient="from-cyan-500 to-cyan-600"
        />
        <StatCard
          icon={FolderTree}
          label="Resource Groups"
          value={stats?.accountsByResourceGroup?.length ?? 0}
          gradient="from-emerald-500 to-emerald-600"
        />

        {/* Row 3 */}
        <StatCard
          icon={Settings}
          label="Runbook Types"
          value={stats?.runbookTypes?.length ?? 0}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          icon={Play}
          label="Avg Runbooks/Account"
          value={stats?.totalAccounts ? Math.round((stats?.totalRunbooks ?? 0) / stats.totalAccounts) : 0}
          gradient="from-rose-500 to-rose-600"
        />
        <StatCard
          icon={Calendar}
          label="Avg Schedules/Account"
          value={stats?.totalAccounts ? Math.round((stats?.totalSchedules ?? 0) / stats.totalAccounts) : 0}
          gradient="from-violet-500 to-violet-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active Accounts"
          value={accounts.filter(a => a.State === 'Ok' || !a.State).length}
          gradient="from-teal-500 to-teal-600"
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
            active={activeTab === 'accounts'}
            onClick={() => setActiveTab('accounts')}
            icon={Server}
            label={`Accounts (${stats?.totalAccounts ?? 0})`}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && stats && (
          <OverviewTab stats={stats} />
        )}

        {activeTab === 'accounts' && (
          <div className="h-full flex flex-col p-6">
            {/* Search and Export */}
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search accounts..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={() => exportToCSV(filteredData, 'azure-automation-accounts.csv')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Export CSV
              </button>
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={filteredData}
                columns={columns}
                enableFiltering={true}
                enableColumnResize={true}
                enableSorting={true}
                csvFileName="azure-automation-accounts.csv"
              />
            </div>
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
          <p className="text-sm opacity-90 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        </div>
        <Icon className="w-12 h-12 opacity-80" />
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
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
        active
          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );
};

interface OverviewTabProps {
  stats: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats }) => {
  return (
    <div className="p-6 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts by Location */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Accounts by Location
          </h3>
          <div className="space-y-3">
            {stats.accountsByLocation?.slice(0, 8).map((item: { name: string; count: number }) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(item.count / stats.totalAccounts) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accounts by Resource Group */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-purple-600" />
            Accounts by Resource Group
          </h3>
          <div className="space-y-3">
            {stats.accountsByResourceGroup?.slice(0, 8).map((item: { name: string; count: number }) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(item.count / stats.totalAccounts) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Runbook Types */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-green-600" />
            Runbook Types
          </h3>
          <div className="space-y-3">
            {stats.runbookTypes?.slice(0, 8).map((item: { name: string; count: number }) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(item.count / (stats.totalRunbooks || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {(!stats.runbookTypes || stats.runbookTypes.length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No runbook type data available</p>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-600" />
            Automation Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Total Automation Accounts</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.totalAccounts}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Total Runbooks</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.totalRunbooks}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Total Schedules</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.totalSchedules}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Total Credentials</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.totalCredentials}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Total Variables</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.totalVariables}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AzureAutomationDiscoveredView;
