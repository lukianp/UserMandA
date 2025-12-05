/**
 * Application Discovery Type Definitions
 * Comprehensive types for application discovery operations
 */

import { Identifiable, TimestampMetadata } from '../common';

/**
 * Application data model from CSV files
 */
export interface ApplicationData {
  name: string | null;
  version: string | null;
  publisher: string | null;
  type: string | null;
  userCount: number;
  groupCount: number;
  deviceCount: number;
  lastSeen: Date | string | null;
  id?: string | null;
  installDate?: Date | string | null;
  installCount?: number;
  status?: string | null;
  category?: string | null;
}

/**
 * Discovered Application Information
 */
export interface Application extends Identifiable, TimestampMetadata {
  name: string;
  displayName: string | null;
  version: string;
  vendor: string | null;
  installPath: string | null;
  installDate: Date | string | null;
  size: number;  // in bytes
  architecture: 'x86' | 'x64' | 'ARM' | 'Unknown';

  // Dependencies
  dependencies: ApplicationDependency[];

  // Licensing
  licenses: LicenseInfo[];
  licenseStatus: 'licensed' | 'unlicensed' | 'trial' | 'expired' | 'unknown';

  // Update Status
  updateStatus: 'current' | 'update-available' | 'end-of-life' | 'unknown';
  latestVersion: string | null;

  // Network
  ports: NetworkPort[];

  // Security
  securityRisks: SecurityRisk[];
  signedBy: string | null;
  isSigned: boolean;

  // Usage
  processName: string | null;
  isRunning: boolean;
  lastRun: Date | string | null;

  // Categorization
  category: ApplicationCategory;
  businessCriticality: 'critical' | 'high' | 'medium' | 'low' | 'unknown';

  // Discovery metadata
  discoveredOn: Date | string;
  discoveredFrom: string;  // hostname or source
}

/**
 * Application Dependency
 */
export interface ApplicationDependency {
  name: string;
  version: string | null;
  type: 'library' | 'framework' | 'runtime' | 'service' | 'database' | 'other';
  isInstalled: boolean;
  requiredVersion: string | null;
  actualVersion: string | null;
  status: 'satisfied' | 'missing' | 'version-mismatch';
}

/**
 * License Information
 */
export interface LicenseInfo {
  licenseKey: string | null;
  licenseType: 'perpetual' | 'subscription' | 'trial' | 'open-source' | 'freeware' | 'unknown';
  expirationDate: Date | string | null;
  assignedTo: string | null;
  maxActivations: number | null;
  currentActivations: number | null;
  complianceStatus: 'compliant' | 'non-compliant' | 'warning' | 'unknown';
}

/**
 * Network Port Information
 */
export interface NetworkPort {
  port: number;
  protocol: 'TCP' | 'UDP';
  state: 'listening' | 'established' | 'closed';
  processId: number | null;
  processName: string | null;
}

/**
 * Security Risk Information
 */
export interface SecurityRisk {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'vulnerability' | 'malware' | 'unsigned' | 'outdated' | 'configuration';
  cveId: string | null;
  description: string;
  remediation: string | null;
}

/**
 * Application Category
 */
export type ApplicationCategory =
  | 'Productivity'
  | 'Development'
  | 'Database'
  | 'Web Server'
  | 'Security'
  | 'Networking'
  | 'Utility'
  | 'Business'
  | 'Communication'
  | 'Media'
  | 'System'
  | 'Unknown';

/**
 * Running Process Information
 */
export interface ProcessInfo extends Identifiable {
  name: string;
  processId: number;
  parentProcessId: number | null;
  executablePath: string | null;
  commandLine: string | null;
  startTime: Date | string;
  cpuUsage: number;  // percentage
  memoryUsage: number;  // in bytes
  threadCount: number;
  handleCount: number;
  userName: string | null;
  sessionId: number;
  workingSet: number;  // in bytes
  status: 'running' | 'suspended' | 'terminated';
}

/**
 * Windows Service Information
 */
export interface ServiceInfo extends Identifiable {
  name: string;
  displayName: string;
  description: string | null;
  status: 'running' | 'stopped' | 'paused' | 'starting' | 'stopping';
  startType: 'automatic' | 'manual' | 'disabled';
  account: string;
  executablePath: string | null;
  processId: number | null;
  dependencies: string[];
  dependents: string[];
  canStop: boolean;
  canPauseAndContinue: boolean;
}

/**
 * Application Discovery Configuration
 */
export interface ApplicationDiscoveryConfig {
  id: string;
  name: string;

  // Target systems
  targetComputers: string[];
  useCurrentComputer: boolean;

  // Discovery scope
  includeSoftware: boolean;
  includeProcesses: boolean;
  includeServices: boolean;
  scanRegistry: boolean;
  scanFilesystem: boolean;
  scanPorts: boolean;

  // Registry scanning
  registryPaths: string[];
  includeUserInstalled: boolean;
  includeMachineInstalled: boolean;

  // Filesystem scanning
  filesystemPaths: string[];
  fileExtensions: string[];
  scanDepth: number;

  // Port scanning
  portRanges: PortRange[];
  portScanTimeout: number;  // milliseconds

  // Options
  detectDependencies: boolean;
  detectLicenses: boolean;
  checkForUpdates: boolean;
  performSecurityScan: boolean;
  resolveVersionInfo: boolean;

  // Filters
  excludePatterns: string[];
  includePatterns: string[];
  minSizeBytes: number | null;
  maxSizeBytes: number | null;

  // Credentials
  useCurrentCredentials: boolean;
  credentialProfileId: string | null;

  // Performance
  maxParallelScans: number;
  timeout: number;  // seconds

  // Schedule
  isScheduled: boolean;
  schedule: string | null;  // Cron expression
}

/**
 * Port Range for scanning
 */
export interface PortRange {
  start: number;
  end: number;
}

/**
 * Application Discovery Result
 */
export interface ApplicationDiscoveryResult {
  id: string;
  configId: string;
  configName: string;
  startTime: Date | string;
  endTime: Date | string | null;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;  // 0-100

  // Discovered objects
  applications: Application[];
  processes: ProcessInfo[];
  services: ServiceInfo[];
  ports: NetworkPort[];

  // Statistics
  stats: {
    totalApplications: number;
    totalProcesses: number;
    totalServices: number;
    totalPorts: number;
    licensedApplications: number;
    unlicensedApplications: number;
    applicationsNeedingUpdate: number;
    securityRisks: number;
    runningServices: number;
    stoppedServices: number;
  };

  // Errors and warnings
  errors: ApplicationDiscoveryError[];
  warnings: ApplicationDiscoveryWarning[];

  // Performance
  duration: number;  // milliseconds
  objectsPerSecond: number;
}

/**
 * Discovery Error
 */
export interface ApplicationDiscoveryError {
  timestamp: Date | string;
  severity: 'critical' | 'error';
  code: string;
  message: string;
  details: string | null;
  computer: string | null;
}

/**
 * Discovery Warning
 */
export interface ApplicationDiscoveryWarning {
  timestamp: Date | string;
  code: string;
  message: string;
  computer: string | null;
}

/**
 * Discovery Progress Event
 */
export interface ApplicationDiscoveryProgress {
  resultId: string;
  phase: 'connecting' | 'scanning-software' | 'scanning-processes' | 'scanning-services' | 'scanning-ports' | 'analyzing' | 'finalizing';
  currentOperation: string;
  progress: number;  // 0-100
  objectsProcessed: number;
  estimatedTimeRemaining: number | null;  // seconds
  currentComputer: string | null;
}

/**
 * Application Discovery Filter
 */
export interface ApplicationDiscoveryFilter {
  objectType: 'application' | 'process' | 'service' | 'port' | 'all';
  searchText: string;
  category: ApplicationCategory | 'all';
  vendor: string | null;
  updateStatus: 'current' | 'update-available' | 'end-of-life' | 'all';
  licenseStatus: 'licensed' | 'unlicensed' | 'trial' | 'expired' | 'all';
  securityStatus: 'secure' | 'at-risk' | 'all';
}

/**
 * Application Discovery Export Options
 */
export interface ApplicationDiscoveryExportOptions {
  format: 'csv' | 'excel' | 'json' | 'xml' | 'html';
  includeApplications: boolean;
  includeProcesses: boolean;
  includeServices: boolean;
  includePorts: boolean;
  includeDependencies: boolean;
  includeLicenses: boolean;
  includeSecurityRisks: boolean;
  includeSummary: boolean;
  fileName: string;
  outputPath: string;
}

/**
 * Application Discovery Template
 */
export interface ApplicationDiscoveryTemplate {
  id: string;
  name: string;
  description: string | null;
  category: 'standard' | 'security' | 'compliance' | 'licensing' | 'inventory' | 'custom';
  config: ApplicationDiscoveryConfig;
  createdBy: string;
  createdDate: Date | string;
  modifiedDate: Date | string | null;
  isSystem: boolean;
}
