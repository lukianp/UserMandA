/**
 * Infrastructure Discovery Hub View
 * Central dashboard for all discovery modules with quick launch capability
 */

import React from 'react';
import { useInfrastructureDiscoveryHubLogic } from '../../hooks/useInfrastructureDiscoveryHubLogic';
import SearchBar from '../../components/molecules/SearchBar';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import Badge from '../../components/atoms/Badge';
import StatusIndicator from '../../components/atoms/StatusIndicator';
import {
  RefreshCw,
  Filter,
  Grid,
  List,
  Clock,
  Activity,
  ChevronRight,
  Database,
  Cloud,
  Mail,
  Inbox,
  FolderTree,
  Users,
  HardDrive,
  Package,
  Folder,
  Network,
  Shield,
  Server,
  PlayCircle,
} from 'lucide-react';
import { format } from 'date-fns';

/**
 * Icon mapping for discovery modules
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Database,
  Cloud,
  Mail,
  Inbox,
  FolderTree,
  Users,
  HardDrive,
  Package,
  Folder,
  Network,
  Shield,
  Server,
};

/**
 * Status badge variant mapping
 */
const statusVariantMap: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
  idle: 'default',
  running: 'primary',
  completed: 'success',
  failed: 'danger',
};

/**
 * Status indicator type mapping
 */
const statusIndicatorMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'idle' | 'unknown'> = {
  idle: 'idle',
  running: 'info',
  completed: 'success',
  failed: 'error',
};

/**
 * Infrastructure Discovery Hub View Component
 */
const InfrastructureDiscoveryHubView: React.FC = () => {
  const {
    discoveryModules,
    recentActivity,
    activeDiscoveries,
    isLoading,
    filter,
    sortBy,
    launchDiscovery,
    setFilter,
    setSortBy,
    refresh,
  } = useInfrastructureDiscoveryHubLogic();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="infrastructure-discovery-hub">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Grid className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Discovery Hub
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Central dashboard for all discovery modules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={refresh}
              data-cy="refresh-btn"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-4 pb-4 flex items-center gap-3">
          <div className="flex-1">
            <SearchBar
              value={filter}
              onChange={setFilter}
              placeholder="Search discovery modules..."
              data-cy="discovery-search"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Sort by:</label>
            <select
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              data-cy="sort-select"
            >
              <option value="name">Name</option>
              <option value="lastRun">Last Run</option>
              <option value="status">Status</option>
              <option value="resultCount">Result Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Discovery Modules Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Active Discoveries Banner */}
              {activeDiscoveries?.length > 0 && (
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Active Discoveries ({activeDiscoveries?.length ?? 0})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {activeDiscoveries?.map((active) => (
                      <div
                        key={active.id}
                        className="bg-white dark:bg-gray-800 rounded-md p-3 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusIndicator status="info" size="sm" text="Running" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {active.moduleName}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {active.currentOperation}
                          </p>
                        </div>
                        <div className="ml-4 w-48">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                              {active.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${active.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discovery Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {discoveryModules?.map((module) => {
                  const IconComponent = iconMap[module.icon] || Database;

                  return (
                    <div
                      key={module.id}
                      className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer"
                      onClick={() => launchDiscovery(module.route)}
                      data-cy={`discovery-tile-${module.id}`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                            <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <Badge
                          variant={statusVariantMap[module.status]}
                          size="sm"
                          dot
                        >
                          {module.status}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="mb-3">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {module.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {module.description}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {module.lastRun
                              ? format(new Date(module.lastRun), 'MMM d, yyyy')
                              : 'Never run'}
                          </span>
                        </div>
                        {module.resultCount !== undefined && module.resultCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            <span>{(module.resultCount ?? 0).toLocaleString()} items</span>
                          </div>
                        )}
                      </div>

                      {/* Hover Action */}
                      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-medium">
                          <PlayCircle className="w-4 h-4" />
                          <span>Launch Discovery</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {discoveryModules?.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Grid className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No discovery modules found
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setFilter('')}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recent Activity Sidebar */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Activity
              </h2>
            </div>
          </div>

          <div className="p-4">
            {recentActivity?.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No recent activity
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity?.slice(0, 20).map((activity) => (
                  <div
                    key={activity.id}
                    className="pb-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.moduleName}
                      </span>
                      <StatusIndicator
                        status={statusIndicatorMap[activity.status]}
                        size="sm"
                        text={activity.status}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{format(activity.timestamp, 'MMM d, h:mm a')}</span>
                      <span>{activity.resultCount?.toLocaleString() ?? 0} items</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Duration: {((activity.duration ?? 0) / 1000).toFixed(1)}s
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureDiscoveryHubView;
