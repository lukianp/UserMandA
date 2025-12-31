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
 * Discovery type enumeration
 */
export type DiscoveryType =
  | 'Azure'
  | 'Domain'
  | 'FileSystem'
  | 'Infrastructure'
  | 'Licensing'
  | 'SharePoint'
  | 'Teams'
  | 'WebServer'
  | 'HyperV'
  | 'IdentityGovernance';

/**
 * Discovery status enumeration
 */
export type DiscoveryStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

/**
 * Discovery configuration
 */
export interface DiscoveryConfig {
  id?: string; // Optional ID for service compatibility
  name?: string; // Optional name for service compatibility
  type?: string; // Optional type for service compatibility
  moduleName: string;
  isEnabled: boolean;
  settings: Dictionary<any>;
  priority: number;
  timeout: number; // seconds
  parallelExecution: boolean;
  parameters?: Dictionary<any>; // Optional parameters for service compatibility
  credentials?: Dictionary<any>; // Optional credentials for service compatibility
  retryPolicy?: Dictionary<any>; // Optional retry policy for service compatibility
}

/**
 * Discovery result from a module
 */
export interface DiscoveryResult extends Identifiable, Named {
  moduleName: string;
  displayName: string;
  itemCount: number;
  discoveryTime: Date | string;
  duration: number; // milliseconds
  status: string;
  filePath: string;
  createdAt: Date | string;
  updatedAt?: Date | string;

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

  // Additional properties for service compatibility
  data?: any[];
  startTime?: Date | string;
  endTime?: Date | string;
  errors?: string[];
  warnings?: string[];
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

/**
 * Scheduled discovery configuration
 */
export interface ScheduledDiscovery extends Identifiable, Named {
  id: string;
  name: string;
  description?: string;
  configId: string;
  schedule: string; // cron expression
  isEnabled: boolean;
  enabled?: boolean; // Alias for isEnabled
  lastRun?: Date | string;
  nextRun?: Date | string;
  createdAt: Date | string;
  updatedAt?: Date | string;

  // Additional properties for service compatibility
  type?: string;
  parameters?: Dictionary<any>;
  credentials?: Dictionary<any>;
  timeout?: number;
  retryPolicy?: Dictionary<any>;
}

/**
 * Discovery template for saved configurations
 */
export interface DiscoveryTemplate extends Identifiable, Named {
  id: string;
  name: string;
  description?: string;
  category: string;
  config: DiscoveryConfig;
  isDefault: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
  createdBy: string;

  // Additional properties for service compatibility
  type?: string;
  parameters?: Dictionary<any>;
  credentials?: Dictionary<any>;
  timeout?: number;
  retryPolicy?: Dictionary<any>;
}

/**
 * Discovery run instance
 */
export interface DiscoveryRun extends Identifiable, TimestampMetadata {
  id: string;
  configId: string;
  templateId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  startTime?: Date | string;
  endTime?: Date | string;
  duration?: number; // milliseconds
  progress: number; // 0-100
  message?: string;
  error?: string;
  results?: DiscoveryResult[];
  config?: DiscoveryConfig; // Full config object
  result?: DiscoveryResult; // Single result
}

/**
 * Comparison result between discovery runs
 */
export interface ComparisonResult {
  runId1: string;
  runId2: string;
  timestamp: Date | string;
  differences: {
    added: DiscoveryResult[];
    removed: DiscoveryResult[];
    modified: {
      item: DiscoveryResult;
      changes: Dictionary<any>;
    }[];
  };
  summary: {
    totalAdded: number;
    totalRemoved: number;
    totalModified: number;
  };
  added?: DiscoveryResult[]; // Alias for differences.added
  modified?: { item: DiscoveryResult; changes: Dictionary<any>; }[]; // Alias for differences.modified
}

/**
 * Validation result for discovery configurations
 */
export interface ValidationResult {
  isValid: boolean;
  passed?: boolean; // Alias for isValid
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Connection test result
 */
export interface ConnectionResult {
  success: boolean;
  message: string;
  details?: Dictionary<any>;
  timestamp: Date | string;
  duration?: number; // milliseconds
  latency?: number; // milliseconds, alias for duration
}

/**
 * Network diagnostic test result
 */
export interface DiagnosticTestResult {
  Test: string;
  Result: 'PASS' | 'FAIL' | 'ERROR';
  Details: string;
}

/**
 * Alternative scan result
 */
export interface AlternativeScanResult {
  Method: string;
  HostsFound: number;
  Details: string;
}

/**
 * Network diagnostic results
 */
export interface NetworkDiagnosticResults {
  ConnectivityTests: DiagnosticTestResult[];
  AlternativeScans: AlternativeScanResult[];
  Recommendations: string[];
  IssuesDetected: string[];
}

/**
 * Infrastructure discovery result with diagnostics
 */
export interface InfrastructureDiscoveryResult {
  totalServers?: number;
  totalNetworkDevices?: number;
  totalStorageDevices?: number;
  totalSecurityDevices?: number;
  totalVirtualization?: number;
  totalItems?: number;
  outputPath?: string;
  servers?: any[];
  networkDevices?: any[];
  storageDevices?: any[];
  securityDevices?: any[];
  virtualization?: any[];
  statistics?: {
    physicalServers?: number;
    virtualServers?: number;
    totalStorage?: number;
    networkSegments?: number;
  };
  diagnostics?: NetworkDiagnosticResults;
  manualSubnets?: string[];
  manualSubnetResults?: any[];
  discoveryTime?: string | Date;
  duration?: number;
}

/**
 * History filter for discovery runs
 */
export interface HistoryFilter {
  configIds?: string[];
  templateIds?: string[];
  statuses?: ('pending' | 'running' | 'completed' | 'failed' | 'cancelled')[];
  type?: string;
  status?: string; // Single status value
  startDate?: Date | string;
  endDate?: Date | string;
  dateRange?: {
    startDate: Date | string;
    endDate: Date | string;
  };
  searchText?: string;
  limit?: number;
}


