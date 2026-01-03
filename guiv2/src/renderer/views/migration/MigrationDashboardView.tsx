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

import React, { useState, useEffect, useCallback } from 'react';
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
  Plus,
  RefreshCw,
  XCircle,
  LucideIcon,
  Network,
  Target,
  Cloud,
  GitBranch,
  Shield,
  Gauge,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

import { useMigrationStore, DashboardKPIs, ActivityItem } from '../../store/useMigrationStore';
import { Button } from '../../components/atoms/Button';
import type { MigrationProject, MigrationWave, MigrationStatus, MigrationAlert, ActiveTask } from '../../types/models/migration';

/**
 * KPI Card Component
 */
interface KPICardProps {
  label: string;
  total: number;
  migrated: number;
  icon: LucideIcon;
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
 * Domain Stat Card Component
 */
interface DomainStatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  subtitle?: string;
}

const DomainStatCard: React.FC<DomainStatCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  subtitle,
}) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className={clsx('p-2 rounded-lg', bgColor)}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Health Score Indicator Component
 */
interface HealthScoreProps {
  label: string;
  score: number; // 0-100
  icon: LucideIcon;
}

const HealthScoreIndicator: React.FC<HealthScoreProps> = ({ label, score, icon: Icon }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-600', label: 'Excellent' };
    if (score >= 60) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'Good' };
    if (score >= 40) return { bg: 'bg-orange-500', text: 'text-orange-600', label: 'Fair' };
    return { bg: 'bg-red-500', text: 'text-red-600', label: 'Poor' };
  };

  const colors = getScoreColor(score);

  return (
    <div className="flex items-center gap-3">
      <div className={clsx('p-2 rounded-lg bg-gray-100 dark:bg-gray-700')}>
        <Icon size={16} className={colors.text} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          <span className={clsx('text-xs font-semibold', colors.text)}>{colors.label}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={clsx('h-2 rounded-full transition-all duration-500', colors.bg)}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <span className="text-sm font-bold text-gray-900 dark:text-white w-10 text-right">
        {score}%
      </span>
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
  // Store state
  const {
    projects,
    selectedProject,
    selectedProjectId,
    waves,
    dashboardKPIs,
    activeTasks,
    alerts,
    recentActivity,
    isLoading,
    error,
    loadProjects,
    selectProject,
    createProject,
    refreshDashboard,
    pauseWave,
    markAlertAsRead,
    dismissAlert,
    addAlert,
  } = useMigrationStore();

  // Local state for new project modal
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Load projects on mount
  useEffect(() => {
    console.log('[MigrationDashboardView] Component mounted, loading projects...');
    loadProjects();
  }, [loadProjects]);

  // Get waves from selected project or store
  const projectWaves = selectedProject?.waves || waves;

  // Mock data for demo (will be replaced with real data from discovery)
  const dashboardStats = {
    totalUsers: dashboardKPIs.totalUsers || 12500,
    migratedUsers: dashboardKPIs.migratedUsers || 8750,
    totalMailboxes: dashboardKPIs.totalMailboxes || 11200,
    migratedMailboxes: dashboardKPIs.migratedMailboxes || 7840,
    totalSites: dashboardKPIs.totalSharePointSites || 450,
    migratedSites: dashboardKPIs.migratedSharePointSites || 315,
    totalOneDrive: dashboardKPIs.totalOneDriveAccounts || 12500,
    migratedOneDrive: dashboardKPIs.migratedOneDriveAccounts || 8750,
    totalTeams: dashboardKPIs.totalTeams || 180,
    migratedTeams: dashboardKPIs.migratedTeams || 126,
    totalDevices: dashboardKPIs.totalDevices || 15000,
    migratedDevices: dashboardKPIs.migratedDevices || 10500,
  };

  // Default mock waves if no project waves exist
  const mockWaves: MigrationWave[] = projectWaves.length > 0 ? projectWaves : [
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

  // Mock active tasks if none from store
  const displayActiveTasks = activeTasks.length > 0 ? activeTasks : [
    { id: '1', name: 'Mailbox sync - jsmith@contoso.com', type: 'MailboxMigration' as const, workloadType: 'Mailboxes' as const, waveId: '3', waveName: 'Wave 3', status: 'Running' as const, progress: 45, itemsProcessed: 45, totalItems: 100, startedAt: new Date().toISOString() },
    { id: '2', name: 'SPO migration - Marketing site', type: 'SharePointMigration' as const, workloadType: 'SharePoint' as const, waveId: '3', waveName: 'Wave 3', status: 'Running' as const, progress: 78, itemsProcessed: 78, totalItems: 100, startedAt: new Date().toISOString() },
    { id: '3', name: 'User provision - Wave 3 batch 1', type: 'UserMigration' as const, workloadType: 'Users' as const, waveId: '3', waveName: 'Wave 3', status: 'Running' as const, progress: 23, itemsProcessed: 23, totalItems: 100, startedAt: new Date().toISOString() },
  ];

  // Mock alerts if none from store
  const displayAlerts = alerts.length > 0 ? alerts : [
    { id: '1', type: 'Warning' as const, title: 'Size Warning', message: '3 mailboxes exceeding size limit', timestamp: new Date().toISOString(), isRead: false, actionRequired: true },
    { id: '2', type: 'Warning' as const, title: 'License Warning', message: 'License shortage detected (50 users)', timestamp: new Date().toISOString(), isRead: false, actionRequired: true },
    { id: '3', type: 'Success' as const, title: 'Wave Complete', message: 'Wave 2 completed successfully', timestamp: new Date().toISOString(), isRead: false, actionRequired: false },
  ];

  const handleWaveClick = useCallback((waveId: string) => {
    console.log('[MigrationDashboardView] Wave clicked:', waveId);
    // Navigate to wave details or open modal
  }, []);

  const handleStartWave = useCallback(async () => {
    console.log('[MigrationDashboardView] Start wave clicked');
    const nextWave = mockWaves.find(w => w.status === 'Planned' || w.status === 'Ready');
    if (nextWave) {
      // TODO: Implement startWave in useMigrationStore
      console.log(`[MigrationDashboardView] Would start wave: ${nextWave.id}`);
      addAlert({
        type: 'Info',
        title: 'Wave Start',
        message: `Starting wave: ${nextWave.name}`,
        actionRequired: false,
      });
    }
  }, [mockWaves, addAlert]);

  const handlePauseAll = useCallback(async () => {
    console.log('[MigrationDashboardView] Pause all clicked');
    const activeWave = mockWaves.find(w => w.status === 'InProgress');
    if (activeWave) {
      await pauseWave(activeWave.id);
    }
  }, [mockWaves, pauseWave]);

  const handleGenerateReport = useCallback(() => {
    console.log('[MigrationDashboardView] Generate report clicked');
    addAlert({
      type: 'Info',
      title: 'Report Generation',
      message: 'Report generation started. This may take a few minutes.',
      actionRequired: false,
    });
  }, [addAlert]);

  const handleRefresh = useCallback(async () => {
    console.log('[MigrationDashboardView] Refresh clicked');
    await refreshDashboard();
  }, [refreshDashboard]);

  const handleCreateProject = useCallback(async () => {
    if (newProjectName.trim()) {
      await createProject({
        name: newProjectName,
        description: `Migration project: ${newProjectName}`,
        status: 'Planning',
        sourceProfileId: '',
        targetProfileId: '',
        plannedStartDate: new Date().toISOString(),
        plannedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
        overallProgress: 0,
        currentPhase: 'Planning',
        createdBy: 'System',
        tags: [],
        metadata: {},
      });
      setNewProjectName('');
      setShowNewProjectModal(false);
    }
  }, [newProjectName, createProject]);

  // Calculate overall progress
  const completedWaves = mockWaves.filter(w => w.status === 'Completed').length;
  const totalWaves = mockWaves.length;
  const overallProgress = dashboardKPIs.overallProgress || Math.round((completedWaves / totalWaves) * 100);

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900">
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
          <Button variant="ghost" icon={<RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Button variant="ghost" icon={<FileText size={18} />} onClick={handleGenerateReport}>
            Generate Report
          </Button>
          <Button variant="secondary" icon={<PauseCircle size={18} />} onClick={handlePauseAll}>
            Pause All
          </Button>
          <Button variant="primary" icon={<PlayCircle size={18} />} onClick={handleStartWave}>
            Start Wave
          </Button>
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => setShowNewProjectModal(true)}>
            New Project
          </Button>
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[400px] shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Migration Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name (e.g., Contoso Acquisition)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowNewProjectModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateProject}>Create Project</Button>
            </div>
          </div>
        </div>
      )}

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

        {/* Domain Mapping & Cross-Domain Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Domain Statistics */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Domain Mapping</h3>
            </div>
            <div className="space-y-3">
              <DomainStatCard
                label="Source Domains"
                value={dashboardKPIs.sourceDomains || 3}
                icon={Network}
                color="text-blue-600"
                bgColor="bg-blue-100 dark:bg-blue-900/20"
                subtitle="Active Directory forests"
              />
              <DomainStatCard
                label="Target Domains"
                value={dashboardKPIs.targetDomains || 1}
                icon={Target}
                color="text-green-600"
                bgColor="bg-green-100 dark:bg-green-900/20"
                subtitle="Microsoft 365 tenants"
              />
            </div>
          </div>

          {/* Cross-Domain Entities */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cross-Domain Assets</h3>
            </div>
            <div className="space-y-3">
              <DomainStatCard
                label="Cross-Domain Users"
                value={dashboardKPIs.crossDomainUsers || 8420}
                icon={Users}
                color="text-purple-600"
                bgColor="bg-purple-100 dark:bg-purple-900/20"
                subtitle="Spanning multiple domains"
              />
              <DomainStatCard
                label="Azure Resources"
                value={dashboardKPIs.azureResources || 1250}
                icon={Cloud}
                color="text-sky-600"
                bgColor="bg-sky-100 dark:bg-sky-900/20"
                subtitle="VMs, storage, networks"
              />
            </div>
          </div>

          {/* Migration Health Scores */}
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Migration Health</h3>
            </div>
            <div className="space-y-3">
              <HealthScoreIndicator
                label="Domain Mapping"
                score={dashboardKPIs.domainMappingHealth || 92}
                icon={GitBranch}
              />
              <HealthScoreIndicator
                label="User Migration"
                score={dashboardKPIs.userMigrationHealth || 88}
                icon={Users}
              />
              <HealthScoreIndicator
                label="Azure Migration"
                score={dashboardKPIs.azureMigrationHealth || 75}
                icon={Cloud}
              />
              <HealthScoreIndicator
                label="Overall Readiness"
                score={dashboardKPIs.overallHealth || 85}
                icon={Shield}
              />
            </div>
          </div>
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
              {displayActiveTasks.map((task) => (
                <ActiveTaskItem
                  key={task.id}
                  taskName={task.name}
                  progress={task.progress}
                  status={task.status}
                />
              ))}
            </div>
            {displayActiveTasks.length === 0 && (
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
              {displayAlerts.map((alert) => (
                <div key={alert.id} className="relative">
                  <AlertItem
                    type={alert.type.toLowerCase() as 'error' | 'warning' | 'success'}
                    message={alert.message}
                    timestamp={new Date(alert.timestamp)}
                  />
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              ))}
            </div>
            {displayAlerts.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No alerts
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentActivity.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 text-sm">
                  <div className={clsx(
                    'w-2 h-2 rounded-full',
                    activity.type === 'task' && 'bg-blue-500',
                    activity.type === 'wave' && 'bg-green-500',
                    activity.type === 'checkpoint' && 'bg-purple-500',
                    activity.type === 'alert' && 'bg-orange-500',
                    activity.type === 'project' && 'bg-cyan-500',
                  )} />
                  <span className="flex-1 text-gray-700 dark:text-gray-300">{activity.message}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(activity.timestamp), 'HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationDashboardView;


