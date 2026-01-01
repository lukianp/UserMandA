/**
 * OneDrive Discovered View
 *
 * Rich discovered view with statistics, breakdowns, and data grids for OneDrive for Business
 * Displays users with/without OneDrive, sites, files, and sharing links
 */

import React from 'react';
import {
  Cloud,
  Users,
  UserCheck,
  UserX,
  HardDrive,
  FileText,
  FolderOpen,
  Share2,
  ExternalLink,
  Link,
  AlertTriangle,
  ShieldAlert,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Building2,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { useOneDriveDiscoveredLogic, formatBytes } from '../../hooks/useOneDriveDiscoveredLogic';

export const OneDriveDiscoveredView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    filter,
    updateFilter,
    isLoading,
    error,
    enhancedStats,
    statistics,
    // Data
    users,
    usersWithoutOneDrive,
    sites,
    items,
    sharingLinks,
    // Columns
    userColumns,
    usersWithoutOneDriveColumns,
    siteColumns,
    itemColumns,
    sharingColumns,
    // Actions
    exportToCSV,
    reloadData,
  } = useOneDriveDiscoveredLogic();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading OneDrive data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <div className="w-12 h-12 mx-auto mb-4">
            <XCircle size={48} />
          </div>
          <p>Error loading data: {error}</p>
          <button
            onClick={reloadData}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg">
              <Cloud size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                OneDrive for Business
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Personal cloud storage, files, sharing, and provisioning status
              </p>
            </div>
          </div>
          <button
            onClick={reloadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards Grid (3 rows x 4 columns = 12 cards) */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1: Adoption & Users */}
        <AdoptionCard
          percentage={enhancedStats.adoptionRate}
          withOneDrive={enhancedStats.usersWithOneDrive}
          total={enhancedStats.totalUsers}
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={enhancedStats.totalUsers}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={UserCheck}
          label="With OneDrive"
          value={enhancedStats.usersWithOneDrive}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={UserX}
          label="Without OneDrive"
          value={enhancedStats.usersWithoutOneDrive}
          gradient="from-yellow-500 to-amber-600"
        />

        {/* Row 2: Storage & Files */}
        <StatCard
          icon={HardDrive}
          label="Storage Used"
          value={enhancedStats.totalStorageUsed}
          suffix=" GB"
          gradient="from-indigo-500 to-indigo-600"
        />
        <StatCard
          icon={FileText}
          label="Total Files"
          value={enhancedStats.totalFiles}
          gradient="from-cyan-500 to-cyan-600"
        />
        <StatCard
          icon={FolderOpen}
          label="Total Folders"
          value={enhancedStats.totalFolders}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Storage Usage"
          value={enhancedStats.storageUsagePercent}
          suffix="%"
          gradient="from-orange-500 to-orange-600"
        />

        {/* Row 3: Sharing & Security */}
        <StatCard
          icon={Share2}
          label="Shared Items"
          value={enhancedStats.totalShares}
          gradient="from-rose-500 to-rose-600"
        />
        <StatCard
          icon={ExternalLink}
          label="External Shares"
          value={enhancedStats.externalShares}
          gradient="from-violet-500 to-violet-600"
        />
        <StatCard
          icon={Link}
          label="Anonymous Links"
          value={enhancedStats.anonymousLinks}
          gradient="from-teal-500 to-teal-600"
        />
        <StatCard
          icon={ShieldAlert}
          label="High Risk Shares"
          value={enhancedStats.highRiskShares}
          gradient="from-pink-500 to-pink-600"
        />
      </div>

      {/* Tabs */}
      <div className="px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={FileText}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={UserCheck}
            label={`With OneDrive (${users.length})`}
          />
          <TabButton
            active={activeTab === 'usersWithoutOneDrive'}
            onClick={() => setActiveTab('usersWithoutOneDrive')}
            icon={UserX}
            label={`Without OneDrive (${usersWithoutOneDrive.length})`}
          />
          <TabButton
            active={activeTab === 'sites'}
            onClick={() => setActiveTab('sites')}
            icon={Globe}
            label={`Sites (${sites.length})`}
          />
          <TabButton
            active={activeTab === 'files'}
            onClick={() => setActiveTab('files')}
            icon={FileText}
            label={`Files (${items.length})`}
          />
          <TabButton
            active={activeTab === 'sharing'}
            onClick={() => setActiveTab('sharing')}
            icon={Share2}
            label={`Sharing (${sharingLinks.length})`}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && (
          <OverviewTab enhancedStats={enhancedStats} statistics={statistics} />
        )}

        {activeTab === 'users' && (
          <DataTab
            searchTerm={filter.searchText}
            setSearchTerm={(text) => updateFilter({ searchText: text })}
            data={users}
            columns={userColumns}
            exportToCSV={() => exportToCSV('users')}
            emptyMessage="No users with OneDrive found. OneDrive may not be provisioned for this tenant."
          />
        )}

        {activeTab === 'usersWithoutOneDrive' && (
          <DataTab
            searchTerm={filter.searchText}
            setSearchTerm={(text) => updateFilter({ searchText: text })}
            data={usersWithoutOneDrive}
            columns={usersWithoutOneDriveColumns}
            exportToCSV={() => exportToCSV('usersWithoutOneDrive')}
            emptyMessage="All users have OneDrive access."
          />
        )}

        {activeTab === 'sites' && (
          <DataTab
            searchTerm={filter.searchText}
            setSearchTerm={(text) => updateFilter({ searchText: text })}
            data={sites}
            columns={siteColumns}
            exportToCSV={() => exportToCSV('sites')}
            emptyMessage="No OneDrive sites discovered."
          />
        )}

        {activeTab === 'files' && (
          <DataTab
            searchTerm={filter.searchText}
            setSearchTerm={(text) => updateFilter({ searchText: text })}
            data={items}
            columns={itemColumns}
            exportToCSV={() => exportToCSV('items')}
            emptyMessage="No files discovered."
          />
        )}

        {activeTab === 'sharing' && (
          <DataTab
            searchTerm={filter.searchText}
            setSearchTerm={(text) => updateFilter({ searchText: text })}
            data={sharingLinks}
            columns={sharingColumns}
            exportToCSV={() => exportToCSV('sharing')}
            emptyMessage="No sharing links discovered."
          />
        )}
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  suffix?: string;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, suffix = '', gradient }) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{label}</p>
          <p className="text-3xl font-bold mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        <Icon size={40} className="opacity-80" />
      </div>
    </div>
  );
};

// Adoption Card - special card for OneDrive adoption rate
interface AdoptionCardProps {
  percentage: number;
  withOneDrive: number;
  total: number;
}

const AdoptionCard: React.FC<AdoptionCardProps> = ({ percentage, withOneDrive, total }) => {
  const getGradient = () => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-amber-600';
    if (percentage >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getIcon = () => {
    if (percentage >= 80) return CheckCircle;
    if (percentage >= 40) return TrendingUp;
    return AlertTriangle;
  };

  const Icon = getIcon();

  return (
    <div className={`bg-gradient-to-br ${getGradient()} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">OneDrive Adoption</p>
          <p className="text-3xl font-bold mt-2">{percentage}%</p>
          <p className="text-xs opacity-75 mt-1">{withOneDrive}/{total} users</p>
        </div>
        <Icon size={40} className="opacity-80" />
      </div>
    </div>
  );
};

// Tab Button Component
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

// Data Tab Component
interface DataTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  data: any[];
  columns: any[];
  exportToCSV: () => void;
  emptyMessage?: string;
}

const DataTab: React.FC<DataTabProps> = ({
  searchTerm,
  setSearchTerm,
  data,
  columns,
  exportToCSV,
  emptyMessage = 'No data available.',
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
          disabled={data.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Data Grid or Empty State */}
      {data.length > 0 ? (
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <VirtualizedDataGrid
            data={data}
            columns={columns}
            enableFiltering={true}
            enableColumnResize={true}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Cloud size={48} className="mx-auto mb-4 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Overview Tab Component
interface OverviewTabProps {
  enhancedStats: any;
  statistics: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ enhancedStats, statistics }) => {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* User Status Breakdown */}
        <BreakdownPanel
          title="User OneDrive Status"
          icon={Users}
          items={[
            { label: 'Users WITH OneDrive', value: enhancedStats.usersWithOneDrive, total: enhancedStats.totalUsers },
            { label: 'No License', value: enhancedStats.statusBreakdown?.NoLicense || 0, total: enhancedStats.usersWithoutOneDrive || 1 },
            { label: 'Not Provisioned', value: enhancedStats.statusBreakdown?.NotProvisioned || 0, total: enhancedStats.usersWithoutOneDrive || 1 },
            { label: 'Access Denied', value: enhancedStats.statusBreakdown?.AccessDenied || 0, total: enhancedStats.usersWithoutOneDrive || 1 },
            { label: 'Errors', value: enhancedStats.statusBreakdown?.Error || 0, total: enhancedStats.usersWithoutOneDrive || 1 },
          ]}
        />

        {/* Storage Breakdown */}
        <BreakdownPanel
          title="Storage Overview"
          icon={HardDrive}
          items={[
            { label: 'Total Storage Used', value: enhancedStats.totalStorageUsed, total: enhancedStats.totalStorageQuota || 1, suffix: ' GB' },
            { label: 'Storage Available', value: (enhancedStats.totalStorageQuota || 0) - (enhancedStats.totalStorageUsed || 0), total: enhancedStats.totalStorageQuota || 1, suffix: ' GB' },
            { label: 'High Storage Users (>80%)', value: enhancedStats.highStorageUsers, total: enhancedStats.usersWithOneDrive || 1 },
            { label: 'Inactive Users (90+ days)', value: enhancedStats.inactiveUsers, total: enhancedStats.usersWithOneDrive || 1 },
          ]}
        />

        {/* Sharing & Security */}
        <BreakdownPanel
          title="Sharing & Security"
          icon={Share2}
          items={[
            { label: 'Total Shared Items', value: enhancedStats.totalShares, total: Math.max(enhancedStats.totalShares, 1) },
            { label: 'External Shares', value: enhancedStats.externalShares, total: enhancedStats.totalShares || 1 },
            { label: 'Anonymous Links', value: enhancedStats.anonymousLinks, total: enhancedStats.totalShares || 1 },
            { label: 'High Risk', value: enhancedStats.riskBreakdown?.High || 0, total: enhancedStats.totalShares || 1 },
            { label: 'Medium Risk', value: enhancedStats.riskBreakdown?.Medium || 0, total: enhancedStats.totalShares || 1 },
          ]}
        />

        {/* File Type Breakdown */}
        {Object.keys(enhancedStats.fileTypeCounts || {}).length > 0 && (
          <BreakdownPanel
            title="File Types"
            icon={FileText}
            items={Object.entries(enhancedStats.fileTypeCounts || {})
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 5)
              .map(([category, count]) => ({
                label: category,
                value: count as number,
                total: enhancedStats.totalFiles || 1,
              }))}
          />
        )}

        {/* Department Breakdown */}
        {Object.keys(enhancedStats.departmentCounts || {}).length > 0 && (
          <BreakdownPanel
            title="Users by Department"
            icon={Building2}
            items={Object.entries(enhancedStats.departmentCounts || {})
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 5)
              .map(([dept, count]) => ({
                label: dept,
                value: count as number,
                total: enhancedStats.totalUsers || 1,
              }))}
          />
        )}

        {/* Top Storage Users */}
        {(enhancedStats.topStorageUsers || []).length > 0 && (
          <TopUsersPanel
            title="Top Storage Users"
            icon={TrendingUp}
            users={enhancedStats.topStorageUsers.slice(0, 5)}
          />
        )}

        {/* Discovery Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
              <Clock size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Discovery Info</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tenant</span>
              <span className="font-medium text-gray-900 dark:text-white">{statistics?.TenantName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Discovery</span>
              <span className="font-medium text-gray-900 dark:text-white">{statistics?.DiscoveryTimestamp || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Users</span>
              <span className="font-medium text-gray-900 dark:text-white">{enhancedStats.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Drives</span>
              <span className="font-medium text-gray-900 dark:text-white">{statistics?.TotalDrives || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Adoption Rate</span>
              <span className="font-medium text-gray-900 dark:text-white">{enhancedStats.adoptionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Breakdown Panel Component
interface BreakdownPanelProps {
  title: string;
  icon: React.ComponentType<any>;
  items: Array<{ label: string; value: number; total: number; suffix?: string }>;
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
                {item.value.toLocaleString()}{item.suffix || ''}
                {item.total > 0 && !item.suffix && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    ({Math.round((item.value / item.total) * 100)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${item.total > 0 ? Math.min((item.value / item.total) * 100, 100) : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Top Users Panel
interface TopUsersPanelProps {
  title: string;
  icon: React.ComponentType<any>;
  users: Array<{ DisplayName: string; UserPrincipalName: string; UsedSize: number; UsagePercentage: number }>;
}

const TopUsersPanel: React.FC<TopUsersPanelProps> = ({ title, icon: Icon, users }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
          <Icon size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {users.map((user, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{user.DisplayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.UserPrincipalName}</p>
            </div>
            <div className="text-right ml-4">
              <p className="font-semibold text-gray-900 dark:text-white">{formatBytes(user.UsedSize)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.UsagePercentage?.toFixed(1) || 0}%</p>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No data available</p>
        )}
      </div>
    </div>
  );
};

export default OneDriveDiscoveredView;
