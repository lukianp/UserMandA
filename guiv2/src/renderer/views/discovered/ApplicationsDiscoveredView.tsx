/**
 * Applications Catalog Discovered View
 *
 * Rich discovered view with statistics, breakdowns, and data grids
 * for application catalog data
 */

import React from 'react';
import {
  AppWindow,
  Users,
  Key,
  Shield,
  CheckCircle2,
  XCircle,
  FileText,
  Grid3x3,
  Monitor,
  Building2,
  Lock,
  Activity,
} from 'lucide-react';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { useApplicationsDiscoveredLogic } from '../../hooks/useApplicationsDiscoveredLogic';
import { DiscoverySuccessCard } from '../../components/molecules/DiscoverySuccessCard';

export const ApplicationsDiscoveredView: React.FC = () => {
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
    applications,
  } = useApplicationsDiscoveredLogic();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading applications data...</p>
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <AppWindow size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Applications Catalog
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Application inventory with permissions, owners, and security details
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
          icon={AppWindow}
          label="Total Applications"
          value={stats?.totalApplications ?? 0}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Enabled"
          value={stats?.enabledCount ?? 0}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={XCircle}
          label="Disabled"
          value={stats?.disabledCount ?? 0}
          gradient="from-red-500 to-red-600"
        />

        {/* Row 2 */}
        <StatCard
          icon={Users}
          label="With Owners"
          value={stats?.withOwners ?? 0}
          gradient="from-yellow-500 to-yellow-600"
        />
        <StatCard
          icon={Shield}
          label="With OAuth2 Grants"
          value={stats?.withOAuth2Grants ?? 0}
          gradient="from-indigo-500 to-indigo-600"
        />
        <StatCard
          icon={Lock}
          label="With App Roles"
          value={stats?.withAppRoles ?? 0}
          gradient="from-cyan-500 to-cyan-600"
        />
        <StatCard
          icon={Key}
          label="With Credentials"
          value={stats?.withCredentials ?? 0}
          gradient="from-emerald-500 to-emerald-600"
        />

        {/* Row 3 */}
        <StatCard
          icon={Grid3x3}
          label="Categories"
          value={stats?.byCategory?.length ?? 0}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          icon={Monitor}
          label="Platforms"
          value={stats?.byPlatform?.length ?? 0}
          gradient="from-rose-500 to-rose-600"
        />
        <StatCard
          icon={Activity}
          label="App Types"
          value={stats?.byAppType?.length ?? 0}
          gradient="from-violet-500 to-violet-600"
        />
        <StatCard
          icon={Building2}
          label="Publishers"
          value={stats?.byPublisher?.length ?? 0}
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
            active={activeTab === 'applications'}
            onClick={() => setActiveTab('applications')}
            icon={AppWindow}
            label={`Applications (${stats?.totalApplications ?? 0})`}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && stats && (
          <OverviewTab stats={stats} />
        )}

        {activeTab === 'applications' && (
          <div className="h-full flex flex-col p-6">
            {/* Search and Export */}
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search applications..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={() => exportToCSV(filteredData, 'applications-catalog.csv')}
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
                csvFileName="applications-catalog.csv"
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
        {/* By Category */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-blue-600" />
            Applications by Category
          </h3>
          <div className="space-y-3">
            {stats.byCategory?.slice(0, 8).map((item: { name: string; count: number }) => (
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
                    style={{ width: `${(item.count / stats.totalApplications) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Platform */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-purple-600" />
            Applications by Platform
          </h3>
          <div className="space-y-3">
            {stats.byPlatform?.slice(0, 8).map((item: { name: string; count: number }) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(item.count / stats.totalApplications) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By App Type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Applications by Type
          </h3>
          <div className="space-y-3">
            {stats.byAppType?.slice(0, 8).map((item: { name: string; count: number }) => (
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
                    style={{ width: `${(item.count / stats.totalApplications) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Security Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Security Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-600" />
                <span className="text-gray-700 dark:text-gray-300">With Owners</span>
              </div>
              <span className="font-bold text-yellow-600">{stats.withOwners}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span className="text-gray-700 dark:text-gray-300">With OAuth2 Grants</span>
              </div>
              <span className="font-bold text-indigo-600">{stats.withOAuth2Grants}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-600" />
                <span className="text-gray-700 dark:text-gray-300">With App Roles</span>
              </div>
              <span className="font-bold text-cyan-600">{stats.withAppRoles}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-600" />
                <span className="text-gray-700 dark:text-gray-300">With Credentials</span>
              </div>
              <span className="font-bold text-emerald-600">{stats.withCredentials}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsDiscoveredView;
