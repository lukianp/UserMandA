/**
 * Entra ID & Microsoft 365 Discovery View
 *
 * Discovers identity, security, and collaboration services from Microsoft cloud:
 * - Entra ID (Azure AD): Users, Groups, Administrative Units, Guest Accounts
 * - Security: Conditional Access Policies, Directory Roles, App Registrations
 * - Microsoft 365: Exchange Online, SharePoint Online, Microsoft Teams
 * - Devices: Entra ID Joined, Hybrid Joined, Intune Managed
 */

import React, { useState, useMemo } from 'react';
import {
  Cloud,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Users,
  UsersRound,
  Key,
  Mail,
  Share2,
  MessageSquare,
  HardDrive,
  LayoutDashboard,
  Shield,
  Building2,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw,
  FolderTree,
  Globe,
  Settings,
  Lock,
  Server,
} from 'lucide-react';

import { useAzureDiscoveryLogic } from '../../hooks/useAzureDiscoveryLogic';
import { useEntraIDM365DiscoveredLogic } from '../../hooks/useEntraIDM365DiscoveredLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';
import { DiscoverySuccessCard } from '../../components/molecules/DiscoverySuccessCard';

const EntraIDM365DiscoveryView: React.FC = () => {
  const {
    formData,
    updateFormField,
    resetForm,
    isFormValid,
    isRunning,
    isCancelling,
    progress,
    results,
    error,
    logs,
    connectionStatus,
    startDiscovery,
    cancelDiscovery,
    exportResults,
    clearLogs,
    selectedProfile,
    showExecutionDialog,
    setShowExecutionDialog,
  } = useAzureDiscoveryLogic();

  // Use the discovered logic hook to load CSV data for results display
  const {
    isLoading: isLoadingDiscovered,
    stats: discoveredStats,
    columns,
    filteredData,
    activeTab: discoveredActiveTab,
    filter,
    setActiveTab: setDiscoveredActiveTab,
    updateFilter,
    reloadData,
    exportToCSV,
    exportToExcel,
  } = useEntraIDM365DiscoveredLogic();

  const [configExpanded, setConfigExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'results'>('overview');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Compute stats from results
  const stats = useMemo(() => {
    if (!results || results.length === 0) return null;

    const latestResult = results[results.length - 1];
    return {
      totalItems: latestResult?.itemCount || 0,
      duration: latestResult?.duration || 0,
      summary: latestResult?.summary || '',
      filePath: latestResult?.filePath || '',
    };
  }, [results]);

  // Get services that were enabled for discovery
  const enabledServices = useMemo(() => {
    const services: string[] = [];
    if (formData.includeUsers) services.push('Users');
    if (formData.includeGroups) services.push('Groups');
    if (formData.includeLicenses) services.push('Licenses');
    if (formData.includeExchange) services.push('Exchange');
    if (formData.includeSharePoint) services.push('SharePoint');
    if (formData.includeTeams) services.push('Teams');
    if (formData.includeOneDrive) services.push('OneDrive');
    return services;
  }, [formData]);

  const handleExportCSV = () => {
    exportResults();
  };

  const handleExportExcel = () => {
    exportResults();
  };

  const userTypes = ['Member', 'Guest'];
  const groupTypes = ['Security', 'Microsoft365Group', 'DistributionList'];

  const toggleUserType = (type: string) => {
    updateFilter({ userType: filter.userType === type ? 'all' : type as 'all' | 'Member' | 'Guest' });
  };

  const toggleGroupType = (type: string) => {
    updateFilter({ groupType: filter.groupType === type ? 'all' : type as 'all' | 'Security' | 'Microsoft365Group' | 'DistributionList' });
  };

  // Reload discovered data after discovery completes
  const handleStartDiscovery = async () => {
    await startDiscovery();
    // Reload the discovered data after discovery completes
    setTimeout(() => reloadData(), 2000);
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="azure-discovery-view" data-testid="azure-discovery-view">
      {isRunning && (
        <LoadingOverlay
          progress={progress?.overallProgress || 0}
          onCancel={cancelDiscovery}
          message={progress?.message || 'Discovering Entra ID & Microsoft 365 resources...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg">
            <Cloud size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Entra ID & Microsoft 365 Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover users, groups, security policies, and M365 services (Exchange, SharePoint, Teams) for identity consolidation and tenant migration planning
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {stats && stats.totalItems > 0 && (
            <>
              <Button
                onClick={handleExportCSV}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={handleExportExcel}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
                data-cy="export-excel-btn" data-testid="export-excel-btn"
              >
                Export Excel
              </Button>
            </>
          )}
          <Button
            onClick={handleStartDiscovery}
            disabled={isRunning || !isFormValid}
            variant="primary"
            data-cy="start-discovery-btn" data-testid="start-discovery-btn"
          >
            {isRunning ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={resetForm} variant="ghost" size="sm">Dismiss</Button>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="mx-6 mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          data-cy="config-toggle" data-testid="config-toggle"
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 dark:text-white">Discovery Configuration</span>
            {selectedProfile && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                • Profile: <span className="font-medium text-blue-600 dark:text-blue-400">{selectedProfile.name}</span>
                {selectedProfile.tenantId && (
                  <span className="ml-2">• Tenant: {selectedProfile.tenantId.substring(0, 8)}...</span>
                )}
              </span>
            )}
          </div>
          {configExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {configExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Services to Discover */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Services to Discover
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Checkbox
                  label="Users"
                  checked={formData.includeUsers}
                  onChange={(checked) => updateFormField('includeUsers', checked)}
                  disabled={isRunning}
                  data-cy="include-users-checkbox" data-testid="include-users-checkbox"
                />
                <Checkbox
                  label="Groups"
                  checked={formData.includeGroups}
                  onChange={(checked) => updateFormField('includeGroups', checked)}
                  disabled={isRunning}
                  data-cy="include-groups-checkbox" data-testid="include-groups-checkbox"
                />
                <Checkbox
                  label="Licenses"
                  checked={formData.includeLicenses}
                  onChange={(checked) => updateFormField('includeLicenses', checked)}
                  disabled={isRunning}
                  data-cy="include-licenses-checkbox" data-testid="include-licenses-checkbox"
                />
                <Checkbox
                  label="Exchange Online"
                  checked={formData.includeExchange}
                  onChange={(checked) => updateFormField('includeExchange', checked)}
                  disabled={isRunning}
                  data-cy="include-exchange-checkbox" data-testid="include-exchange-checkbox"
                />
                <Checkbox
                  label="SharePoint Online"
                  checked={formData.includeSharePoint}
                  onChange={(checked) => updateFormField('includeSharePoint', checked)}
                  disabled={isRunning}
                  data-cy="include-sharepoint-checkbox" data-testid="include-sharepoint-checkbox"
                />
                <Checkbox
                  label="Microsoft Teams"
                  checked={formData.includeTeams}
                  onChange={(checked) => updateFormField('includeTeams', checked)}
                  disabled={isRunning}
                  data-cy="include-teams-checkbox" data-testid="include-teams-checkbox"
                />
                <Checkbox
                  label="OneDrive"
                  checked={formData.includeOneDrive}
                  onChange={(checked) => updateFormField('includeOneDrive', checked)}
                  disabled={isRunning}
                  data-cy="include-onedrive-checkbox" data-testid="include-onedrive-checkbox"
                />
              </div>
            </div>

            {/* Execution Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Max Results"
                type="number"
                value={formData.maxResults?.toString() ?? ''}
                onChange={(e) => updateFormField('maxResults', parseInt(e.target.value) || 50000)}
                disabled={isRunning}
                min={1}
                max={100000}
                data-cy="max-results-input" data-testid="max-results-input"
              />

              <Input
                label="Timeout (seconds)"
                type="number"
                value={formData.timeout?.toString() ?? ''}
                onChange={(e) => updateFormField('timeout', parseInt(e.target.value) || 600)}
                disabled={isRunning}
                min={60}
                max={3600}
                helperText="Recommended: 600s (10 min) for large tenants"
                data-cy="timeout-input" data-testid="timeout-input"
              />

              <div className="flex items-end">
                <Checkbox
                  label="Use External Terminal (Advanced)"
                  checked={formData.showWindow}
                  onChange={(checked) => updateFormField('showWindow', checked)}
                  disabled={isRunning}
                  data-cy="show-window-checkbox" data-testid="show-window-checkbox"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={resetForm}
                disabled={isRunning}
                data-cy="reset-form-btn" data-testid="reset-form-btn"
              >
                Reset Configuration
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Rich Statistics Cards - Show when we have discovered data */}
      {discoveredStats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          {/* Discovery Success Card - FIRST */}
          <DiscoverySuccessCard
            percentage={discoveredStats.discoverySuccessPercentage}
            received={discoveredStats.dataSourcesReceivedCount}
            total={discoveredStats.dataSourcesTotal}
            showAnimation={true}
          />

          {/* Row 1: User Metrics */}
          <div className="p-4 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{discoveredStats.totalUsers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Users</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <UserCheck className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{discoveredStats.activeUsers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Active Users</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <UserPlus className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{discoveredStats.guestUsers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Guest Users</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Key className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{discoveredStats.licensedUsers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Licensed Users</div>
              </div>
            </div>
          </div>

          {/* Row 2: Group & Service Metrics */}
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <FolderTree className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{discoveredStats.totalGroups.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Building2 className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{discoveredStats.totalTeams.toLocaleString()}</div>
                <div className="text-sm opacity-90">Teams</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{discoveredStats.totalSharePointSites.toLocaleString()}</div>
                <div className="text-sm opacity-90">SharePoint Sites</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Settings className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{discoveredStats.totalApplications.toLocaleString()}</div>
                <div className="text-sm opacity-90">Applications</div>
              </div>
            </div>
          </div>

          {/* Row 3: Security & Sync Metrics */}
          <div className="p-4 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{discoveredStats.securityGroups.toLocaleString()}</div>
                <div className="text-sm opacity-90">Security Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Cloud className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{discoveredStats.m365Groups.toLocaleString()}</div>
                <div className="text-sm opacity-90">M365 Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{discoveredStats.syncedUsers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Synced Users</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Lock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{discoveredStats.totalDirectoryRoles.toLocaleString()}</div>
                <div className="text-sm opacity-90">Directory Roles</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview" data-testid="tab-overview"
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>
          {discoveredStats && (
            <>
              <button
                onClick={() => { setActiveTab('results'); setDiscoveredActiveTab('users'); }}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'results' && discoveredActiveTab === 'users'
                    ? 'border-b-2 border-sky-600 text-sky-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                Users
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{discoveredStats.totalUsers}</span>
              </button>
              <button
                onClick={() => { setActiveTab('results'); setDiscoveredActiveTab('groups'); }}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'results' && discoveredActiveTab === 'groups'
                    ? 'border-b-2 border-sky-600 text-sky-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FolderTree className="w-4 h-4" />
                Groups
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{discoveredStats.totalGroups}</span>
              </button>
              <button
                onClick={() => { setActiveTab('results'); setDiscoveredActiveTab('teams'); }}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'results' && discoveredActiveTab === 'teams'
                    ? 'border-b-2 border-sky-600 text-sky-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Teams
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{discoveredStats.totalTeams}</span>
              </button>
              <button
                onClick={() => { setActiveTab('results'); setDiscoveredActiveTab('sharepoint'); }}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'results' && discoveredActiveTab === 'sharepoint'
                    ? 'border-b-2 border-sky-600 text-sky-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4" />
                SharePoint
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{discoveredStats.totalSharePointSites}</span>
              </button>
              <button
                onClick={() => { setActiveTab('results'); setDiscoveredActiveTab('applications'); }}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'results' && discoveredActiveTab === 'applications'
                    ? 'border-b-2 border-sky-600 text-sky-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                Apps
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{discoveredStats.totalApplications}</span>
              </button>
              <button
                onClick={() => { setActiveTab('results'); setDiscoveredActiveTab('security'); }}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'results' && discoveredActiveTab === 'security'
                    ? 'border-b-2 border-sky-600 text-sky-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                Roles
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{discoveredStats.totalDirectoryRoles}</span>
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'logs'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-logs" data-testid="tab-logs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Execution Log
            {logs.length > 0 && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{logs.length}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (
          <div className="space-y-6 overflow-auto">
            {/* No data state */}
            {!discoveredStats && (
              <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Discovery Data Available</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Configure your services and start a discovery to view Entra ID & Microsoft 365 data.
                  </p>
                  <Button onClick={handleStartDiscovery} disabled={isRunning || !isFormValid} variant="primary">
                    {isRunning ? 'Discovering...' : 'Start Discovery'}
                  </Button>
                </div>
              </div>
            )}

            {/* Rich Overview - User & Group Breakdown */}
            {discoveredStats && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Members</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">{discoveredStats.memberUsers - (discoveredStats.totalUsers - discoveredStats.activeUsers)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <div className="flex items-center gap-2">
                          <UserX className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disabled Users</span>
                        </div>
                        <span className="text-lg font-bold text-red-600">{discoveredStats.totalUsers - discoveredStats.activeUsers}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Guest Users</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">{discoveredStats.guestUsers}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Licensed Users</span>
                        </div>
                        <span className="text-lg font-bold text-yellow-600">{discoveredStats.licensedUsers}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Server className="w-5 h-5 text-teal-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Synced from AD</span>
                        </div>
                        <span className="text-lg font-bold text-teal-600">{discoveredStats.syncedUsers}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Group Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-rose-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Security Groups</span>
                        </div>
                        <span className="text-lg font-bold text-rose-600">{discoveredStats.securityGroups}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Cloud className="w-5 h-5 text-violet-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Microsoft 365 Groups</span>
                        </div>
                        <span className="text-lg font-bold text-violet-600">{discoveredStats.m365Groups}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FolderTree className="w-5 h-5 text-indigo-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Distribution Lists</span>
                        </div>
                        <span className="text-lg font-bold text-indigo-600">{discoveredStats.distributionLists}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-amber-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dynamic Groups</span>
                        </div>
                        <span className="text-lg font-bold text-amber-600">{discoveredStats.dynamicGroups}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Server className="w-5 h-5 text-teal-600" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Synced from AD</span>
                        </div>
                        <span className="text-lg font-bold text-teal-600">{discoveredStats.syncedGroups}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Departments */}
                {discoveredStats.topDepartments.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Departments</h3>
                    <div className="space-y-3">
                      {discoveredStats.topDepartments.map((dept, index) => (
                        <div key={dept.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{index + 1}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{dept.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{dept.count} users</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                              <div
                                className="bg-sky-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                                style={{ width: `${Math.min((dept.count / discoveredStats.totalUsers) * 100 * 3, 100)}%` }}
                              >
                                {(dept.count / discoveredStats.totalUsers) * 100 > 5 && `${((dept.count / discoveredStats.totalUsers) * 100).toFixed(0)}%`}
                              </div>
                            </div>
                            <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
                              {((dept.count / discoveredStats.totalUsers) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Groups by Members */}
                {discoveredStats.topGroupsByMembers.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Groups by Member Count</h3>
                    <div className="space-y-3">
                      {discoveredStats.topGroupsByMembers.map((group, index) => (
                        <div key={group.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{index + 1}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{group.name}</span>
                          </div>
                          <span className="text-lg font-bold text-indigo-600">{group.count} members</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Results Data Tabs */}
        {activeTab === 'results' && discoveredStats && (
          <>
            {/* Filters */}
            <div className="mb-4 space-y-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Input
                    value={filter.searchText}
                    onChange={(e) => updateFilter({ searchText: e.target.value })}
                    placeholder="Search..."
                    data-testid="search-input"
                  />
                </div>
                <button
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Filters
                  {filtersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {filtersExpanded && discoveredActiveTab === 'users' && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by User Type</label>
                    <div className="flex flex-wrap gap-2">
                      {userTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => toggleUserType(type)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                            filter.userType === type
                              ? 'bg-sky-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Checkbox
                      label="Show Only Synced Users"
                      checked={filter.showOnlySynced}
                      onChange={(checked) => updateFilter({ showOnlySynced: checked })}
                    />
                    <Checkbox
                      label="Show Only Licensed Users"
                      checked={filter.showOnlyLicensed}
                      onChange={(checked) => updateFilter({ showOnlyLicensed: checked })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Status</label>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'enabled', 'disabled'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateFilter({ accountEnabled: status as 'all' | 'enabled' | 'disabled' })}
                          className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                            filter.accountEnabled === status
                              ? 'bg-sky-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {status === 'all' ? 'All' : status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {filtersExpanded && discoveredActiveTab === 'groups' && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Group Type</label>
                    <div className="flex flex-wrap gap-2">
                      {groupTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => toggleGroupType(type)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            filter.groupType === type
                              ? 'bg-sky-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {type === 'Microsoft365Group' ? 'M365 Group' : type === 'DistributionList' ? 'Distribution' : type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Checkbox
                    label="Show Only Synced Groups"
                    checked={filter.showOnlySynced}
                    onChange={(checked) => updateFilter({ showOnlySynced: checked })}
                  />
                </div>
              )}
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={filteredData as any[]}
                columns={columns}
                loading={isLoadingDiscovered}
                enableColumnReorder
                enableColumnResize
              />
            </div>
          </>
        )}

        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {logs.length} log entries
              </span>
              {logs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearLogs}
                  data-cy="clear-logs-btn" data-testid="clear-logs-btn"
                >
                  Clear Logs
                </Button>
              )}
            </div>
            <div
              className="flex-1 bg-gray-900 dark:bg-black rounded-lg p-4 overflow-auto font-mono text-xs"
              data-cy="execution-log" data-testid="execution-log"
            >
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Start discovery to see output.</p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`mb-1 ${
                      log.level === 'error'
                        ? 'text-red-400'
                        : log.level === 'success'
                        ? 'text-green-400'
                        : log.level === 'warning'
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isRunning && setShowExecutionDialog(false)}
        scriptName="Entra ID & Microsoft 365 Discovery"
        scriptDescription="Discovering users, groups, Teams, SharePoint, OneDrive, and Exchange Online"
        logs={logs}
        isRunning={isRunning}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.overallProgress,
          message: progress.message
        } : undefined}
        onStart={handleStartDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default EntraIDM365DiscoveryView;
