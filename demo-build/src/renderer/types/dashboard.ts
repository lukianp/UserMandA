/**
 * Dashboard Enhancement Type Definitions
 * Complete type system for dashboard functionality
 */

/**
 * Core dashboard statistics from Logic Engine
 */
export interface DashboardStats {
  // Entity Counts
  totalUsers: number;
  totalGroups: number;
  totalComputers: number;
  totalInfrastructure: number;

  // Discovery Metrics
  discoveredUsers: number;
  discoveredGroups: number;
  discoveredComputers: number;
  discoveredApplications: number;

  // Migration Metrics
  migratedUsers: number;
  migratedGroups: number;
  pendingMigrationUsers: number;
  pendingMigrationGroups: number;

  // Metadata
  lastDiscoveryRun?: string; // ISO 8601 date string
  lastMigrationRun?: string; // ISO 8601 date string
  lastDataRefresh: string; // ISO 8601 date string
  dataSource: 'LogicEngine' | 'PowerShell' | 'Hybrid';
}

/**
 * Project timeline and wave management
 */
export interface ProjectTimeline {
  // Project Identity
  projectId: string;
  projectName: string;
  projectDescription?: string;

  // Timeline
  projectStartDate: string; // ISO 8601
  targetCutover: string; // ISO 8601
  nextWave: string; // ISO 8601

  // Calculated Fields
  daysToCutover: number;
  daysToNextWave: number;
  daysElapsed: number;

  // Phase Management
  currentPhase: ProjectPhase;
  phaseProgress: number; // 0-100

  // Wave Management
  totalWaves: number;
  completedWaves: number;
  activeWave?: number;
  waveProgress: number; // 0-100

  // Overall Progress
  overallProgress: number; // 0-100
  estimatedCompletionDate?: string; // ISO 8601
}

export type ProjectPhase =
  | 'Discovery'
  | 'Planning'
  | 'Migration'
  | 'Validation'
  | 'Cutover'
  | 'Complete';

/**
 * System health monitoring
 */
export interface SystemHealth {
  // Service Status
  logicEngineStatus: ServiceStatus;
  powerShellStatus: ServiceStatus;
  fileSystemStatus: ServiceStatus;
  networkStatus: ServiceStatus;

  // Performance Metrics
  dataFreshnessMinutes: number;
  avgResponseTimeMs: number;
  memoryUsageMB: number;
  cpuUsagePercent: number;

  // Error Tracking
  lastErrorCount: number;
  lastErrorTime?: string; // ISO 8601
  lastErrorMessage?: string;

  // Alerts
  activeAlerts: SystemAlert[];
}

export interface ServiceStatus {
  status: 'online' | 'offline' | 'degraded' | 'unknown';
  lastCheck: string; // ISO 8601
  responseTimeMs?: number;
  errorMessage?: string;
}

export interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: string; // ISO 8601
  acknowledged: boolean;
}

/**
 * Recent activity tracking
 */
export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string; // ISO 8601
  user?: string;
  entityCount?: number;
  status: 'success' | 'warning' | 'error' | 'info';
  actionUrl?: string; // Navigation target
}

export type ActivityType =
  | 'discovery'
  | 'migration'
  | 'validation'
  | 'configuration'
  | 'error'
  | 'system';

/**
 * Quick action definitions
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  description?: string;
  action: () => void | Promise<void>;
  enabled: boolean;
  badge?: string | number;
}

/**
 * Complete dashboard data model
 */
export interface DashboardData {
  stats: DashboardStats;
  timeline: ProjectTimeline;
  health: SystemHealth;
  recentActivity: ActivityItem[];
  quickActions: QuickAction[];
  lastUpdated: string; // ISO 8601
}


