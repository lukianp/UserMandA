/**
 * SharePoint Discovered View
 *
 * Rich discovered view with statistics, breakdowns, and data grids for SharePoint Online
 * Displays sites, lists, document libraries, and storage information
 */

import React from 'react';
import {
  Globe,
  FolderOpen,
  List,
  HardDrive,
  FileText,
  Building2,
  Eye,
  EyeOff,
  Database,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Share2,
  LayoutGrid,
  FileType,
  Package,
  Shield,
  Link2,
  UserCog,
} from 'lucide-react';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { useSharePointDiscoveredLogic } from '../../hooks/useSharePointDiscoveredLogic';

export const SharepointDiscoveredView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchText,
    setSearchText,
    isLoading,
    error,
    statistics,
    // Data
    sites,
    lists,
    contentTypes,
    permissions,
    sharingLinks,
    siteAdmins,
    hubSites,
    // Columns
    siteColumns,
    listColumns,
    contentTypeColumns,
    permissionColumns,
    sharingLinkColumns,
    siteAdminColumns,
    hubSiteColumns,
    // Actions
    exportToCSV,
    reloadData,
  } = useSharePointDiscoveredLogic();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading SharePoint data...</p>
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
              <Share2 size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SharePoint Online
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sites, document libraries, lists, and storage usage
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
        {/* Row 1: Discovery Success & Primary Metrics */}
        <DiscoverySuccessCard
          percentage={statistics.discoverySuccessPercentage}
          received={statistics.dataSourcesReceivedCount}
          total={statistics.dataSourcesTotal}
        />
        <StatCard
          icon={Globe}
          label="Total Sites"
          value={statistics.totalSites}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={List}
          label="Total Lists"
          value={statistics.totalLists}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={FileText}
          label="Total Items"
          value={statistics.totalItems}
          gradient="from-purple-500 to-purple-600"
        />

        {/* Row 2: Site & Content Type Breakdown */}
        <StatCard
          icon={Building2}
          label="Team Sites"
          value={statistics.teamSites}
          gradient="from-indigo-500 to-indigo-600"
        />
        <StatCard
          icon={FileType}
          label="Content Types"
          value={statistics.totalContentTypes || 0}
          gradient="from-cyan-500 to-cyan-600"
        />
        <StatCard
          icon={FolderOpen}
          label="Document Libraries"
          value={statistics.documentLibraries}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={Package}
          label="Custom Types"
          value={statistics.customContentTypes || 0}
          gradient="from-orange-500 to-orange-600"
        />

        {/* Row 3: Storage & List Visibility */}
        <StatCard
          icon={HardDrive}
          label="Storage Used"
          value={statistics.totalStorageUsedGB}
          suffix=" GB"
          gradient="from-rose-500 to-rose-600"
        />
        <StatCard
          icon={Database}
          label="Storage Quota"
          value={statistics.totalStorageQuotaGB}
          suffix=" GB"
          gradient="from-violet-500 to-violet-600"
        />
        <StatCard
          icon={Eye}
          label="Visible Lists"
          value={statistics.visibleLists}
          gradient="from-teal-500 to-teal-600"
        />
        <StatCard
          icon={EyeOff}
          label="Hidden Lists"
          value={statistics.hiddenLists}
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
            active={activeTab === 'sites'}
            onClick={() => setActiveTab('sites')}
            icon={Globe}
            label={`Sites (${sites.length})`}
          />
          <TabButton
            active={activeTab === 'lists'}
            onClick={() => setActiveTab('lists')}
            icon={List}
            label={`Lists (${lists.length})`}
          />
          <TabButton
            active={activeTab === 'permissions'}
            onClick={() => setActiveTab('permissions')}
            icon={Shield}
            label={`Permissions (${permissions.length})`}
          />
          <TabButton
            active={activeTab === 'contentTypes'}
            onClick={() => setActiveTab('contentTypes')}
            icon={FileType}
            label={`Content Types (${contentTypes.length})`}
          />
          <TabButton
            active={activeTab === 'sharing'}
            onClick={() => setActiveTab('sharing')}
            icon={Link2}
            label={`Sharing (${sharingLinks.length})`}
          />
          <TabButton
            active={activeTab === 'admins'}
            onClick={() => setActiveTab('admins')}
            icon={UserCog}
            label={`Admins (${siteAdmins.length})`}
          />
          <TabButton
            active={activeTab === 'hubs'}
            onClick={() => setActiveTab('hubs')}
            icon={Building2}
            label={`Hubs (${hubSites.length})`}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && (
          <OverviewTab statistics={statistics} />
        )}

        {activeTab === 'sites' && (
          <DataTab
            searchTerm={searchText}
            setSearchTerm={setSearchText}
            data={sites}
            columns={siteColumns}
            exportToCSV={() => exportToCSV('sites')}
            emptyMessage="No SharePoint sites discovered. Run SharePoint discovery first."
          />
        )}

        {activeTab === 'lists' && (
          <DataTab
            searchTerm={searchText}
            setSearchTerm={setSearchText}
            data={lists}
            columns={listColumns}
            exportToCSV={() => exportToCSV('lists')}
            emptyMessage="No lists or libraries discovered."
          />
        )}

        {activeTab === 'permissions' && (
          <DataTab
            searchTerm={searchText}
            setSearchTerm={setSearchText}
            data={permissions}
            columns={permissionColumns}
            exportToCSV={() => exportToCSV('permissions')}
            emptyMessage="No permissions discovered. This may require SharePoint Admin permissions on the app registration."
          />
        )}

        {activeTab === 'contentTypes' && (
          <DataTab
            searchTerm={searchText}
            setSearchTerm={setSearchText}
            data={contentTypes}
            columns={contentTypeColumns}
            exportToCSV={() => exportToCSV('contentTypes')}
            emptyMessage="No content types discovered."
          />
        )}

        {activeTab === 'sharing' && (
          <DataTab
            searchTerm={searchText}
            setSearchTerm={setSearchText}
            data={sharingLinks}
            columns={sharingLinkColumns}
            exportToCSV={() => exportToCSV('sharing')}
            emptyMessage="No sharing links discovered. This may indicate no external sharing is enabled, or requires SharePoint Admin permissions."
          />
        )}

        {activeTab === 'admins' && (
          <DataTab
            searchTerm={searchText}
            setSearchTerm={setSearchText}
            data={siteAdmins}
            columns={siteAdminColumns}
            exportToCSV={() => exportToCSV('admins')}
            emptyMessage="No site administrators discovered. This requires SharePoint Admin permissions on the app registration."
          />
        )}

        {activeTab === 'hubs' && (
          <DataTab
            searchTerm={searchText}
            setSearchTerm={setSearchText}
            data={hubSites}
            columns={hubSiteColumns}
            exportToCSV={() => exportToCSV('hubs')}
            emptyMessage="No hub sites discovered. This may indicate no hub sites are configured, or requires SharePoint Admin permissions."
          />
        )}
      </div>
    </div>
  );
};

// Discovery Success Card Component (MANDATORY - always first)
interface DiscoverySuccessCardProps {
  percentage: number;
  received: number;
  total: number;
}

const DiscoverySuccessCard: React.FC<DiscoverySuccessCardProps> = ({ percentage, received, total }) => {
  const getGradient = () => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-yellow-500 to-amber-600';
    if (percentage >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getIcon = () => {
    if (percentage >= 80) return CheckCircle2;
    if (percentage >= 60) return AlertTriangle;
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
          placeholder="Search sites, lists, URLs..."
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
            <Share2 size={48} className="mx-auto mb-4 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Overview Tab Component
interface OverviewTabProps {
  statistics: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ statistics }) => {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Site Type Breakdown */}
        <BreakdownPanel
          title="Site Type Distribution"
          icon={Globe}
          items={[
            { label: 'Team Sites', value: statistics.teamSites, total: statistics.totalSites },
            { label: 'Personal Sites', value: statistics.personalSites, total: statistics.totalSites },
            { label: 'Root Sites', value: statistics.rootSites, total: statistics.totalSites },
          ]}
        />

        {/* List Type Breakdown */}
        <BreakdownPanel
          title="List & Library Types"
          icon={List}
          items={[
            { label: 'Document Libraries', value: statistics.documentLibraries, total: statistics.totalLists },
            { label: 'Generic Lists', value: statistics.genericLists, total: statistics.totalLists },
            { label: 'Visible', value: statistics.visibleLists, total: statistics.totalLists },
            { label: 'Hidden', value: statistics.hiddenLists, total: statistics.totalLists },
          ]}
        />

        {/* Storage Overview */}
        <BreakdownPanel
          title="Storage Overview"
          icon={HardDrive}
          items={[
            { label: 'Storage Used', value: statistics.totalStorageUsedGB, total: statistics.totalStorageQuotaGB || 1, suffix: ' GB' },
            { label: 'Storage Available', value: (statistics.totalStorageQuotaGB || 0) - (statistics.totalStorageUsedGB || 0), total: statistics.totalStorageQuotaGB || 1, suffix: ' GB' },
            { label: 'Average Usage', value: Math.round(statistics.avgStoragePercent || 0), total: 100, suffix: '%' },
          ]}
        />

        {/* Content Type Breakdown */}
        {(statistics.totalContentTypes || 0) > 0 && (
          <BreakdownPanel
            title="Content Types"
            icon={FileType}
            items={[
              { label: 'Built-In Types', value: statistics.builtInContentTypes || 0, total: statistics.totalContentTypes || 1 },
              { label: 'Custom Types', value: statistics.customContentTypes || 0, total: statistics.totalContentTypes || 1 },
              { label: 'Hidden Types', value: statistics.hiddenContentTypes || 0, total: statistics.totalContentTypes || 1 },
            ]}
          />
        )}

        {/* Top Content Type Groups */}
        {statistics.topGroups && statistics.topGroups.length > 0 && (
          <BreakdownPanel
            title="Content Type Groups"
            icon={Package}
            items={statistics.topGroups.map((g: any) => ({
              label: g.group,
              value: g.count,
              total: statistics.totalContentTypes || 1,
            }))}
          />
        )}

        {/* Top Templates */}
        {statistics.topTemplates && statistics.topTemplates.length > 0 && (
          <BreakdownPanel
            title="List Templates"
            icon={LayoutGrid}
            items={statistics.topTemplates.map((t: any) => ({
              label: t.template,
              value: t.count,
              total: statistics.totalLists || 1,
            }))}
          />
        )}

        {/* Top Sites by Lists */}
        {statistics.topSitesByLists && statistics.topSitesByLists.length > 0 && (
          <TopSitesPanel
            title="Sites by List Count"
            icon={Building2}
            sites={statistics.topSitesByLists}
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
              <span className="text-gray-600 dark:text-gray-400">Total Sites</span>
              <span className="font-medium text-gray-900 dark:text-white">{statistics.totalSites}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Lists</span>
              <span className="font-medium text-gray-900 dark:text-white">{statistics.totalLists}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Items</span>
              <span className="font-medium text-gray-900 dark:text-white">{statistics.totalItems.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Storage Used</span>
              <span className="font-medium text-gray-900 dark:text-white">{statistics.totalStorageUsedGB.toFixed(2)} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Data Sources</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {statistics.dataSourcesReceivedCount}/{statistics.dataSourcesTotal}
              </span>
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
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${item.total > 0 ? Math.min((item.value / item.total) * 100, 100) : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Top Sites Panel
interface TopSitesPanelProps {
  title: string;
  icon: React.ComponentType<any>;
  sites: Array<{ DisplayName: string; WebUrl: string; listCount: number; StorageUsedGB: number }>;
}

const TopSitesPanel: React.FC<TopSitesPanelProps> = ({ title, icon: Icon, sites }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
          <Icon size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {sites.slice(0, 5).map((site, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{site.DisplayName || 'Unnamed Site'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{site.WebUrl}</p>
            </div>
            <div className="text-right ml-4">
              <p className="font-semibold text-gray-900 dark:text-white">{site.listCount} lists</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{(site.StorageUsedGB || 0).toFixed(2)} GB</p>
            </div>
          </div>
        ))}
        {sites.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No data available</p>
        )}
      </div>
    </div>
  );
};

export default SharepointDiscoveredView;
