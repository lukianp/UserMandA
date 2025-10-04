/**
 * Discovery Type Definitions
 * Translated from GUI/Models/DiscoveryModels.cs
 */

import { Identifiable, Named, Status, TimestampMetadata, Dictionary, ProgressInfo } from '../common';

/**
 * Discovery module status enumeration
 */
export type DiscoveryModuleStatus =
  | 'Ready'
  | 'Running'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Disabled';

/**
 * Discovery configuration
 */
export interface DiscoveryConfig {
  moduleName: string;
  isEnabled: boolean;
  settings: Dictionary<any>;
  priority: number;
  timeout: number; // seconds
  parallelExecution: boolean;
}

/**
 * Discovery result from a module
 */
export interface DiscoveryResult extends Identifiable, Named, TimestampMetadata {
  moduleName: string;
  displayName: string;
  itemCount: number;
  discoveryTime: Date | string;
  duration: number; // milliseconds
  status: string;
  filePath: string;

  // Computed display properties
  itemCountText?: string;
  discoveryTimeText?: string;
  durationText?: string;

  // Legacy compatibility
  success: boolean;
  summary: string;
  errorMessage: string;
  dataCount?: number;
  additionalData: Dictionary<any>;
  createdAt?: Date | string;
}

/**
 * Discovery progress information
 */
export interface DiscoveryProgress extends ProgressInfo {
  moduleName: string;
  currentOperation: string;
  overallProgress: number; // 0-100
  moduleProgress: number; // 0-100
  status: DiscoveryModuleStatus;
  message: string;
  timestamp: Date | string;
}

/**
 * Module configuration for discovery
 */
export interface ModuleConfiguration {
  moduleName: string;
  isEnabled: boolean;
  settings: Dictionary<any>;
  priority: number;
  timeout: number; // seconds
  parallelExecution: boolean;
}

/**
 * Theme configuration
 */
export interface ThemeConfiguration {
  isDarkTheme: boolean;
  accentColor: string;
  fontSize: number;
  fontFamily: string;
  useAnimations: boolean;
  windowOpacity: number;
}

/**
 * Application settings
 */
export interface ApplicationSettings {
  theme: ThemeConfiguration;
  autoRefreshDashboard: boolean;
  refreshInterval: number; // seconds
  enableNotifications: boolean;
  defaultExportFormat: 'CSV' | 'JSON' | 'XLSX';
}

/**
 * Discovery module metadata
 */
export interface DiscoveryModule extends Identifiable, Named {
  name: string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  status: DiscoveryModuleStatus;
  version: string;
  lastRun: Date | string | null;
  lastDuration: number | null; // milliseconds
  priority: number;

  // Additional metadata
  filePath: string;
  author: string;
  category: string;
  configuration: Dictionary<any>;
  dependencies: string[];
  tags: string[];
  requiresElevation: boolean;
  timeoutMinutes: number;

  // Computed properties
  isRunning?: boolean;
}

/**
 * Discovery module view model (for UI)
 */
export interface DiscoveryModuleViewModel extends DiscoveryModule {
  statusMessage: string;
  progress: number; // 0-100
  resultCount: number;

  // Computed display properties
  statusText?: string;
  canRun?: boolean;
  lastRunText?: string;
  resultCountText?: string;
  priorityText?: string;
}

/**
 * Dashboard metric for real-time monitoring
 */
export interface DashboardMetric {
  title: string;
  value: number;
  icon: string;
  color: string;
  previousValue?: number;
  lastUpdated: Date | string;

  // Computed properties
  valueText?: string;
  changePercentage?: number;
  changeDirection?: 'up' | 'down' | 'same';
  lastUpdatedText?: string;
}

/**
 * Discovery metrics for environment scanning
 */
export interface DiscoveryMetrics {
  userCount: number;
  mailboxCount: number;
  fileShareCount: number;
  dependencyCount: number;
  applicationCount: number;
  securityGroupCount: number;
}

/**
 * Discovery module tile (for dashboard)
 */
export interface DiscoveryModuleTile extends Identifiable, Named {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  status: DiscoveryModuleStatus;
  isEnabled: boolean;
  lastRun: Date | string | null;
  resultCount: number;
  estimatedDuration: number; // seconds
  route: string; // Navigation route for quick launch
}

/**
 * Discovery tile for Infrastructure Discovery Hub
 * Simplified interface for dashboard display
 */
export interface DiscoveryTile {
  id: string;
  name: string;
  icon: string;
  description: string;
  lastRun?: Date | string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  resultCount?: number;
  route: string;
}

/**
 * Discovery execution options
 */
export interface DiscoveryExecutionOptions {
  moduleNames?: string[]; // If empty, run all enabled modules
  parallel?: boolean;
  timeout?: number; // seconds
  onProgress?: (progress: DiscoveryProgress) => void;
  onComplete?: (result: DiscoveryResult) => void;
  onError?: (error: Error) => void;
}

/**
 * Discovery summary for reporting
 */
export interface DiscoverySummary {
  totalModules: number;
  completedModules: number;
  failedModules: number;
  totalItems: number;
  totalDuration: number; // milliseconds
  startTime: Date | string;
  endTime: Date | string;
  results: DiscoveryResult[];
  errors: string[];
}

/**
 * Discovery filter criteria
 */
export interface DiscoveryFilterCriteria {
  categories?: string[];
  statuses?: DiscoveryModuleStatus[];
  dateRange?: {
    startDate: Date | string;
    endDate: Date | string;
  };
  searchText?: string;
}
