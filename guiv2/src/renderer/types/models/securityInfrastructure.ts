/**
 * Security Infrastructure Discovery Type Definitions
 * Comprehensive types for security infrastructure discovery operations
 */

import { Identifiable, TimestampMetadata } from '../common';

/**
 * Legacy interface (kept for backward compatibility)
 */
export interface SecurityInfrastructureItem {
  component: string | null;
  type: string | null;
  status: string | null;
  version: string | null;
  location: string | null;
  riskLevel: string | null;
  lastSeen: Date | string | null;
  description: string | null;
  vendor: string | null;
  productState: string | null;
  configuration: string | null;
  isSelected?: boolean;
  id?: string | null;
  statusIcon: string;
  riskIcon: string;
  typeIcon: string;
}

/**
 * Security Device/Appliance
 */
export interface SecurityDevice extends Identifiable, TimestampMetadata {
  name: string;
  deviceType: 'firewall' | 'ids' | 'ips' | 'waf' | 'proxy' | 'endpoint' | 'dlp' | 'siem' | 'vpn' | 'other';
  vendor: string;
  model: string;
  version: string;
  serialNumber: string | null;

  // Network information
  ipAddress: string | null;
  hostname: string | null;
  location: string | null;
  networkZone: string | null;

  // Status
  operationalStatus: 'online' | 'offline' | 'degraded' | 'maintenance' | 'unknown';
  healthStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  lastSeen: Date | string;
  uptime: number | null; // seconds

  // Configuration
  managementUrl: string | null;
  configurationVersion: string | null;
  lastConfigChange: Date | string | null;
  configCompliance: 'compliant' | 'non-compliant' | 'not-assessed';

  // Security
  securityPatchLevel: string | null;
  vulnerabilitiesCount: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  riskScore: number; // 0-100

  // Licensing
  licenseStatus: 'valid' | 'expired' | 'expiring-soon' | 'invalid' | 'unknown';
  licenseExpiration: Date | string | null;

  // Discovery metadata
  discoveredOn: Date | string;
  lastSyncDate: Date | string | null;
}

/**
 * Security Policy
 */
export interface SecurityPolicy extends Identifiable, TimestampMetadata {
  name: string;
  description: string;
  policyType: 'firewall' | 'access-control' | 'encryption' | 'authentication' | 'compliance' | 'data-protection' | 'other';
  category: string;

  // Scope
  appliesTo: string[]; // devices, users, groups
  scope: 'global' | 'regional' | 'department' | 'custom';

  // Status
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  enforcementMode: 'enforcing' | 'permissive' | 'audit' | 'disabled';
  complianceStatus: 'compliant' | 'non-compliant' | 'partial' | 'not-assessed';

  // Policy details
  priority: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  ruleCount: number;
  activeRules: number;
  disabledRules: number;

  // Compliance
  complianceFrameworks: string[]; // e.g., ['PCI-DSS', 'HIPAA', 'SOC2']
  regulatoryRequirements: string[];

  // Audit
  lastReviewed: Date | string | null;
  reviewedBy: string | null;
  nextReviewDate: Date | string | null;
  lastModified: Date | string;
  modifiedBy: string;

  // Violations
  violationCount: number;
  lastViolation: Date | string | null;

  // Discovery metadata
  deviceId: string | null;
  deviceName: string | null;
  discoveredOn: Date | string;
}

/**
 * Security Incident
 */
export interface SecurityIncident extends Identifiable, TimestampMetadata {
  title: string;
  description: string;
  incidentType: 'intrusion' | 'malware' | 'data-breach' | 'policy-violation' | 'vulnerability' | 'dos' | 'phishing' | 'other';

  // Severity
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  priority: 'p1' | 'p2' | 'p3' | 'p4';
  riskScore: number; // 0-100

  // Status
  status: 'new' | 'investigating' | 'contained' | 'resolved' | 'closed' | 'false-positive';
  assignedTo: string | null;
  assignedTeam: string | null;

  // Timing
  detectedAt: Date | string;
  reportedAt: Date | string;
  acknowledgedAt: Date | string | null;
  resolvedAt: Date | string | null;
  timeToDetect: number | null; // seconds
  timeToResolve: number | null; // seconds

  // Source
  sourceDevice: string | null;
  sourceIp: string | null;
  sourceUser: string | null;
  sourceLocation: string | null;

  // Target
  targetDevice: string | null;
  targetIp: string | null;
  targetUser: string | null;
  targetAsset: string | null;

  // Impact
  impactedSystems: string[];
  impactedUsers: string[];
  dataExfiltrated: boolean;
  estimatedLoss: number | null; // monetary value

  // Response
  responseActions: ResponseAction[];
  containmentMeasures: string[];
  remediationSteps: string[];

  // Compliance
  requiresNotification: boolean;
  notificationSent: boolean;
  regulatoryReporting: boolean;

  // Evidence
  evidenceCollected: boolean;
  evidenceLocation: string | null;
  forensicsRequired: boolean;

  // Discovery metadata
  detectionSource: string; // e.g., 'SIEM', 'IDS', 'User Report'
  correlationId: string | null;
  discoveredOn: Date | string;
}

/**
 * Response Action
 */
export interface ResponseAction {
  id: string;
  action: string;
  performedBy: string;
  performedAt: Date | string;
  result: 'success' | 'failure' | 'partial';
  notes: string | null;
}

/**
 * Vulnerability Assessment
 */
export interface VulnerabilityAssessment extends Identifiable, TimestampMetadata {
  cveId: string | null;
  title: string;
  description: string;

  // Severity
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore: number | null; // 0-10
  cvssVector: string | null;
  exploitability: 'functional' | 'proof-of-concept' | 'unproven' | 'not-defined';

  // Affected assets
  affectedDevices: string[];
  affectedSoftware: string[];
  affectedCount: number;

  // Status
  status: 'open' | 'in-progress' | 'remediated' | 'accepted' | 'false-positive';
  remediationStatus: 'not-started' | 'in-progress' | 'completed' | 'failed';
  acceptedRisk: boolean;
  acceptedBy: string | null;
  acceptedDate: Date | string | null;

  // Remediation
  remediationPlan: string | null;
  patchAvailable: boolean;
  patchVersion: string | null;
  workaround: string | null;
  estimatedEffort: string | null; // hours
  targetRemediationDate: Date | string | null;

  // Timeline
  discoveredAt: Date | string;
  publishedAt: Date | string | null;
  remediatedAt: Date | string | null;
  verifiedAt: Date | string | null;

  // Threat intelligence
  activeExploits: boolean;
  threatActors: string[];
  references: string[];

  // Discovery metadata
  scanId: string | null;
  scannerId: string | null;
  discoveredOn: Date | string;
}

/**
 * Security Discovery Configuration
 */
export interface SecurityDiscoveryConfig extends Identifiable, TimestampMetadata {
  name: string;
  description: string;

  // Scope
  discoverDevices: boolean;
  discoverPolicies: boolean;
  discoverIncidents: boolean;
  discoverVulnerabilities: boolean;

  // Device discovery
  deviceTypes: ('firewall' | 'ids' | 'ips' | 'waf' | 'proxy' | 'endpoint' | 'dlp' | 'siem' | 'vpn' | 'other')[];
  networkRanges: string[]; // CIDR notation
  includeOfflineDevices: boolean;

  // Policy discovery
  includeDraftPolicies: boolean;
  includeDeprecatedPolicies: boolean;
  complianceFrameworks: string[];

  // Incident discovery
  incidentDateRange: { start: Date | string; end: Date | string } | null;
  includeClosed: boolean;
  minSeverity: 'critical' | 'high' | 'medium' | 'low' | 'info';

  // Vulnerability discovery
  performVulnerabilityScan: boolean;
  scanDepth: 'quick' | 'standard' | 'comprehensive';
  minCvssScore: number | null; // 0-10
  includeAcceptedRisks: boolean;

  // Performance
  maxConcurrentRequests: number;
  timeout: number; // seconds
  throttleDelayMs: number;

  // Credentials
  credentialId: string | null;

  // Schedule
  isScheduled: boolean;
  schedule: string | null; // cron expression
}

/**
 * Security Discovery Result
 */
export interface SecurityDiscoveryResult extends Identifiable, TimestampMetadata {
  configId: string;
  configName: string;

  // Timing
  startTime: Date | string;
  endTime: Date | string | null;
  duration: number; // milliseconds

  // Status
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'partial';
  completionPercentage: number;

  // Results
  devices: SecurityDevice[];
  policies: SecurityPolicy[];
  incidents: SecurityIncident[];
  vulnerabilities: VulnerabilityAssessment[];

  // Statistics
  statistics: SecurityStatistics;

  // Errors and warnings
  errors: DiscoveryError[];
  warnings: DiscoveryWarning[];

  // Metadata
  discoveredBy: string;
}

/**
 * Security Statistics
 */
export interface SecurityStatistics {
  // Device statistics
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  unhealthyDevices: number;
  devicesByType: Record<string, number>;

  // Policy statistics
  totalPolicies: number;
  activePolicies: number;
  inactivePolicies: number;
  nonCompliantPolicies: number;
  policiesNeedingReview: number;

  // Incident statistics
  totalIncidents: number;
  openIncidents: number;
  criticalIncidents: number;
  highIncidents: number;
  avgTimeToResolve: number | null; // seconds
  incidentsByType: Record<string, number>;

  // Vulnerability statistics
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  patchableVulnerabilities: number;
  activeExploits: number;
  vulnerabilitiesByType: Record<string, number>;

  // Risk metrics
  overallRiskScore: number; // 0-100
  complianceScore: number; // 0-100
  securityPosture: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

  // Compliance
  complianceGaps: number;
  complianceFrameworks: string[];
}

/**
 * Discovery Error
 */
export interface DiscoveryError {
  timestamp: Date | string;
  severity: 'error' | 'critical';
  code: string;
  message: string;
  details: string | null;
  context: Record<string, any>;
  recoverable: boolean;
}

/**
 * Discovery Warning
 */
export interface DiscoveryWarning {
  timestamp: Date | string;
  severity: 'warning' | 'info';
  code: string;
  message: string;
  details: string | null;
  context: Record<string, any>;
  actionable: boolean;
  recommendation: string | null;
}

/**
 * Security Discovery Progress
 */
export interface SecurityDiscoveryProgress {
  type: 'security-discovery';
  timestamp: Date | string;

  // Overall progress
  currentPhase: 'initializing' | 'discovering-devices' | 'discovering-policies' | 'discovering-incidents' | 'scanning-vulnerabilities' | 'analyzing' | 'finalizing';
  phaseProgress: number; // 0-100
  overallProgress: number; // 0-100

  // Current operation
  currentOperation: string;
  currentItem: string | null;

  // Counts
  devicesProcessed: number;
  policiesProcessed: number;
  incidentsProcessed: number;
  vulnerabilitiesProcessed: number;
  errorsEncountered: number;
  warningsEncountered: number;

  // Performance
  itemsPerSecond: number;
  estimatedTimeRemaining: number | null; // seconds

  // Status
  canCancel: boolean;
  isPaused: boolean;
}

/**
 * Security Discovery Filter
 */
export interface SecurityDiscoveryFilter {
  // Device filters
  deviceTypes: ('firewall' | 'ids' | 'ips' | 'waf' | 'proxy' | 'endpoint' | 'dlp' | 'siem' | 'vpn' | 'other')[] | null;
  deviceStatus: ('online' | 'offline' | 'degraded' | 'maintenance' | 'unknown')[] | null;
  healthStatus: ('healthy' | 'warning' | 'critical' | 'unknown')[] | null;

  // Policy filters
  policyTypes: string[] | null;
  policyStatus: ('active' | 'inactive' | 'draft' | 'deprecated')[] | null;
  complianceStatus: ('compliant' | 'non-compliant' | 'partial' | 'not-assessed')[] | null;

  // Incident filters
  incidentTypes: string[] | null;
  incidentSeverity: ('critical' | 'high' | 'medium' | 'low' | 'info')[] | null;
  incidentStatus: ('new' | 'investigating' | 'contained' | 'resolved' | 'closed' | 'false-positive')[] | null;

  // Vulnerability filters
  vulnerabilitySeverity: ('critical' | 'high' | 'medium' | 'low')[] | null;
  vulnerabilityStatus: ('open' | 'in-progress' | 'remediated' | 'accepted' | 'false-positive')[] | null;
  cvssScoreRange: { min: number; max: number } | null;
  hasActiveExploits: boolean | null;

  // Search
  searchQuery: string | null;
}

/**
 * Security Discovery Template
 */
export interface SecurityDiscoveryTemplate extends Identifiable, TimestampMetadata {
  name: string;
  description: string;
  category: 'quick' | 'comprehensive' | 'compliance' | 'threat-hunting' | 'custom';
  config: SecurityDiscoveryConfig;
  isDefault: boolean;
  isReadOnly: boolean;
  tags: string[];
  author: string | null;
  version: string;
}

/**
 * Default configuration factory
 */
export const createDefaultSecurityConfig = (): SecurityDiscoveryConfig => ({
  id: crypto.randomUUID(),
  name: 'New Security Discovery',
  description: '',
  discoverDevices: true,
  discoverPolicies: true,
  discoverIncidents: true,
  discoverVulnerabilities: true,
  deviceTypes: ['firewall', 'ids', 'ips', 'waf', 'proxy', 'endpoint', 'dlp', 'siem', 'vpn'],
  networkRanges: [],
  includeOfflineDevices: false,
  includeDraftPolicies: false,
  includeDeprecatedPolicies: false,
  complianceFrameworks: [],
  incidentDateRange: null,
  includeClosed: false,
  minSeverity: 'medium',
  performVulnerabilityScan: true,
  scanDepth: 'standard',
  minCvssScore: 7.0,
  includeAcceptedRisks: false,
  maxConcurrentRequests: 5,
  timeout: 3600,
  throttleDelayMs: 100,
  credentialId: null,
  isScheduled: false,
  schedule: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * Default filter factory
 */
export const createDefaultSecurityFilter = (): SecurityDiscoveryFilter => ({
  deviceTypes: null,
  deviceStatus: null,
  healthStatus: null,
  policyTypes: null,
  policyStatus: null,
  complianceStatus: null,
  incidentTypes: null,
  incidentSeverity: null,
  incidentStatus: null,
  vulnerabilitySeverity: null,
  vulnerabilityStatus: null,
  cvssScoreRange: null,
  hasActiveExploits: null,
  searchQuery: null,
});


