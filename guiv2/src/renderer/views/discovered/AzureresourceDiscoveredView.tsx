/**
 * Azure Resource Discovered View
 * Rich presentation of discovered Azure infrastructure from CSV files
 */

import * as React from 'react';
import {
  Cloud,
  HardDrive,
  Key,
  Network,
  Globe,
  Shield,
  FolderTree,
  Layers,
  Download,
  RefreshCw,
  MapPin,
  Users,
  ChevronRight,
  ChevronDown,
  User,
  Building2,
  Settings,
} from 'lucide-react';
import { useState, useMemo } from 'react';

import { useAzureResourceDiscoveredLogic } from '../../hooks/useAzureResourceDiscoveredLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import { DiscoverySuccessCard } from '../../components/molecules/DiscoverySuccessCard';

const AzureResourceDiscoveredView: React.FC = () => {
  const {
    isLoading,
    error,
    activeTab,
    searchText,
    stats,
    columns,
    filteredData,
    groupMembers,
    setActiveTab,
    setSearchText,
    reloadData,
    exportToCSV,
    clearError,
  } = useAzureResourceDiscoveredLogic();

  // State for expanded groups in hierarchical view
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group members by GroupId for hierarchical display
  const groupedMemberData = useMemo(() => {
    if (!groupMembers || groupMembers.length === 0) return [];

    const groupMap = new Map<string, {
      groupId: string;
      groupName: string;
      groupType: string;
      groupMail: string;
      isDynamic: boolean;
      members: Array<{
        id: string;
        name: string;
        upn: string;
        mail: string;
        type: string;
      }>;
    }>();

    const search = searchText.toLowerCase();

    groupMembers.forEach((m: any) => {
      // Apply search filter
      if (search) {
        const matchesGroup = m.GroupDisplayName?.toLowerCase().includes(search) || m.GroupMail?.toLowerCase().includes(search);
        const matchesMember = m.MemberDisplayName?.toLowerCase().includes(search) || m.MemberUPN?.toLowerCase().includes(search);
        if (!matchesGroup && !matchesMember) return;
      }

      if (!groupMap.has(m.GroupId)) {
        groupMap.set(m.GroupId, {
          groupId: m.GroupId,
          groupName: m.GroupDisplayName || 'Unknown Group',
          groupType: m.GroupType || 'Unknown',
          groupMail: m.GroupMail || '',
          isDynamic: m.IsDynamicGroup === 'True' || m.IsDynamicGroup === true,
          members: []
        });
      }
      groupMap.get(m.GroupId)!.members.push({
        id: m.MemberId,
        name: m.MemberDisplayName || 'Unknown',
        upn: m.MemberUPN || '',
        mail: m.MemberMail || '',
        type: m.MemberType || 'unknown'
      });
    });

    return Array.from(groupMap.values()).sort((a, b) => b.members.length - a.members.length);
  }, [groupMembers, searchText]);

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const expandAllGroups = () => {
    setExpandedGroups(new Set(groupedMemberData.map(g => g.groupId)));
  };

  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  const getMemberTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user': return <User className="w-4 h-4 text-blue-500" />;
      case 'group': return <Users className="w-4 h-4 text-purple-500" />;
      case 'serviceprincipal': return <Settings className="w-4 h-4 text-orange-500" />;
      default: return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'SecurityGroup': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Microsoft365Group': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'DistributionList': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden" data-testid="azure-resource-discovered-view">
      {isLoading && <LoadingOverlay message="Loading Azure Resource data..." />}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <Cloud className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Azure Resource Data</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View discovered subscriptions, resource groups, storage, networking, and more
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={reloadData} variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          {filteredData.length > 0 && (
            <Button
              onClick={() => exportToCSV(filteredData, `azure-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`)}
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
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
        <div className="grid grid-cols-5 gap-4 p-6 flex-shrink-0">
          {/* Discovery Success Card - FIRST with animations */}
          <DiscoverySuccessCard
            percentage={stats.discoverySuccessPercentage}
            received={stats.dataSourcesReceivedCount}
            total={stats.dataSourcesTotal}
            showAnimation={true}
          />

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Cloud className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.totalResources.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Resources</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.subscriptions}</div>
                <div className="text-sm opacity-90">Subscriptions</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <FolderTree className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.resourceGroups}</div>
                <div className="text-sm opacity-90">Resource Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <HardDrive className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.storageAccounts}</div>
                <div className="text-sm opacity-90">Storage Accounts</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Key className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.keyVaults}</div>
                <div className="text-sm opacity-90">Key Vaults</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Network className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.virtualNetworks}</div>
                <div className="text-sm opacity-90">Virtual Networks</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.nsgs}</div>
                <div className="text-sm opacity-90">Security Groups</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.webApps}</div>
                <div className="text-sm opacity-90">Web Apps</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.groupMembers.toLocaleString()}</div>
                <div className="text-sm opacity-90">Group Members</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <FolderTree className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.uniqueGroups.toLocaleString()}</div>
                <div className="text-sm opacity-90">Unique Groups</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 flex-shrink-0">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'overview', icon: Cloud, label: 'Overview' },
            { id: 'subscriptions', icon: Layers, label: 'Subscriptions', count: stats?.subscriptions },
            { id: 'resourcegroups', icon: FolderTree, label: 'Resource Groups', count: stats?.resourceGroups },
            { id: 'storage', icon: HardDrive, label: 'Storage', count: stats?.storageAccounts },
            { id: 'keyvaults', icon: Key, label: 'Key Vaults', count: stats?.keyVaults },
            { id: 'networks', icon: Network, label: 'Networks', count: stats?.virtualNetworks },
            { id: 'nsgs', icon: Shield, label: 'NSGs', count: stats?.nsgs },
            { id: 'webapps', icon: Globe, label: 'Web Apps', count: stats?.webApps },
            { id: 'groupmembers', icon: Users, label: 'Group Members', count: stats?.groupMembers },
          ].map(({ id, icon: Icon, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-6">
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resource Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { icon: Layers, label: 'Subscriptions', value: stats.subscriptions, color: 'purple' },
                    { icon: FolderTree, label: 'Resource Groups', value: stats.resourceGroups, color: 'indigo' },
                    { icon: HardDrive, label: 'Storage Accounts', value: stats.storageAccounts, color: 'green' },
                    { icon: Key, label: 'Key Vaults', value: stats.keyVaults, color: 'yellow' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 text-${color}-600`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                      </div>
                      <span className={`text-lg font-bold text-${color}-600`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Network Resources</h3>
                <div className="space-y-3">
                  {[
                    { icon: Network, label: 'Virtual Networks', value: stats.virtualNetworks, color: 'cyan' },
                    { icon: Shield, label: 'Network Security Groups', value: stats.nsgs, color: 'orange' },
                    { icon: Globe, label: 'Web Apps', value: stats.webApps, color: 'pink' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 text-${color}-600`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                      </div>
                      <span className={`text-lg font-bold text-${color}-600`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {stats.topLocations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resources by Location</h3>
                <div className="space-y-3">
                  {stats.topLocations.map((loc) => (
                    <div key={loc.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{loc.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{loc.count} resources</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                          <div className="bg-blue-600 h-full" style={{ width: `${(loc.count / stats.totalResources) * 100}%` }} />
                        </div>
                        <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
                          {((loc.count / stats.totalResources) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab !== 'overview' && activeTab !== 'groupmembers' && (
          <>
            <div className="mb-4">
              <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search..." />
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid data={filteredData as any[]} columns={columns} loading={isLoading} enableColumnReorder enableColumnResize />
            </div>
          </>
        )}

        {/* Special hierarchical view for Group Members */}
        {activeTab === 'groupmembers' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and controls */}
            <div className="mb-4 flex items-center gap-4">
              <div className="flex-1">
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search groups or members..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={expandAllGroups} variant="secondary" size="sm">
                  Expand All
                </Button>
                <Button onClick={collapseAllGroups} variant="secondary" size="sm">
                  Collapse All
                </Button>
              </div>
            </div>

            {/* Summary stats */}
            <div className="mb-4 flex gap-4 text-sm">
              <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 rounded-full">
                {groupedMemberData.length} Groups
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                {groupMembers?.length || 0} Total Memberships
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                {expandedGroups.size} Expanded
              </span>
            </div>

            {/* Hierarchical group list */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-auto">
              {groupedMemberData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Group Membership Data</h3>
                    <p className="text-gray-500 dark:text-gray-400">Run Azure Resource Discovery to enumerate group members.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {groupedMemberData.map((group) => (
                    <div key={group.groupId} className="group">
                      {/* Group header row */}
                      <div
                        onClick={() => toggleGroupExpansion(group.groupId)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="text-gray-400">
                          {expandedGroups.has(group.groupId) ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                        <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-lg">
                          <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {group.groupName}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getGroupTypeColor(group.groupType)}`}>
                              {group.groupType}
                            </span>
                            {group.isDynamic && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                Dynamic
                              </span>
                            )}
                          </div>
                          {group.groupMail && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {group.groupMail}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                            {group.members.length} members
                          </span>
                        </div>
                      </div>

                      {/* Expanded member list */}
                      {expandedGroups.has(group.groupId) && (
                        <div className="bg-gray-50 dark:bg-gray-850 border-t border-gray-100 dark:border-gray-700">
                          <div className="pl-14 pr-4 py-2">
                            <div className="grid grid-cols-1 gap-1">
                              {group.members.map((member, idx) => (
                                <div
                                  key={`${member.id}-${idx}`}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                >
                                  {getMemberTypeIcon(member.type)}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {member.name}
                                      </span>
                                      <span className="text-xs text-gray-400 capitalize">
                                        ({member.type})
                                      </span>
                                    </div>
                                    {member.upn && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {member.upn}
                                      </div>
                                    )}
                                  </div>
                                  {member.mail && member.mail !== member.upn && (
                                    <div className="text-xs text-gray-400 truncate max-w-[200px]">
                                      {member.mail}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!isLoading && !stats && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Cloud className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Azure Resource Data</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Run an Azure Resource Discovery to populate this view.</p>
              <Button onClick={reloadData} variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>Refresh Data</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AzureResourceDiscoveredView;
