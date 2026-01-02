/**
 * SharePoint Discovery View
 * Comprehensive UI for discovering SharePoint Online/On-Premises environments
 * Enhanced with rich results display matching the Discovered view style
 */

import * as React from 'react';
import {
  Download,
  Play,
  Square,
  Save,
  Settings,
  RefreshCw,
  FolderOpen,
  FileText,
  Shield,
  Activity,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Lock,
  Users,
  Globe,
  List,
  HardDrive,
  Eye,
  EyeOff,
  Building2,
  Share2,
  LayoutGrid,
} from 'lucide-react';

import { useSharePointDiscoveryLogic } from '../../hooks/useSharePointDiscoveryLogic';
import { useSharePointDiscoveredLogic } from '../../hooks/useSharePointDiscoveredLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import SearchBar from '../../components/molecules/SearchBar';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import ProgressBar from '../../components/molecules/ProgressBar';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

/**
 * SharePoint Discovery View Component
 */
const SharePointDiscoveryView: React.FC = () => {
  const {
    config,
    setConfig,
    result,
    isDiscovering,
    progress,
    error,
    templates,
    selectedTemplate,
    loadTemplate,
    saveAsTemplate,
    startDiscovery,
    cancelDiscovery,
    sites: discoverySites,
    lists: discoveryLists,
    permissions,
    siteFilter,
    setSiteFilter,
    listFilter,
    setListFilter,
    permissionFilter,
    setPermissionFilter,
    siteColumns: discoveryColumns,
    listColumns: discoveryListColumns,
    permissionColumns,
    exportData,
    selectedTab,
    setSelectedTab,
    statistics: discoveryStats,
    isCancelling,
    logs,
    showExecutionDialog,
    setShowExecutionDialog,
    clearLogs,
  } = useSharePointDiscoveryLogic();

  // Use discovered logic for rich results display after discovery completes
  const {
    sites: discoveredSites,
    lists: discoveredLists,
    statistics: richStats,
    siteColumns,
    listColumns,
    isLoading: discoveredLoading,
    reloadData,
  } = useSharePointDiscoveredLogic();

  // After discovery completes, use LIVE result data (not CSV files)
  // The result contains sites/lists extracted from the discovery response
  const hasLiveResults = result && (result.sites?.length > 0 || result.lists?.length > 0);
  const sites = hasLiveResults ? (result.sites || []) : (discoveredSites.length > 0 ? discoveredSites : discoverySites);
  const lists = hasLiveResults ? (result.lists || []) : (discoveredLists.length > 0 ? discoveredLists : discoveryLists);

  // v2.0.0 - New migration data types
  const sharingLinks = hasLiveResults ? (result.sharingLinks || []) : [];
  const contentTypes = hasLiveResults ? (result.contentTypes || []) : [];
  const hubSites = hasLiveResults ? (result.hubSites || []) : [];
  const siteAdmins = hasLiveResults ? (result.siteAdmins || []) : [];

  // Calculate live statistics from discovery result
  const liveStats = React.useMemo(() => {
    if (!hasLiveResults) return null;
    const liveSites = result.sites || [];
    const liveLists = result.lists || [];
    const liveContentTypes = result.contentTypes || [];
    const liveSharingLinks = result.sharingLinks || [];
    const liveSiteAdmins = result.siteAdmins || [];
    const liveHubSites = result.hubSites || [];
    const metadata = result.metadata || {};

    // Calculate discovery success percentage based on collected data sources
    const expectedSources = [
      { name: 'Sites', hasData: liveSites.length > 0, weight: 25 },
      { name: 'Lists', hasData: liveLists.length > 0, weight: 25 },
      { name: 'ContentTypes', hasData: liveContentTypes.length > 0, weight: 15 },
      { name: 'SharingLinks', hasData: true, weight: 10 },  // Absence is also information
      { name: 'SiteAdmins', hasData: liveSiteAdmins.length > 0, weight: 15 },
      { name: 'HubSites', hasData: true, weight: 10 },  // Absence is also information
    ];
    const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
    const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);
    const discoverySuccessPercentage = Math.round((achievedWeight / totalWeight) * 100);
    const dataSourcesReceivedCount = expectedSources.filter(s => s.hasData).length;

    return {
      totalSites: liveSites.length,
      totalLists: liveLists.length,
      totalItems: liveLists.reduce((sum: number, l: any) => sum + (l.ItemCount || 0), 0),
      teamSites: liveSites.filter((s: any) => !s.IsPersonalSite && s.DisplayName).length,
      personalSites: liveSites.filter((s: any) => s.IsPersonalSite).length,
      documentLibraries: liveLists.filter((l: any) => l.ListType === 'DocumentLibrary').length,
      genericLists: liveLists.filter((l: any) => l.ListType === 'List').length,
      totalStorageUsedGB: liveSites.reduce((sum: number, s: any) => sum + (s.StorageUsedGB || 0), 0),
      totalStorageQuotaGB: liveSites.reduce((sum: number, s: any) => sum + (s.StorageQuotaGB || 0), 0),
      visibleLists: liveLists.filter((l: any) => !l.Hidden).length,
      hiddenLists: liveLists.filter((l: any) => l.Hidden).length,
      discoverySuccessPercentage,
      dataSourcesReceivedCount,
      dataSourcesTotal: expectedSources.length,
      // From metadata
      elapsedSeconds: metadata.ElapsedTimeSeconds || 0,
      tenantName: metadata.TenantName || '',
      executionId: result.executionId || metadata.ExecutionId || '',
    };
  }, [hasLiveResults, result]);

  // Use live stats when available, otherwise CSV stats
  const statistics = liveStats || (richStats.totalSites > 0 ? richStats : discoveryStats);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="sharepoint-discovery-view" data-testid="sharepoint-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <FolderOpen size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                SharePoint Discovery
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Discover collaboration sites and content to plan modern workplace migrations and reduce licensing costs
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
                  enabled={config.discoverSites}
                  label="Sites"
                  icon={<FolderOpen className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.discoverLists}
                  label="Lists & Libraries"
                  icon={<FileText className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.discoverPermissions}
                  label="Permissions"
                  icon={<Shield className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.discoverContentTypes}
                  label="Content Types"
                  icon={<Database className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.discoverWorkflows}
                  label="Workflows"
                  icon={<Activity className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.detectExternalSharing}
                  label="External Sharing"
                  icon={<Users className="w-3 h-3" />}
                />
                <ConfigBadge
                  enabled={config.includeSiteMetrics}
                  label="Storage Metrics"
                  icon={<Database className="w-3 h-3" />}
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
                  {progress.phaseLabel || progress.currentItem || 'Processing...'}
                </span>
                <span className="text-sm text-purple-700 dark:text-purple-300">
                  {progress.percentComplete}% complete
                </span>
              </div>
              <ProgressBar value={progress.percentComplete} max={100} />
              <div className="mt-2 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400">
                <span>{progress.itemsProcessed} objects processed</span>
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
      {result && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Rich Statistics Cards - 3 rows × 4 columns */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Row 1 */}
              <DiscoverySuccessCard
                percentage={richStats?.discoverySuccessPercentage || 100}
                received={richStats?.dataSourcesReceivedCount || 2}
                total={richStats?.dataSourcesTotal || 2}
              />
              <RichStatCard
                icon={<Globe size={20} />}
                label="Total Sites"
                value={statistics?.totalSites || sites.length || 0}
                gradient="from-blue-500 to-blue-600"
              />
              <RichStatCard
                icon={<List size={20} />}
                label="Total Lists"
                value={statistics?.totalLists || lists.length || 0}
                gradient="from-purple-500 to-purple-600"
              />
              <RichStatCard
                icon={<FileText size={20} />}
                label="Total Items"
                value={richStats?.totalItems || 0}
                gradient="from-green-500 to-green-600"
              />

              {/* Row 2 */}
              <RichStatCard
                icon={<Building2 size={20} />}
                label="Team Sites"
                value={richStats?.teamSites || 0}
                gradient="from-indigo-500 to-indigo-600"
              />
              <RichStatCard
                icon={<Users size={20} />}
                label="Personal Sites"
                value={richStats?.personalSites || 0}
                gradient="from-cyan-500 to-cyan-600"
              />
              <RichStatCard
                icon={<FolderOpen size={20} />}
                label="Doc Libraries"
                value={richStats?.documentLibraries || 0}
                gradient="from-emerald-500 to-emerald-600"
              />
              <RichStatCard
                icon={<LayoutGrid size={20} />}
                label="Generic Lists"
                value={richStats?.genericLists || 0}
                gradient="from-orange-500 to-orange-600"
              />

              {/* Row 3 */}
              <RichStatCard
                icon={<HardDrive size={20} />}
                label="Storage Used"
                value={`${(richStats?.totalStorageUsedGB || 0).toFixed(0)} GB`}
                gradient="from-rose-500 to-rose-600"
              />
              <RichStatCard
                icon={<Database size={20} />}
                label="Storage Quota"
                value={`${((richStats?.totalStorageQuotaGB || 0) / 1024).toFixed(0)} TB`}
                gradient="from-violet-500 to-violet-600"
              />
              <RichStatCard
                icon={<Eye size={20} />}
                label="Visible Lists"
                value={richStats?.visibleLists || 0}
                gradient="from-teal-500 to-teal-600"
              />
              <RichStatCard
                icon={<EyeOff size={20} />}
                label="Hidden Lists"
                value={richStats?.hiddenLists || 0}
                gradient="from-pink-500 to-pink-600"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1 px-4 overflow-x-auto">
              <TabButton
                active={selectedTab === 'overview'}
                onClick={() => setSelectedTab('overview')}
                label="Overview"
                icon={<FolderOpen className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'sites'}
                onClick={() => setSelectedTab('sites')}
                label={`Sites (${sites?.length || 0})`}
                icon={<Globe className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'lists'}
                onClick={() => setSelectedTab('lists')}
                label={`Lists (${lists?.length || 0})`}
                icon={<FileText className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'permissions'}
                onClick={() => setSelectedTab('permissions')}
                label={`Permissions (${permissions?.length || 0})`}
                icon={<Shield className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'contentTypes'}
                onClick={() => setSelectedTab('contentTypes')}
                label={`Content Types (${contentTypes?.length || 0})`}
                icon={<Database className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'sharingLinks'}
                onClick={() => setSelectedTab('sharingLinks')}
                label={`Sharing (${sharingLinks?.length || 0})`}
                icon={<Share2 className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'siteAdmins'}
                onClick={() => setSelectedTab('siteAdmins')}
                label={`Admins (${siteAdmins?.length || 0})`}
                icon={<Users className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'hubSites'}
                onClick={() => setSelectedTab('hubSites')}
                label={`Hubs (${hubSites?.length || 0})`}
                icon={<Building2 className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Search and Actions */}
          {selectedTab !== 'overview' && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <SearchBar
                    value={
                      selectedTab === 'sites' ? siteFilter.searchText || '' :
                      selectedTab === 'lists' ? listFilter.searchText || '' :
                      permissionFilter.searchText || ''
                    }
                    onChange={(value) => {
                      if (selectedTab === 'sites') setSiteFilter({ ...siteFilter, searchText: value });
                      else if (selectedTab === 'lists') setListFilter({ ...listFilter, searchText: value });
                      else setPermissionFilter({ ...permissionFilter, searchText: value });
                    }}
                    placeholder={`Search ${selectedTab}...`}
                    data-cy="sharepoint-search" data-testid="sharepoint-search"
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
                    onClick={() => exportData({
                      format: 'Excel',
                      includeSites: true,
                      includeLists: true,
                      includePermissions: true,
                      includeContentTypes: false,
                      includeWorkflows: false,
                      includeStatistics: true,
                      splitByType: false
                    })}
                    data-cy="export-results-btn" data-testid="export-results-btn"
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
              <OverviewTab result={result} contentTypes={contentTypes} sharingLinks={sharingLinks} siteAdmins={siteAdmins} hubSites={hubSites} />
            ) : (
              <div className="h-full p-4">
                <VirtualizedDataGrid
                  data={getTabData(selectedTab, { sites, lists, permissions, contentTypes, sharingLinks, siteAdmins, hubSites })}
                  columns={getTabColumns(selectedTab, { siteColumns, listColumns, permissionColumns })}
                  loading={false}
                  enableExport
                  enableColumnReorder
                  enableFiltering
                  data-cy={`sharepoint-${selectedTab}-grid`}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !isDiscovering && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <FolderOpen className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Discovery Results
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure your SharePoint discovery settings and click "Start Discovery" to begin analyzing your SharePoint environment.
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
        scriptName="SharePoint Discovery"
        scriptDescription="Discovering SharePoint sites, lists, libraries, and permissions"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.percentComplete || 0,
          message: progress.phaseLabel || ''
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

/**
 * Helper function to get data for current tab
 */
function getTabData(tab: string, data: {
  sites: any[];
  lists: any[];
  permissions: any[];
  contentTypes: any[];
  sharingLinks: any[];
  siteAdmins: any[];
  hubSites: any[];
}): any[] {
  switch (tab) {
    case 'sites': return data.sites;
    case 'lists': return data.lists;
    case 'permissions': return data.permissions;
    case 'contentTypes': return data.contentTypes;
    case 'sharingLinks': return data.sharingLinks;
    case 'siteAdmins': return data.siteAdmins;
    case 'hubSites': return data.hubSites;
    default: return [];
  }
}

/**
 * Helper function to get columns for current tab
 */
function getTabColumns(tab: string, columns: {
  siteColumns: any[];
  listColumns: any[];
  permissionColumns: any[];
}): any[] {
  switch (tab) {
    case 'sites': return columns.siteColumns;
    case 'lists': return columns.listColumns;
    case 'permissions': return columns.permissionColumns;
    case 'contentTypes': return [
      { field: 'ContentTypeName', headerName: 'Content Type' },
      { field: 'Description', headerName: 'Description' },
      { field: 'Group', headerName: 'Group' },
      { field: 'IsCustom', headerName: 'Custom' },
      { field: 'ParentContentType', headerName: 'Parent Type' },
      { field: 'SiteName', headerName: 'Site' },
    ];
    case 'sharingLinks': return [
      { field: 'ResourceName', headerName: 'Resource' },
      { field: 'LinkType', headerName: 'Link Type' },
      { field: 'Scope', headerName: 'Scope' },
      { field: 'SharedWith', headerName: 'Shared With' },
      { field: 'HasPassword', headerName: 'Password Protected' },
      { field: 'ExpirationDate', headerName: 'Expires' },
      { field: 'SiteName', headerName: 'Site' },
    ];
    case 'siteAdmins': return [
      { field: 'AdminDisplayName', headerName: 'Admin' },
      { field: 'AdminEmail', headerName: 'Email' },
      { field: 'AdminType', headerName: 'Type' },
      { field: 'IsPrimaryAdmin', headerName: 'Primary' },
      { field: 'SiteName', headerName: 'Site' },
    ];
    case 'hubSites': return [
      { field: 'HubSiteName', headerName: 'Hub Name' },
      { field: 'HubSiteUrl', headerName: 'URL' },
      { field: 'Description', headerName: 'Description' },
      { field: 'AssociatedSitesCount', headerName: 'Associated Sites' },
      { field: 'IsRegistered', headerName: 'Registered' },
    ];
    default: return columns.siteColumns;
  }
}

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
 * Discovery Success Card Component - Shows data source collection success rate
 */
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
    <div className={`bg-gradient-to-br ${getGradient()} rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs opacity-80">Discovery Success</p>
          <p className="text-2xl font-bold">{percentage}%</p>
          <p className="text-xs opacity-80">{received}/{total} data sources</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Rich Stat Card Component - Gradient background style
 */
interface RichStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  gradient: string;
}

const RichStatCard: React.FC<RichStatCardProps> = ({ icon, label, value, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4 text-white shadow-lg`}>
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/20 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-xs opacity-80">{label}</p>
        <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
    </div>
  </div>
);

/**
 * Stat Card Component (legacy)
 */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subValue?: string | React.ReactNode;
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
 * Overview Tab Component - Fixed to use actual discovery result structure
 */
interface OverviewTabProps {
  result: any;
  contentTypes?: any[];
  sharingLinks?: any[];
  siteAdmins?: any[];
  hubSites?: any[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ result, contentTypes = [], sharingLinks = [], siteAdmins = [], hubSites = [] }) => {
  // Extract metadata from nested structure
  const rawData = result?.data || result;
  const psResult = rawData?.data || rawData;
  const metadata = result?.metadata || psResult?.Metadata || {};

  // Parse dates from /Date(timestamp)/ format
  const parseDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;
    const match = dateStr.match(/\/Date\((\d+)\)\//);
    if (match) return new Date(parseInt(match[1]));
    return new Date(dateStr);
  };

  const startTime = parseDate(psResult?.StartTime);
  const endTime = parseDate(psResult?.EndTime);

  // Calculate stats from live data
  const liveSites = result?.sites || [];
  const liveLists = result?.lists || [];

  const totalRecords = liveSites.length + liveLists.length;
  const elapsedSeconds = metadata?.ElapsedTimeSeconds || (endTime && startTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0);
  const objectsPerSecond = elapsedSeconds > 0 ? totalRecords / elapsedSeconds : 0;

  // Site breakdown
  const teamSites = liveSites.filter((s: any) => !s.IsPersonalSite && s.DisplayName).length;
  const personalSites = liveSites.filter((s: any) => s.IsPersonalSite).length;
  const rootSites = liveSites.filter((s: any) => s.Root).length;
  const communicationSites = liveSites.filter((s: any) => s.DisplayName?.toLowerCase().includes('communication')).length;

  // Storage calculation
  const totalStorageUsedGB = liveSites.reduce((sum: number, s: any) => sum + (s.StorageUsedGB || 0), 0);
  const totalStorageQuotaGB = liveSites.reduce((sum: number, s: any) => sum + (s.StorageQuotaGB || 0), 0);

  // List breakdown
  const documentLibraries = liveLists.filter((l: any) => l.ListType === 'DocumentLibrary').length;
  const genericLists = liveLists.filter((l: any) => l.ListType === 'List').length;
  const visibleLists = liveLists.filter((l: any) => !l.Hidden).length;
  const hiddenLists = liveLists.filter((l: any) => l.Hidden).length;
  const totalItems = liveLists.reduce((sum: number, l: any) => sum + (l.ItemCount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Discovery Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Discovery Summary</h3>
        <div className="space-y-3">
          <SummaryRow label="Execution ID" value={metadata?.ExecutionId || psResult?.ExecutionId || 'N/A'} />
          <SummaryRow label="Tenant" value={metadata?.TenantName || 'Auto-detected'} />
          <SummaryRow label="Authentication" value={metadata?.AuthenticationMethod || 'Direct Access Token'} />
          <SummaryRow label="Start Time" value={startTime ? startTime.toLocaleString() : 'N/A'} />
          <SummaryRow label="End Time" value={endTime ? endTime.toLocaleString() : 'N/A'} />
          <SummaryRow label="Duration" value={`${elapsedSeconds.toFixed(2)} seconds`} />
          <SummaryRow label="Total Records" value={totalRecords.toLocaleString()} />
          <SummaryRow label="Objects per Second" value={objectsPerSecond.toFixed(2)} />
          <SummaryRow label="Status" value={<Badge variant={result?.success !== false ? 'success' : 'warning'}>{result?.success !== false ? 'Completed' : 'Partial'}</Badge>} />
        </div>
      </div>

      {/* Site Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Site Statistics</h3>
        <div className="space-y-3">
          <SummaryRow label="Total Sites" value={liveSites.length} />
          <SummaryRow label="Root Sites" value={rootSites} />
          <SummaryRow label="Team Sites" value={teamSites} />
          <SummaryRow label="Personal Sites (OneDrive)" value={personalSites} />
          <SummaryRow label="Communication Sites" value={communicationSites} />
          <SummaryRow label="Average Site Size" value={liveSites.length > 0 ? `${(totalStorageUsedGB / liveSites.length).toFixed(2)} GB` : '0 GB'} />
        </div>
      </div>

      {/* Storage Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Storage Statistics</h3>
        <div className="space-y-3">
          <SummaryRow label="Total Storage Quota" value={`${totalStorageQuotaGB.toFixed(2)} GB`} />
          <SummaryRow label="Storage Used" value={`${totalStorageUsedGB.toFixed(2)} GB`} />
          <SummaryRow label="Storage Available" value={`${(totalStorageQuotaGB - totalStorageUsedGB).toFixed(2)} GB`} />
          <SummaryRow
            label="Storage Utilization"
            value={`${totalStorageQuotaGB > 0 ? ((totalStorageUsedGB / totalStorageQuotaGB) * 100).toFixed(1) : 0}%`}
          />
        </div>
      </div>

      {/* List & Library Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">List & Library Statistics</h3>
        <div className="space-y-3">
          <SummaryRow label="Total Lists & Libraries" value={liveLists.length} />
          <SummaryRow label="Document Libraries" value={documentLibraries} />
          <SummaryRow label="Generic Lists" value={genericLists} />
          <SummaryRow label="Visible" value={visibleLists} />
          <SummaryRow label="Hidden (System)" value={hiddenLists} />
          <SummaryRow label="Total Items" value={totalItems.toLocaleString()} />
        </div>
      </div>

      {/* Migration Readiness - v2.0.0 Enhanced with migration-critical data */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Migration Assessment</h3>
        <div className="space-y-3">
          <SummaryRow label="Sites to Migrate" value={liveSites.length} />
          <SummaryRow label="Content to Migrate" value={`${liveLists.length} lists/libraries`} />
          <SummaryRow label="Storage to Transfer" value={`${totalStorageUsedGB.toFixed(2)} GB`} />
          <SummaryRow
            label="Content Types"
            value={contentTypes.length > 0
              ? <Badge variant="success">{contentTypes.length} collected</Badge>
              : <Badge variant="warning">Not Collected</Badge>
            }
          />
          <SummaryRow
            label="External Sharing Links"
            value={sharingLinks.length > 0
              ? <Badge variant="success">{sharingLinks.length} collected</Badge>
              : <Badge variant="warning">Not Collected</Badge>
            }
          />
          <SummaryRow
            label="Site Collection Admins"
            value={siteAdmins.length > 0
              ? <Badge variant="success">{siteAdmins.length} collected</Badge>
              : <Badge variant="warning">Not Collected</Badge>
            }
          />
          <SummaryRow
            label="Hub Sites"
            value={hubSites.length > 0
              ? <Badge variant="success">{hubSites.length} collected</Badge>
              : <Badge variant="info">{hubSites.length} (none configured)</Badge>
            }
          />
          <SummaryRow
            label="Workflows"
            value={<Badge variant="warning">Not Yet Supported</Badge>}
          />
        </div>

        {/* Migration Readiness Score */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Migration Readiness Score:</span>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${
                (liveSites.length > 0 && liveLists.length > 0 && contentTypes.length > 0 && siteAdmins.length > 0)
                  ? 'text-green-600 dark:text-green-400'
                  : (liveSites.length > 0 && liveLists.length > 0)
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
              }`}>
                {calculateMigrationReadiness(liveSites.length, liveLists.length, contentTypes.length, sharingLinks.length, siteAdmins.length, hubSites.length)}%
              </span>
              <Badge variant={
                (liveSites.length > 0 && liveLists.length > 0 && contentTypes.length > 0 && siteAdmins.length > 0)
                  ? 'success'
                  : (liveSites.length > 0 && liveLists.length > 0)
                    ? 'warning'
                    : 'danger'
              }>
                {(liveSites.length > 0 && liveLists.length > 0 && contentTypes.length > 0 && siteAdmins.length > 0)
                  ? 'Ready'
                  : (liveSites.length > 0 && liveLists.length > 0)
                    ? 'Partial'
                    : 'Incomplete'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
 * Calculate migration readiness score based on collected data
 * Weighted by importance: Sites(25%), Lists(25%), ContentTypes(15%), SharingLinks(10%), SiteAdmins(15%), HubSites(10%)
 */
function calculateMigrationReadiness(
  sitesCount: number,
  listsCount: number,
  contentTypesCount: number,
  sharingLinksCount: number,
  siteAdminsCount: number,
  hubSitesCount: number
): number {
  const weights = {
    sites: 25,
    lists: 25,
    contentTypes: 15,
    sharingLinks: 10,
    siteAdmins: 15,
    hubSites: 10,  // Hub sites may legitimately be 0 if none configured
  };

  let totalWeight = 0;
  let achievedWeight = 0;

  // Sites - critical
  totalWeight += weights.sites;
  if (sitesCount > 0) achievedWeight += weights.sites;

  // Lists - critical
  totalWeight += weights.lists;
  if (listsCount > 0) achievedWeight += weights.lists;

  // Content Types - important for migration
  totalWeight += weights.contentTypes;
  if (contentTypesCount > 0) achievedWeight += weights.contentTypes;

  // Sharing Links - helpful for security review
  totalWeight += weights.sharingLinks;
  // Sharing links might be 0 if no external sharing, still count partial
  achievedWeight += weights.sharingLinks; // Always count - absence is also information

  // Site Admins - important for migration coordination
  totalWeight += weights.siteAdmins;
  if (siteAdminsCount > 0) achievedWeight += weights.siteAdmins;

  // Hub Sites - may be 0 if not configured
  totalWeight += weights.hubSites;
  achievedWeight += weights.hubSites; // Always count - absence is also information

  return Math.round((achievedWeight / totalWeight) * 100);
}

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

export default SharePointDiscoveryView;


