/**
 * Entra ID & Microsoft 365 Discovered View
 * Rich presentation of discovered identity and M365 data with statistics and filtering
 * Enhanced version with users, groups, teams, sharepoint, and applications
 */

import * as React from 'react';
import { useState } from 'react';
import {
  Cloud,
  Users,
  Shield,
  Building2,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  UserCheck,
  UserX,
  UserPlus,
  Key,
  RefreshCw,
  FolderTree,
  Globe,
  Settings,
  Lock,
  Server,
} from 'lucide-react';

import { useEntraIDM365DiscoveredLogic } from '../../hooks/useEntraIDM365DiscoveredLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const EntraIDM365DiscoveredView: React.FC = () => {
  const {
    isLoading,
    error,
    activeTab,
    filter,
    stats,
    columns,
    filteredData,
    setActiveTab,
    updateFilter,
    clearError,
    exportToCSV,
    exportToExcel,
    reloadData,
  } = useEntraIDM365DiscoveredLogic();

  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const userTypes = ['Member', 'Guest'];
  const groupTypes = ['Security', 'Microsoft365Group', 'DistributionList'];

  const toggleUserType = (type: string) => {
    updateFilter({ userType: filter.userType === type ? 'all' : type as 'all' | 'Member' | 'Guest' });
  };

  const toggleGroupType = (type: string) => {
    updateFilter({ groupType: filter.groupType === type ? 'all' : type as 'all' | 'Security' | 'Microsoft365Group' | 'DistributionList' });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-testid="entraid-m365-discovered-view">
      {isLoading && (
        <LoadingOverlay
          message="Loading Entra ID & M365 data..."
          data-testid="loading-overlay"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg">
            <Cloud className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Entra ID & Microsoft 365 Data</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View discovered users, groups, teams, SharePoint sites, and security configurations
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={reloadData}
            variant="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
            data-testid="reload-btn"
          >
            Refresh
          </Button>
          {filteredData.length > 0 && (
            <>
              <Button
                onClick={() => exportToCSV(filteredData, `m365-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel(filteredData, `m365-${activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`)}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
                data-testid="export-excel-btn"
              >
                Export Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={clearError} variant="ghost" size="sm">Dismiss</Button>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          {/* Row 1: User Metrics */}
          <div className="p-4 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Users</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <UserCheck className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Active Users</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <UserPlus className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.guestUsers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Guest Users</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Key className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.licensedUsers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Licensed Users</div>
              </div>
            </div>
          </div>

          {/* Row 2: Group & Service Metrics */}
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <FolderTree className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalGroups.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Building2 className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalTeams.toLocaleString()}</div>
                <div className="text-sm opacity-90">Teams</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalSharePointSites.toLocaleString()}</div>
                <div className="text-sm opacity-90">SharePoint Sites</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Settings className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalApplications.toLocaleString()}</div>
                <div className="text-sm opacity-90">Applications</div>
              </div>
            </div>
          </div>

          {/* Row 3: Security & Sync Metrics */}
          <div className="p-4 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.securityGroups.toLocaleString()}</div>
                <div className="text-sm opacity-90">Security Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Cloud className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.m365Groups.toLocaleString()}</div>
                <div className="text-sm opacity-90">M365 Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Server className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.syncedUsers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Synced Users</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Lock className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalDirectoryRoles.toLocaleString()}</div>
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
            data-testid="tab-overview"
          >
            <Cloud className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'users'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-testid="tab-users"
          >
            <Users className="w-4 h-4" />
            Users
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalUsers}</span>}
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'groups'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-testid="tab-groups"
          >
            <FolderTree className="w-4 h-4" />
            Groups
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalGroups}</span>}
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'teams'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-testid="tab-teams"
          >
            <Building2 className="w-4 h-4" />
            Teams
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalTeams}</span>}
          </button>
          <button
            onClick={() => setActiveTab('sharepoint')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'sharepoint'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-testid="tab-sharepoint"
          >
            <Globe className="w-4 h-4" />
            SharePoint
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalSharePointSites}</span>}
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'applications'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-testid="tab-applications"
          >
            <Settings className="w-4 h-4" />
            Apps
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalApplications}</span>}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'security'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-testid="tab-security"
          >
            <Shield className="w-4 h-4" />
            Roles
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats.totalDirectoryRoles}</span>}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && stats && (
          <div className="space-y-6 overflow-auto">
            {/* User Breakdown */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Members</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{stats.memberUsers - (stats.totalUsers - stats.activeUsers)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserX className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Disabled Users</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{stats.totalUsers - stats.activeUsers}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Guest Users</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">{stats.guestUsers}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Licensed Users</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{stats.licensedUsers}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-teal-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Synced from AD</span>
                    </div>
                    <span className="text-lg font-bold text-teal-600">{stats.syncedUsers}</span>
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
                    <span className="text-lg font-bold text-rose-600">{stats.securityGroups}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-violet-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Microsoft 365 Groups</span>
                    </div>
                    <span className="text-lg font-bold text-violet-600">{stats.m365Groups}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Distribution Lists</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">{stats.distributionLists}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dynamic Groups</span>
                    </div>
                    <span className="text-lg font-bold text-amber-600">{stats.dynamicGroups}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-teal-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Synced from AD</span>
                    </div>
                    <span className="text-lg font-bold text-teal-600">{stats.syncedGroups}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Departments */}
            {stats.topDepartments.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Departments</h3>
                <div className="space-y-3">
                  {stats.topDepartments.map((dept, index) => (
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
                            style={{ width: `${Math.min((dept.count / stats.totalUsers) * 100 * 3, 100)}%` }}
                          >
                            {(dept.count / stats.totalUsers) * 100 > 5 && `${((dept.count / stats.totalUsers) * 100).toFixed(0)}%`}
                          </div>
                        </div>
                        <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
                          {((dept.count / stats.totalUsers) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Groups by Members */}
            {stats.topGroupsByMembers.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Groups by Member Count</h3>
                <div className="space-y-3">
                  {stats.topGroupsByMembers.map((group, index) => (
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
          </div>
        )}

        {(activeTab === 'users' || activeTab === 'groups' || activeTab === 'teams' || activeTab === 'sharepoint' || activeTab === 'applications' || activeTab === 'security') && (
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

              {filtersExpanded && activeTab === 'users' && (
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
                      data-testid="show-synced-checkbox"
                    />
                    <Checkbox
                      label="Show Only Licensed Users"
                      checked={filter.showOnlyLicensed}
                      onChange={(checked) => updateFilter({ showOnlyLicensed: checked })}
                      data-testid="show-licensed-checkbox"
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

              {filtersExpanded && activeTab === 'groups' && (
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
                    data-testid="show-synced-groups-checkbox"
                  />
                </div>
              )}
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={filteredData as any[]}
                columns={columns}
                loading={isLoading}
                enableColumnReorder
                enableColumnResize
              />
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !stats && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Cloud className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No M365 Data</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Run an Entra ID & M365 Discovery to populate this view with identity data.
              </p>
              <Button
                onClick={reloadData}
                variant="secondary"
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntraIDM365DiscoveredView;
