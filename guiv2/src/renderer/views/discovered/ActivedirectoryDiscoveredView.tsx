/**
 * Active Directory Discovered View
 * Comprehensive view of all Active Directory data from discovery CSV files
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Download, RefreshCw, Database, Users, Server, FolderTree, Shield, Network, Settings } from 'lucide-react';

import { useCsvDataLoader } from '../../hooks/useCsvDataLoader';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import SearchBar from '../../components/molecules/SearchBar';
import { Button } from '../../components/atoms/Button';
import Badge from '../../components/atoms/Badge';

/**
 * Active Directory Discovered View Component
 */
const ActivedirectoryDiscoveredView: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'groups' | 'computers' | 'ous' | 'trusts' | 'fsmo' | 'passwords' | 'serviceaccounts'>('overview');
  const [searchText, setSearchText] = useState('');

  // Load all AD CSV files
  const usersData = useCsvDataLoader('ADUsers.csv', { gracefulDegradation: true });
  const groupsData = useCsvDataLoader('ADGroups.csv', { gracefulDegradation: true });
  const computersData = useCsvDataLoader('ADComputers.csv', { gracefulDegradation: true });
  const ousData = useCsvDataLoader('ADOrganizationalUnits.csv', { gracefulDegradation: true });
  const groupMembersData = useCsvDataLoader('ADGroupMembers.csv', { gracefulDegradation: true });
  const trustsData = useCsvDataLoader('ADTrusts.csv', { gracefulDegradation: true });
  const fsmoData = useCsvDataLoader('ADFSMORoles.csv', { gracefulDegradation: true });
  const passwordPoliciesData = useCsvDataLoader('AD_PasswordPolicy.csv', { gracefulDegradation: true });
  const serviceAccountsData = useCsvDataLoader('AD_ServiceAccount.csv', { gracefulDegradation: true });

  // Calculate stats
  const stats = useMemo(() => {
    const enabledUsers = usersData.data?.filter((u: any) => u.Enabled === 'True' || u.Enabled === true).length || 0;
    const enabledComputers = computersData.data?.filter((c: any) => c.Enabled === 'True' || c.Enabled === true).length || 0;

    return {
      totalUsers: usersData.data?.length || 0,
      totalGroups: groupsData.data?.length || 0,
      totalComputers: computersData.data?.length || 0,
      totalOUs: ousData.data?.length || 0,
      totalGroupMembers: groupMembersData.data?.length || 0,
      totalTrusts: trustsData.data?.length || 0,
      totalFSMORoles: fsmoData.data?.length || 0,
      totalPasswordPolicies: passwordPoliciesData.data?.length || 0,
      totalServiceAccounts: serviceAccountsData.data?.length || 0,
      enabledUsers,
      enabledComputers,
      totalRecords: (usersData.data?.length || 0) + (groupsData.data?.length || 0) + (computersData.data?.length || 0) + (ousData.data?.length || 0) + (trustsData.data?.length || 0) + (fsmoData.data?.length || 0) + (passwordPoliciesData.data?.length || 0) + (serviceAccountsData.data?.length || 0),
    };
  }, [usersData.data, groupsData.data, computersData.data, ousData.data, groupMembersData.data, trustsData.data, fsmoData.data, passwordPoliciesData.data, serviceAccountsData.data]);

  // Get current tab data
  const currentTabData = useMemo(() => {
    switch (selectedTab) {
      case 'users':
        return { data: usersData.data || [], columns: usersData.columns };
      case 'groups':
        return { data: groupsData.data || [], columns: groupsData.columns };
      case 'computers':
        return { data: computersData.data || [], columns: computersData.columns };
      case 'ous':
        return { data: ousData.data || [], columns: ousData.columns };
      case 'trusts':
        return { data: trustsData.data || [], columns: trustsData.columns };
      case 'fsmo':
        return { data: fsmoData.data || [], columns: fsmoData.columns };
      case 'passwords':
        return { data: passwordPoliciesData.data || [], columns: passwordPoliciesData.columns };
      case 'serviceaccounts':
        return { data: serviceAccountsData.data || [], columns: serviceAccountsData.columns };
      default:
        return { data: [], columns: [] };
    }
  }, [selectedTab, usersData, groupsData, computersData, ousData, trustsData, fsmoData, passwordPoliciesData, serviceAccountsData]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchText || selectedTab === 'overview') return currentTabData.data;

    return currentTabData.data.filter((row: any) =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [currentTabData.data, searchText, selectedTab]);

  const isLoading = usersData.loading || groupsData.loading || computersData.loading || ousData.loading;
  const hasData = stats.totalRecords > 0;

  const handleRefresh = () => {
    usersData.reload();
    groupsData.reload();
    computersData.reload();
    ousData.reload();
    groupMembersData.reload();
    trustsData.reload();
    fsmoData.reload();
    passwordPoliciesData.reload();
    serviceAccountsData.reload();
  };

  const handleExport = () => {
    if (!currentTabData.data || currentTabData.data.length === 0) return;

    // Create CSV content
    const headers = currentTabData.columns.map(col => col.field || '').join(',');
    const rows = currentTabData.data.map(row =>
      currentTabData.columns.map(col => {
        const value = row[col.field as keyof typeof row];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `AD_${selectedTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="ad-discovered-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <Database size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Active Directory - Discovered Data
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and analyze discovered Active Directory infrastructure
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<RefreshCw />}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {hasData ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Summary Stats */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <StatCard
                icon={<Users className="w-5 h-5" />}
                label="Users"
                value={stats.totalUsers}
                subValue={`${stats.enabledUsers} enabled`}
                color="blue"
              />
              <StatCard
                icon={<Shield className="w-5 h-5" />}
                label="Groups"
                value={stats.totalGroups}
                subValue={`${stats.totalGroupMembers} members`}
                color="green"
              />
              <StatCard
                icon={<Server className="w-5 h-5" />}
                label="Computers"
                value={stats.totalComputers}
                subValue={`${stats.enabledComputers} enabled`}
                color="purple"
              />
              <StatCard
                icon={<FolderTree className="w-5 h-5" />}
                label="OUs"
                value={stats.totalOUs}
                color="orange"
              />
              <StatCard
                icon={<Network className="w-5 h-5" />}
                label="Trusts"
                value={stats.totalTrusts}
                color="indigo"
              />
              <StatCard
                icon={<Database className="w-5 h-5" />}
                label="FSMO Roles"
                value={stats.totalFSMORoles}
                color="pink"
              />
              <StatCard
                icon={<Shield className="w-5 h-5" />}
                label="Service Accounts"
                value={stats.totalServiceAccounts}
                color="yellow"
              />
              <StatCard
                icon={<Settings className="w-5 h-5" />}
                label="Password Policies"
                value={stats.totalPasswordPolicies}
                color="red"
              />
              <StatCard
                icon={<Network className="w-5 h-5" />}
                label="Total Records"
                value={stats.totalRecords}
                color="teal"
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
                icon={<Database className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'users'}
                onClick={() => setSelectedTab('users')}
                label={`Users (${stats.totalUsers})`}
                icon={<Users className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'groups'}
                onClick={() => setSelectedTab('groups')}
                label={`Groups (${stats.totalGroups})`}
                icon={<Shield className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'computers'}
                onClick={() => setSelectedTab('computers')}
                label={`Computers (${stats.totalComputers})`}
                icon={<Server className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'ous'}
                onClick={() => setSelectedTab('ous')}
                label={`OUs (${stats.totalOUs})`}
                icon={<FolderTree className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'trusts'}
                onClick={() => setSelectedTab('trusts')}
                label={`Trusts (${stats.totalTrusts})`}
                icon={<Network className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'fsmo'}
                onClick={() => setSelectedTab('fsmo')}
                label={`FSMO Roles (${stats.totalFSMORoles})`}
                icon={<Database className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'passwords'}
                onClick={() => setSelectedTab('passwords')}
                label={`Password Policies (${stats.totalPasswordPolicies})`}
                icon={<Settings className="w-4 h-4" />}
              />
              <TabButton
                active={selectedTab === 'serviceaccounts'}
                onClick={() => setSelectedTab('serviceaccounts')}
                label={`Service Accounts (${stats.totalServiceAccounts})`}
                icon={<Shield className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Search and Actions */}
          {selectedTab !== 'overview' && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <SearchBar
                    value={searchText}
                    onChange={setSearchText}
                    placeholder={`Search ${selectedTab}...`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    icon={<Download />}
                    onClick={handleExport}
                    disabled={filteredData.length === 0}
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
              <OverviewTab stats={stats} usersData={usersData} groupsData={groupsData} />
            ) : (
              <div className="h-full p-4">
                <VirtualizedDataGrid
                  data={filteredData}
                  columns={currentTabData.columns}
                  loading={isLoading}
                  enableColumnReorder
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Database className="w-24 h-24 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Data Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No Active Directory data has been discovered yet. Run Active Directory discovery to populate this view.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Stat Card Component
 */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subValue?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray' | 'indigo' | 'pink' | 'yellow' | 'teal';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subValue, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    gray: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
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
      flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap
      ${active
        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'}
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

/**
 * Overview Tab Component
 */
interface OverviewTabProps {
  stats: any;
  usersData: any;
  groupsData: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats, usersData, groupsData }) => {
  // Extract domain info from first user record (if available)
  const domainInfo = useMemo(() => {
    const firstUser = usersData.data?.[0];
    if (!firstUser) return null;

    return {
      domain: firstUser.Domain || firstUser.DNSRoot || 'N/A',
      distinguishedName: firstUser.DistinguishedName || 'N/A',
    };
  }, [usersData.data]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Discovery Summary</h3>
        <div className="space-y-3">
          <SummaryRow label="Last Refresh" value={usersData.lastRefresh ? new Date(usersData.lastRefresh).toLocaleString() : 'N/A'} />
          <SummaryRow label="Total Records" value={stats.totalRecords} />
          <SummaryRow label="Status" value={<Badge variant="success">Active</Badge>} />
        </div>
      </div>

      {domainInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Domain Information</h3>
          <div className="space-y-3">
            <SummaryRow label="Domain" value={domainInfo.domain} />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Infrastructure Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <SummaryRow label="Total Users" value={stats.totalUsers} />
            <SummaryRow label="Enabled Users" value={stats.enabledUsers} />
            <SummaryRow label="Total Groups" value={stats.totalGroups} />
            <SummaryRow label="Group Memberships" value={stats.totalGroupMembers} />
            <SummaryRow label="Service Accounts" value={stats.totalServiceAccounts} />
          </div>
          <div className="space-y-3">
            <SummaryRow label="Computers" value={stats.totalComputers} />
            <SummaryRow label="Enabled Computers" value={stats.enabledComputers} />
            <SummaryRow label="Organizational Units" value={stats.totalOUs} />
            <SummaryRow label="Domain Trusts" value={stats.totalTrusts} />
            <SummaryRow label="FSMO Roles" value={stats.totalFSMORoles} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Security Policies</h3>
        <div className="space-y-3">
          <SummaryRow label="Password Policies" value={stats.totalPasswordPolicies} />
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

export default ActivedirectoryDiscoveredView;


