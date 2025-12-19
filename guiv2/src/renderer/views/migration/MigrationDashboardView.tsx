/**
 * Migration Dashboard View
 *
 * Executive command center for migration control plane showing:
 * - Overall project health and KPIs
 * - Wave timeline and progress
 * - Active tasks with real-time status
 * - Alerts, blockers, and notifications
 * - Quick actions for migration management
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  HardDrive,
  Globe,
  MessageSquare,
  Monitor,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  FileText,
  Activity,
  Clock,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

import { useMigrationStore } from '../../store/useMigrationStore';
import { Button } from '../../components/atoms/Button';
import type { MigrationProject, MigrationWave, MigrationStatus } from '../../types/models/migration';

/**
 * KPI Card Component
 */
interface KPICardProps {
  label: string;
  total: number;
  migrated: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  colorGradient: string;
  iconColor: string;
}

const KPICard: React.FC<KPICardProps> = ({
  label,
  total,
  migrated,
  icon: Icon,
  colorGradient,
  iconColor,
}) => {
  const percentage = total > 0 ? Math.round((migrated / total) * 100) : 0;

  return (
    <div className={clsx('rounded-xl p-4 text-white shadow-lg bg-gradient-to-br', colorGradient)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={clsx('text-sm font-medium', iconColor.replace('text-', 'text-').replace('-600', '-100'))}>
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold">{migrated.toLocaleString()}</p>
            <p className="text-sm opacity-80">/ {total.toLocaleString()}</p>
          </div>
          <div className="mt-2">
            <div className="h-1.5 w-full rounded-full bg-white/20">
              <div
                className="h-1.5 rounded-full bg-white transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-1 text-xs opacity-90">{percentage}% Complete</p>
          </div>
        </div>
        <Icon className={clsx('h-12 w-12 opacity-80', iconColor.replace('-600', '-200'))} />
      </div>
    </div>
  );
};

/**
 * Wave Timeline Component
 */
interface WaveTimelineProps {
  waves: MigrationWave[];
  onWaveClick: (waveId: string) => void;
}

const WaveTimeline: React.FC<WaveTimelineProps> = ({ waves, onWaveClick }) => {
  const getWaveStatusColor = (status: MigrationStatus) => {
    const statusColors: Record<MigrationStatus, string> = {
      NotStarted: 'bg-gray-400',
      Planning: 'bg-yellow-400',
      Planned: 'bg-blue-400',
      Validating: 'bg-purple-400',
      Ready: 'bg-green-400',
      InProgress: 'bg-blue-600',
      Paused: 'bg-orange-500',
      Completed: 'bg-green-600',
      CompletedWithWarnings: 'bg-yellow-600',
      Failed: 'bg-red-600',
      Cancelled: 'bg-gray-600',
      RolledBack: 'bg-orange-600',
      Skipped: 'bg-gray-500',
    };
    return statusColors[status] || statusColors.NotStarted;
  };

  const getWaveStatusLabel = (status: MigrationStatus) => {
    const labels: Record<MigrationStatus, string> = {
      NotStarted: 'Not Started',
      Planning: 'Planning',
      Planned: 'Planned',
      Validating: 'Validating',
      Ready: 'Ready',
      InProgress: 'Active',
      Paused: 'Paused',
      Completed: 'Done',
      CompletedWithWarnings: 'Done (Warnings)',
      Failed: 'Failed',
      Cancelled: 'Cancelled',
      RolledBack: 'Rolled Back',
      Skipped: 'Skipped',
    };
    return labels[status] || 'Unknown';
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Wave Timeline</h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {waves.map((wave, index) => (
          <div key={wave.id} className="flex items-center gap-2">
            <button
              onClick={() => onWaveClick(wave.id)}
              className="group flex min-w-[140px] flex-col items-center gap-2 rounded-lg border border-gray-200 p-3 transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:hover:border-blue-400"
            >
              <div className={clsx('h-2 w-full rounded-full', getWaveStatusColor(wave.status))}>
                <div
                  className="h-2 rounded-full bg-white/40"
                  style={{ width: `${wave.progressPercentage || 0}%` }}
                />
              </div>
              <div className="w-full text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{wave.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{getWaveStatusLabel(wave.status)}</p>
              </div>
            </button>
            {index < waves.length - 1 && (
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Active Task Item Component
 */
interface ActiveTaskItemProps {
  taskName: string;
  progress: number;
  status: string;
}

const ActiveTaskItem: React.FC<ActiveTaskItemProps> = ({ taskName, progress, status }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{taskName}</p>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{progress}%</span>
      </div>
    </div>
    <PlayCircle className="ml-3 h-5 w-5 flex-shrink-0 text-blue-600" />
  </div>
);

/**
 * Alert Item Component
 */
interface AlertItemProps {
  type: 'error' | 'warning' | 'success';
  message: string;
  timestamp?: Date;
}

const AlertItem: React.FC<AlertItemProps> = ({ type, message, timestamp }) => {
  const alertStyles = {
    error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
    success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
  };

  const icons = {
    error: AlertTriangle,
    warning: AlertTriangle,
    success: CheckCircle,
  };

  const Icon = icons[type];

  return (
    <div className={clsx('flex items-start gap-2 rounded-lg border p-3', alertStyles[type])}>
      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm">{message}</p>
        {timestamp && (
          <p className="mt-1 text-xs opacity-70">{format(timestamp, 'MMM dd, HH:mm')}</p>
        )}
      </div>
    </div>
  );
};

/**
 * Migration Dashboard View
 */
export const MigrationDashboardView: React.FC = () => {
  const [currentProject, setCurrentProject] = useState<MigrationProject | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 12500,
    migratedUsers: 8750,
    totalMailboxes: 11200,
    migratedMailboxes: 7840,
    totalSites: 450,
    migratedSites: 315,
    totalOneDrive: 12500,
    migratedOneDrive: 8750,
    totalTeams: 180,
    migratedTeams: 126,
    totalDevices: 15000,
    migratedDevices: 10500,
  });

  const [activeTasks, setActiveTasks] = useState([
    { id: '1', name: 'Mailbox sync - jsmith@contoso.com', progress: 45, status: 'running' },
    { id: '2', name: 'SPO migration - Marketing site', progress: 78, status: 'running' },
    { id: '3', name: 'User provision - Wave 3 batch 1', progress: 23, status: 'running' },
  ]);

  const [alerts, setAlerts] = useState([
    { id: '1', type: 'warning' as const, message: '3 mailboxes exceeding size limit', timestamp: new Date() },
    { id: '2', type: 'warning' as const, message: 'License shortage detected (50 users)', timestamp: new Date() },
    { id: '3', type: 'success' as const, message: 'Wave 2 completed successfully', timestamp: new Date() },
  ]);

  const mockWaves: MigrationWave[] = [
    {
      id: '1',
      name: 'Wave 1',
      description: 'IT Pilot',
      order: 1,
      priority: 'High',
      plannedStartDate: '2024-03-01',
      plannedEndDate: '2024-03-08',
      actualStartDate: '2024-03-01',
      actualEndDate: '2024-03-07',
      createdAt: '2024-02-15',
      estimatedDuration: null,
      tasks: [],
      status: 'Completed',
      batches: [],
      metadata: {},
      notes: '',
      prerequisites: [],
      progressPercentage: 100,
    },
    {
      id: '2',
      name: 'Wave 2',
      description: 'HR & Legal',
      order: 2,
      priority: 'High',
      plannedStartDate: '2024-03-08',
      plannedEndDate: '2024-03-15',
      actualStartDate: '2024-03-08',
      actualEndDate: '2024-03-14',
      createdAt: '2024-02-15',
      estimatedDuration: null,
      tasks: [],
      status: 'Completed',
      batches: [],
      metadata: {},
      notes: '',
      prerequisites: [],
      progressPercentage: 100,
    },
    {
      id: '3',
      name: 'Wave 3',
      description: 'Finance',
      order: 3,
      priority: 'Normal',
      plannedStartDate: '2024-03-15',
      plannedEndDate: '2024-03-22',
      actualStartDate: '2024-03-15',
      actualEndDate: null,
      createdAt: '2024-02-15',
      estimatedDuration: null,
      tasks: [],
      status: 'InProgress',
      batches: [],
      metadata: {},
      notes: '',
      prerequisites: [],
      progressPercentage: 70,
    },
    {
      id: '4',
      name: 'Wave 4',
      description: 'Sales',
      order: 4,
      priority: 'Normal',
      plannedStartDate: '2024-03-22',
      plannedEndDate: '2024-03-29',
      actualStartDate: null,
      actualEndDate: null,
      createdAt: '2024-02-15',
      estimatedDuration: null,
      tasks: [],
      status: 'Planned',
      batches: [],
      metadata: {},
      notes: '',
      prerequisites: [],
      progressPercentage: 0,
    },
    {
      id: '5',
      name: 'Wave 5',
      description: 'Operations',
      order: 5,
      priority: 'Normal',
      plannedStartDate: '2024-03-29',
      plannedEndDate: '2024-04-05',
      actualStartDate: null,
      actualEndDate: null,
      createdAt: '2024-02-15',
      estimatedDuration: null,
      tasks: [],
      status: 'Planned',
      batches: [],
      metadata: {},
      notes: '',
      prerequisites: [],
      progressPercentage: 0,
    },
  ];

  const handleWaveClick = (waveId: string) => {
    console.log('[MigrationDashboardView] Wave clicked:', waveId);
    // Navigate to wave details or open modal
  };

  const handleStartWave = () => {
    console.log('[MigrationDashboardView] Start wave clicked');
  };

  const handlePauseAll = () => {
    console.log('[MigrationDashboardView] Pause all clicked');
  };

  const handleGenerateReport = () => {
    console.log('[MigrationDashboardView] Generate report clicked');
  };

  // Calculate overall progress
  const completedWaves = mockWaves.filter(w => w.status === 'Completed').length;
  const totalWaves = mockWaves.length;
  const overallProgress = Math.round((completedWaves / totalWaves) * 100);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <BarChart3 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Migration Control Plane</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Executive dashboard - Contoso Acquisition
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" icon={<FileText size={18} />} onClick={handleGenerateReport}>
            Generate Report
          </Button>
          <Button variant="secondary" icon={<PauseCircle size={18} />} onClick={handlePauseAll}>
            Pause All
          </Button>
          <Button variant="primary" icon={<PlayCircle size={18} />} onClick={handleStartWave}>
            Start Wave
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Project Progress Banner */}
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Project: Contoso Acquisition</h2>
              <p className="mt-1 text-blue-100">Wave {completedWaves + 1} of {totalWaves} Active</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{overallProgress}%</p>
              <p className="text-sm text-blue-100">Overall Progress</p>
              <p className="mt-1 text-xs text-blue-200">
                {dashboardStats.migratedUsers.toLocaleString()} / {dashboardStats.totalUsers.toLocaleString()} users migrated
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/20">
            <div
              className="h-2 rounded-full bg-white transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            label="Users"
            total={dashboardStats.totalUsers}
            migrated={dashboardStats.migratedUsers}
            icon={Users}
            colorGradient="from-blue-500 to-blue-600"
            iconColor="text-blue-200"
          />
          <KPICard
            label="Mailboxes"
            total={dashboardStats.totalMailboxes}
            migrated={dashboardStats.migratedMailboxes}
            icon={Mail}
            colorGradient="from-purple-500 to-purple-600"
            iconColor="text-purple-200"
          />
          <KPICard
            label="SharePoint Sites"
            total={dashboardStats.totalSites}
            migrated={dashboardStats.migratedSites}
            icon={Globe}
            colorGradient="from-green-500 to-green-600"
            iconColor="text-green-200"
          />
          <KPICard
            label="OneDrive"
            total={dashboardStats.totalOneDrive}
            migrated={dashboardStats.migratedOneDrive}
            icon={HardDrive}
            colorGradient="from-sky-500 to-sky-600"
            iconColor="text-sky-200"
          />
          <KPICard
            label="Teams"
            total={dashboardStats.totalTeams}
            migrated={dashboardStats.migratedTeams}
            icon={MessageSquare}
            colorGradient="from-violet-500 to-violet-600"
            iconColor="text-violet-200"
          />
          <KPICard
            label="Devices"
            total={dashboardStats.totalDevices}
            migrated={dashboardStats.migratedDevices}
            icon={Monitor}
            colorGradient="from-orange-500 to-orange-600"
            iconColor="text-orange-200"
          />
        </div>

        {/* Wave Timeline */}
        <WaveTimeline waves={mockWaves} onWaveClick={handleWaveClick} />

        {/* Active Tasks & Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Tasks */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Tasks</h3>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
              {activeTasks.map((task) => (
                <ActiveTaskItem
                  key={task.id}
                  taskName={task.name}
                  progress={task.progress}
                  status={task.status}
                />
              ))}
            </div>
            {activeTasks.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No active tasks
              </p>
            )}
          </div>

          {/* Alerts & Notifications */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts & Notifications</h3>
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  type={alert.type}
                  message={alert.message}
                  timestamp={alert.timestamp}
                />
              ))}
            </div>
            {alerts.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No alerts
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationDashboardView;
