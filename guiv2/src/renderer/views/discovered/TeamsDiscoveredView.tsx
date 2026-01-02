/**
 * Microsoft Teams Discovered View
 *
 * Rich discovered view with statistics, breakdowns, and data grids
 * for Microsoft Teams data
 */

import React from 'react';
import {
  Users,
  Globe,
  Lock,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  Activity,
  Eye,
  EyeOff,
} from 'lucide-react';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { useTeamsDiscoveredLogic } from '../../hooks/useTeamsDiscoveredLogic';
import { DiscoverySuccessCard } from '../../components/molecules/DiscoverySuccessCard';

export const TeamsDiscoveredView: React.FC = () => {
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
    teams,
  } = useTeamsDiscoveredLogic();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Microsoft Teams data...</p>
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
            <MessageSquare size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Microsoft Teams
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discovered Teams with visibility settings and membership details
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
          icon={MessageSquare}
          label="Total Teams"
          value={stats?.totalTeams ?? 0}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={Globe}
          label="Public Teams"
          value={stats?.publicTeams ?? 0}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={Lock}
          label="Private Teams"
          value={stats?.privateTeams ?? 0}
          gradient="from-purple-500 to-purple-600"
        />

        {/* Row 2 */}
        <StatCard
          icon={Calendar}
          label="Recent (30 days)"
          value={stats?.recentTeams ?? 0}
          gradient="from-yellow-500 to-yellow-600"
        />
        <StatCard
          icon={Eye}
          label="Visibility Types"
          value={stats?.byVisibility?.length ?? 0}
          gradient="from-indigo-500 to-indigo-600"
        />
        <StatCard
          icon={Users}
          label="Unique Teams"
          value={teams.filter((t, i, arr) => arr.findIndex(x => x.Id === t.Id) === i).length}
          gradient="from-cyan-500 to-cyan-600"
        />
        <StatCard
          icon={Activity}
          label="With Description"
          value={teams.filter(t => t.Description && t.Description.trim()).length}
          gradient="from-emerald-500 to-emerald-600"
        />

        {/* Row 3 */}
        <StatCard
          icon={Building2}
          label="Organization Teams"
          value={stats?.totalTeams ?? 0}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          icon={EyeOff}
          label="Hidden Teams"
          value={stats?.byVisibility?.find(v => v.name === 'HiddenMembership')?.count ?? 0}
          gradient="from-rose-500 to-rose-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active Teams"
          value={stats?.totalTeams ?? 0}
          gradient="from-violet-500 to-violet-600"
        />
        <StatCard
          icon={MessageSquare}
          label="Collaboration Hubs"
          value={stats?.totalTeams ?? 0}
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
            active={activeTab === 'teams'}
            onClick={() => setActiveTab('teams')}
            icon={MessageSquare}
            label={`Teams (${stats?.totalTeams ?? 0})`}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'overview' && stats && (
          <OverviewTab stats={stats} teams={teams} />
        )}

        {activeTab === 'teams' && (
          <div className="h-full flex flex-col p-6">
            {/* Search and Export */}
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search teams..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={() => exportToCSV(filteredData, 'microsoft-teams.csv')}
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
                csvFileName="microsoft-teams.csv"
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
  teams: any[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats, teams }) => {
  return (
    <div className="p-6 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Visibility */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Teams by Visibility
          </h3>
          <div className="space-y-3">
            {stats.byVisibility?.slice(0, 8).map((item: { name: string; count: number }) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    {item.name === 'Public' && <Globe className="w-4 h-4 text-green-500" />}
                    {item.name === 'Private' && <Lock className="w-4 h-4 text-purple-500" />}
                    {item.name === 'HiddenMembership' && <EyeOff className="w-4 h-4 text-gray-500" />}
                    {item.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(item.count / stats.totalTeams) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teams Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Teams Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Total Teams</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.totalTeams}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Public Teams</span>
              <span className="font-bold text-green-600">{stats.publicTeams}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Private Teams</span>
              <span className="font-bold text-purple-600">{stats.privateTeams}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-700 dark:text-gray-300">Created Last 30 Days</span>
              <span className="font-bold text-yellow-600">{stats.recentTeams}</span>
            </div>
          </div>
        </div>

        {/* Recent Teams */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Recent Teams
          </h3>
          <div className="space-y-3">
            {teams.slice(0, 5).map((team) => (
              <div key={team.Id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    team.Visibility === 'Public'
                      ? 'bg-green-100 dark:bg-green-900'
                      : 'bg-purple-100 dark:bg-purple-900'
                  }`}>
                    {team.Visibility === 'Public'
                      ? <Globe className="w-5 h-5 text-green-600" />
                      : <Lock className="w-5 h-5 text-purple-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{team.DisplayName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {team.Description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    team.Visibility === 'Public'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                    {team.Visibility}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {team.CreatedDateTime ? new Date(team.CreatedDateTime).toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
              </div>
            ))}
            {teams.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No teams discovered</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsDiscoveredView;
