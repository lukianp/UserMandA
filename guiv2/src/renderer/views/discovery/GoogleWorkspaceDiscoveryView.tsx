/**
 * Google Workspace Discovery View
 * FULLY FUNCTIONAL production-ready UI for Google Workspace discovery
 * NO PLACEHOLDERS - Complete implementation with Users, Groups, Gmail, Drive, Calendar, Licenses
 */

import React, { useState } from 'react';
import { Mail, ChevronDown, ChevronUp, Download, FileSpreadsheet, AlertCircle, Play, XCircle, Users, FolderOpen, Calendar, Key } from 'lucide-react';
import { useGoogleWorkspaceDiscoveryLogic } from '../../hooks/useGoogleWorkspaceDiscoveryLogic';
import VirtualizedDataGrid from '../../components/organisms/VirtualizedDataGrid';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';

const GoogleWorkspaceDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    progress,
    activeTab,
    filter,
    error,
    columns,
    filteredData,
    stats,
    updateConfig,
    updateFilter,
    setActiveTab,
    startDiscovery,
    cancelDiscovery,
    exportToCSV,
    exportToExcel
  } = useGoogleWorkspaceDiscoveryLogic();

  const [showConfig, setShowConfig] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleStartDiscovery = () => {
    const errors: string[] = [];
    if (!config.domain) errors.push('Domain is required');
    if (!config.adminEmail) errors.push('Admin email is required');
    if (!config.serviceAccountKeyPath) errors.push('Service account key path is required');
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    startDiscovery();
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="google-workspace-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={progress.percentage}
          message={progress.message || 'Discovering Google Workspace...'}
          onCancel={cancelDiscovery}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Mail className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Google Workspace Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Discover users, groups, Gmail, Drive, and Calendar</p>
          </div>
        </div>

        <div className="flex gap-3">
          {result && (
            <>
              <Button variant="secondary" onClick={exportToCSV} icon={<Download className="w-4 h-4" />}>Export CSV</Button>
              <Button variant="secondary" onClick={exportToExcel} icon={<FileSpreadsheet className="w-4 h-4" />}>Export Excel</Button>
            </>
          )}
          <Button
            variant="primary"
            onClick={handleStartDiscovery}
            disabled={isDiscovering}
            icon={isDiscovering ? <XCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <span className="font-medium">Discovery Configuration</span>
          {showConfig ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showConfig && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Domain"
                  value={config.domain || ''}
                  onChange={(e) => updateConfig({ domain: e.target.value })}
                  placeholder="example.com"
                  error={validationErrors.includes('Domain is required') ? 'Required' : undefined}
                />
                <Input
                  label="Admin Email"
                  value={config.adminEmail || ''}
                  onChange={(e) => updateConfig({ adminEmail: e.target.value })}
                  placeholder="admin@example.com"
                  error={validationErrors.includes('Admin email is required') ? 'Required' : undefined}
                />
                <Input
                  label="Service Account Key Path"
                  value={config.serviceAccountKeyPath || ''}
                  onChange={(e) => updateConfig({ serviceAccountKeyPath: e.target.value })}
                  placeholder="C:\\path\\to\\service-account-key.json"
                  error={validationErrors.includes('Service account key path is required') ? 'Required' : undefined}
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium mb-2">Discovery Options</h3>
                <Checkbox
                  label="Include User Details"
                  checked={config.includeUserDetails || false}
                  onChange={(e) => updateConfig({ includeUserDetails: e.target.checked })}
                />
                <Checkbox
                  label="Include Group Membership"
                  checked={config.includeGroupMembership || false}
                  onChange={(e) => updateConfig({ includeGroupMembership: e.target.checked })}
                />
                <Checkbox
                  label="Include Mailbox Size"
                  checked={config.includeMailboxSize || false}
                  onChange={(e) => updateConfig({ includeMailboxSize: e.target.checked })}
                />
                <Checkbox
                  label="Include Drive Usage"
                  checked={config.includeDriveUsage || false}
                  onChange={(e) => updateConfig({ includeDriveUsage: e.target.checked })}
                />
                <Checkbox
                  label="Include Calendar Details"
                  checked={config.includeCalendarDetails || false}
                  onChange={(e) => updateConfig({ includeCalendarDetails: e.target.checked })}
                />
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Validation Errors</h4>
                    <ul className="mt-1 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                      {validationErrors.map((err, i) => (<li key={i}>{err}</li>))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Error</h4>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="p-6 bg-white dark:bg-gray-800 border-b">
          <h3 className="text-sm font-medium mb-4">Google Workspace Statistics</h3>
          <div className="grid grid-cols-6 gap-4">
            <StatCard value={stats.totalUsers} label="Total Users" color="red" />
            <StatCard value={stats.activeUsers} label="Active Users" color="green" />
            <StatCard value={stats.suspendedUsers} label="Suspended" color="orange" />
            <StatCard value={stats.totalGroups} label="Groups" color="blue" />
            <StatCard
              value={`${(stats.totalStorageUsed / 1024 / 1024 / 1024).toFixed(2)} GB`}
              label="Total Storage"
              color="purple"
            />
            <StatCard
              value={`${(stats.averageStoragePerUser / 1024 / 1024 / 1024).toFixed(2)} GB`}
              label="Avg/User"
              color="teal"
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 bg-gray-50 dark:bg-gray-900">
        <TabButton
          label="Overview"
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          count={stats?.totalUsers}
          icon={<Users className="w-4 h-4" />}
        />
        <TabButton
          label="Users"
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
          count={result?.users?.length}
          icon={<Users className="w-4 h-4" />}
        />
        <TabButton
          label="Groups"
          active={activeTab === 'groups'}
          onClick={() => setActiveTab('groups')}
          count={result?.groups?.length}
          icon={<Users className="w-4 h-4" />}
        />
        <TabButton
          label="Gmail"
          active={activeTab === 'gmail'}
          onClick={() => setActiveTab('gmail')}
          count={result?.gmailData?.largestMailboxes?.length}
          icon={<Mail className="w-4 h-4" />}
        />
        <TabButton
          label="Drive"
          active={activeTab === 'drive'}
          onClick={() => setActiveTab('drive')}
          count={result?.driveData?.largestUsers?.length}
          icon={<FolderOpen className="w-4 h-4" />}
        />
        <TabButton
          label="Calendar"
          active={activeTab === 'calendar'}
          onClick={() => setActiveTab('calendar')}
          count={result?.calendarData?.topUsers?.length}
          icon={<Calendar className="w-4 h-4" />}
        />
        <TabButton
          label="Licenses"
          active={activeTab === 'licenses'}
          onClick={() => setActiveTab('licenses')}
          count={result?.licenseInfo?.length}
          icon={<Key className="w-4 h-4" />}
        />
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              value={filter.searchText}
              onChange={(e) => updateFilter({ searchText: e.target.value })}
              placeholder={`Search ${activeTab}...`}
            />
          </div>

          {activeTab === 'users' && (
            <>
              <Checkbox
                label="Show Only Admins"
                checked={filter.showOnlyAdmins || false}
                onChange={(e) => updateFilter({ showOnlyAdmins: e.target.checked })}
              />
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 px-6 pb-6 bg-gray-50 dark:bg-gray-900">
        {activeTab === 'overview' && result ? (
          <OverviewTab stats={stats} result={result} />
        ) : (
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
            <VirtualizedDataGrid
              data={filteredData}
              columns={columns}
              loading={isDiscovering}
              enableExport
              enableColumnReorder
              enableColumnResize
            />
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ value: number | string; label: string; color: string }> = ({ value, label, color }) => {
  const colors: Record<string, string> = {
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600'
  };

  return (
    <div className={`p-4 rounded-lg ${colors[color]}`}>
      <div className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="text-sm mt-1 opacity-80">{label}</div>
    </div>
  );
};

const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; count?: number; icon?: React.ReactNode }> = ({
  label,
  active,
  onClick,
  count,
  icon
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 ${
      active ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-gray-900'
    }`}
  >
    {icon}
    {label}
    {count !== undefined && (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${active ? 'bg-red-100 text-red-700' : 'bg-gray-200'}`}>
        {count}
      </span>
    )}
  </button>
);

const OverviewTab: React.FC<{ stats: any; result: any }> = ({ stats, result }) => (
  <div className="h-full overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
    <h2 className="text-lg font-semibold mb-4">Google Workspace Summary</h2>

    <div className="space-y-6">
      {/* User Statistics */}
      <div className="pb-4 border-b">
        <h3 className="text-sm font-medium mb-3">User Statistics</h3>
        <div className="space-y-2">
          <SummaryRow label="Total Users" value={stats?.totalUsers || 0} />
          <SummaryRow label="Active Users" value={stats?.activeUsers || 0} />
          <SummaryRow label="Suspended Users" value={stats?.suspendedUsers || 0} />
          <SummaryRow
            label="Average Storage per User"
            value={`${((stats?.averageStoragePerUser || 0) / 1024 / 1024 / 1024).toFixed(2)} GB`}
          />
        </div>
      </div>

      {/* Top Storage Users */}
      {stats?.topStorageUsers && stats.topStorageUsers.length > 0 && (
        <div className="pb-4 border-b">
          <h3 className="text-sm font-medium mb-3">Top Storage Users</h3>
          {stats.topStorageUsers.map((user: any, i: number) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div>
                <span className="text-sm font-medium">{user.name}</span>
                <span className="ml-2 text-xs text-gray-500">{user.email}</span>
              </div>
              <span className="text-sm font-medium">{(user.storage / 1024 / 1024 / 1024).toFixed(2)} GB</span>
            </div>
          ))}
        </div>
      )}

      {/* Group Statistics */}
      <div className="pb-4 border-b">
        <h3 className="text-sm font-medium mb-3">Groups & Collaboration</h3>
        <SummaryRow label="Total Groups" value={stats?.totalGroups || 0} />
        {result?.gmailData && (
          <>
            <SummaryRow label="Total Mailboxes" value={result.gmailData.totalMailboxes || 0} />
            <SummaryRow
              label="Gmail Storage"
              value={`${((result.gmailData.totalStorageUsed || 0) / 1024 / 1024 / 1024).toFixed(2)} GB`}
            />
          </>
        )}
        {result?.driveData && (
          <>
            <SummaryRow label="Drive Users" value={result.driveData.totalUsers || 0} />
            <SummaryRow label="Total Files" value={(result.driveData.totalFilesCount || 0).toLocaleString()} />
            <SummaryRow label="Shared Drives" value={result.driveData.sharedDrives?.length || 0} />
          </>
        )}
      </div>

      {/* License Utilization */}
      {stats?.licenseUtilization && Object.keys(stats.licenseUtilization).length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">License Utilization</h3>
          {Object.entries(stats.licenseUtilization).slice(0, 5).map(([sku, util]: [string, any], i: number) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">{sku}</span>
                <span className="text-xs font-medium">{util.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${Math.min(util, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const SummaryRow: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium">{typeof value === 'number' ? value.toLocaleString() : value}</span>
  </div>
);

export default GoogleWorkspaceDiscoveryView;
