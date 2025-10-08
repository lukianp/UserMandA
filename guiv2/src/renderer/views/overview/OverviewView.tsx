/**
 * OverviewView Component
 *
 * Dashboard overview with real Logic Engine data integration.
 * Displays project timeline, statistics, system health, and recent activity.
 *
 * Phase 7: Complete Dashboard Implementation
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardLogic } from '../../hooks/useDashboardLogic';
import { ProjectTimelineCard } from '../../components/molecules/ProjectTimelineCard';
import { StatisticsCard } from '../../components/molecules/StatisticsCard';
import { SystemHealthPanel } from '../../components/molecules/SystemHealthPanel';
import { RecentActivityFeed } from '../../components/molecules/RecentActivityFeed';
import { QuickActionsPanel } from '../../components/molecules/QuickActionsPanel';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { RefreshCw, Users, Layers, Monitor, Server, AlertCircle } from 'lucide-react';

/**
 * OverviewView Component
 *
 * Complete dashboard implementation with:
 * - Real-time data from Logic Engine
 * - Auto-refresh every 30 seconds
 * - Clickable navigation cards
 * - System health monitoring
 * - Recent activity feed
 * - Quick action shortcuts
 */
const OverviewView: React.FC = () => {
  const { stats, project, health, activity, isLoading, error, reload } = useDashboardLogic();
  const navigate = useNavigate();

  // Loading state
  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-[var(--danger)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-[var(--danger)] mb-6">{error}</p>
          <Button onClick={reload} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!stats || !project) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">No data available</p>
          <Button onClick={reload} variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            M&A Discovery Suite Overview
          </p>
        </div>
        <Button
          onClick={reload}
          variant="secondary"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Project Timeline - Full Width */}
      <ProjectTimelineCard project={project} />

      {/* Statistics Grid - 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatisticsCard
          title="Users"
          value={stats?.totalUsers || 0}
          discovered={stats?.discoveredUsers}
          migrated={stats?.migratedUsers}
          icon={<Users className="w-6 h-6" />}
          onClick={() => navigate('/users')}
          data-cy="stats-users"
        />
        <StatisticsCard
          title="Groups"
          value={stats?.totalGroups || 0}
          discovered={stats?.discoveredGroups}
          migrated={stats?.migratedGroups}
          icon={<Layers className="w-6 h-6" />}
          onClick={() => navigate('/groups')}
          data-cy="stats-groups"
        />
        <StatisticsCard
          title="Computers"
          value={stats?.totalComputers || 0}
          discovered={stats?.discoveredComputers}
          icon={<Monitor className="w-6 h-6" />}
          onClick={() => navigate('/computers')}
          data-cy="stats-computers"
        />
        <StatisticsCard
          title="Infrastructure"
          value={stats?.totalInfrastructure || 0}
          icon={<Server className="w-6 h-6" />}
          onClick={() => navigate('/infrastructure')}
          data-cy="stats-infrastructure"
        />
      </div>

      {/* Activity & Health Grid - 2/3 + 1/3 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivityFeed activities={activity} />
        </div>

        {/* Sidebar - Takes 1 column */}
        <div className="space-y-6">
          {health && <SystemHealthPanel health={health} />}
          <QuickActionsPanel />
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-[var(--text-secondary)] pt-4 border-t border-[var(--border)]">
        Last updated: {new Date(stats.lastDataRefresh).toLocaleString()} | Data source: {stats.dataSource}
      </div>
    </div>
  );
};

export default OverviewView;
