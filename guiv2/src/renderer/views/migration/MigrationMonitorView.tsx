/**
 * Migration Monitor View
 *
 * Real-time progress dashboard for active migrations showing:
 * - Active wave status with overall progress
 * - Task queue (pending, running, completed)
 * - Live activity feed with real-time updates
 * - Throughput metrics (items/minute, error rate, ETA)
 * - Error log with retry actions
 * - Resource utilization monitoring
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  HardDrive,
  Cpu,
  Wifi,
  Pause,
  Play,
  SkipForward,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

import { Button } from '../../components/atoms/Button';
import type { MigrationTask, MigrationStatus } from '../../types/models/migration';

/**
 * Metric Card Component
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, trend, trendValue, icon: Icon, colorClass }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && trendValue && (
            <div className="mt-2 flex items-center gap-1">
              {TrendIcon && <TrendIcon size={14} className={clsx(
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              )} />}
              <span className={clsx(
                'text-xs font-medium',
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={clsx('p-3 rounded-lg', colorClass)}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};

/**
 * Task Queue Item Component
 */
interface TaskQueueItemProps {
  task: {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress?: number;
    startTime?: Date;
    endTime?: Date;
    error?: string;
  };
  onRetry?: (taskId: string) => void;
  onSkip?: (taskId: string) => void;
}

const TaskQueueItem: React.FC<TaskQueueItemProps> = ({ task, onRetry, onSkip }) => {
  const statusConfig = {
    pending: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
    running: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  };

  const config = statusConfig[task.status];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={clsx('p-2 rounded-lg', config.bg)}>
          <Icon size={16} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.name}</p>
          {task.status === 'running' && task.progress !== undefined && (
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 max-w-[200px] rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{task.progress}%</span>
            </div>
          )}
          {task.error && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 truncate">{task.error}</p>
          )}
        </div>
      </div>
      {task.status === 'failed' && (
        <div className="flex gap-2 ml-3">
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={() => onRetry(task.id)}>
              <RefreshCw size={14} />
            </Button>
          )}
          {onSkip && (
            <Button variant="ghost" size="sm" onClick={() => onSkip(task.id)}>
              <SkipForward size={14} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Activity Feed Item Component
 */
interface ActivityFeedItemProps {
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({ timestamp, type, message }) => {
  const typeConfig = {
    info: { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    success: { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    warning: { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    error: { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  };

  const config = typeConfig[type];

  return (
    <div className="flex gap-3 py-2">
      <div className="flex-shrink-0 pt-1">
        <div className={clsx('h-2 w-2 rounded-full', config.bg)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">{message}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {format(timestamp, 'HH:mm:ss')}
        </p>
      </div>
    </div>
  );
};

/**
 * Migration Monitor View
 */
export const MigrationMonitorView: React.FC = () => {
  const [waveStatus, setWaveStatus] = useState({
    waveName: 'Wave 3: Finance Department',
    phase: 'Migrating',
    overallProgress: 68,
    startTime: new Date(Date.now() - 3600000 * 2), // 2 hours ago
  });

  const [metrics, setMetrics] = useState({
    itemsPerMinute: 42,
    errorRate: 2.3,
    estimatedTimeRemaining: 95, // minutes
    activeConnections: 128,
    cpuUsage: 45,
    memoryUsage: 62,
    networkThroughput: 850, // Mbps
  });

  const [taskQueue] = useState([
    {
      id: '1',
      name: 'Mailbox migration - jdoe@contoso.com',
      status: 'completed' as const,
      progress: 100,
      startTime: new Date(Date.now() - 600000),
      endTime: new Date(Date.now() - 300000),
    },
    {
      id: '2',
      name: 'SharePoint site - Marketing',
      status: 'running' as const,
      progress: 67,
      startTime: new Date(Date.now() - 180000),
    },
    {
      id: '3',
      name: 'OneDrive - jsmith@contoso.com',
      status: 'running' as const,
      progress: 34,
      startTime: new Date(Date.now() - 120000),
    },
    {
      id: '4',
      name: 'User provision - Finance batch 2',
      status: 'failed' as const,
      error: 'License assignment failed',
      startTime: new Date(Date.now() - 90000),
      endTime: new Date(Date.now() - 60000),
    },
    {
      id: '5',
      name: 'Teams migration - Finance Team',
      status: 'pending' as const,
    },
    {
      id: '6',
      name: 'Distribution list - FinanceAll@contoso.com',
      status: 'pending' as const,
    },
  ]);

  const [activityFeed] = useState([
    {
      id: '1',
      timestamp: new Date(Date.now() - 10000),
      type: 'success' as const,
      message: 'Completed mailbox migration for jdoe@contoso.com (2.3 GB)',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 25000),
      type: 'info' as const,
      message: 'Started SharePoint site migration - Marketing (156 files)',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 45000),
      type: 'warning' as const,
      message: 'Slow transfer detected for OneDrive - jsmith@contoso.com (< 10 Mbps)',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 60000),
      type: 'error' as const,
      message: 'Failed to assign license for user provision - Finance batch 2',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 90000),
      type: 'success' as const,
      message: 'Group provisioned: Finance-Managers (25 members)',
    },
  ]);

  const handleRetry = (taskId: string) => {
    console.log('[MigrationMonitorView] Retry task:', taskId);
  };

  const handleSkip = (taskId: string) => {
    console.log('[MigrationMonitorView] Skip task:', taskId);
  };

  const handlePauseWave = () => {
    console.log('[MigrationMonitorView] Pause wave');
  };

  // Calculate ETA
  const etaDate = new Date(Date.now() + metrics.estimatedTimeRemaining * 60000);

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Migration Monitor</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time progress tracking - {waveStatus.waveName}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={<Pause size={18} />} onClick={handlePauseWave}>
            Pause Wave
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Active Wave Banner */}
        <div className="rounded-xl bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{waveStatus.waveName}</h2>
              <p className="text-green-100">Phase: {waveStatus.phase}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{waveStatus.overallProgress}%</p>
              <p className="text-sm text-green-100">Complete</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/20">
            <div
              className="h-2 rounded-full bg-white transition-all duration-500"
              style={{ width: `${waveStatus.overallProgress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-green-100">
            <span>Started: {format(waveStatus.startTime, 'MMM dd, HH:mm')}</span>
            <span>ETA: {format(etaDate, 'HH:mm')}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Throughput"
            value={`${metrics.itemsPerMinute}/min`}
            trend="up"
            trendValue="+12%"
            icon={Zap as any}
            colorClass="bg-gradient-to-br from-yellow-500 to-yellow-600"
          />
          <MetricCard
            label="Error Rate"
            value={`${metrics.errorRate}%`}
            trend="down"
            trendValue="-0.5%"
            icon={AlertCircle as any}
            colorClass="bg-gradient-to-br from-red-500 to-red-600"
          />
          <MetricCard
            label="ETA"
            value={`${metrics.estimatedTimeRemaining} min`}
            icon={Clock as any}
            colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <MetricCard
            label="Network"
            value={`${metrics.networkThroughput} Mbps`}
            trend="stable"
            icon={Wifi as any}
            colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
          />
        </div>

        {/* Resource Utilization */}
        <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resource Utilization
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">CPU</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{metrics.cpuUsage}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${metrics.cpuUsage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Memory</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{metrics.memoryUsage}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-green-600"
                  style={{ width: `${metrics.memoryUsage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Connections</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{metrics.activeConnections}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-purple-600"
                  style={{ width: '64%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Task Queue & Activity Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Queue */}
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task Queue
            </h3>
            <div className="space-y-0 max-h-[500px] overflow-y-auto">
              {taskQueue.map((task) => (
                <TaskQueueItem
                  key={task.id}
                  task={task}
                  onRetry={handleRetry}
                  onSkip={handleSkip}
                />
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Live Activity Feed
              </h3>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
              </div>
            </div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {activityFeed.map((activity) => (
                <ActivityFeedItem
                  key={activity.id}
                  timestamp={activity.timestamp}
                  type={activity.type}
                  message={activity.message}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationMonitorView;


