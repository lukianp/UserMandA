/**
 * Security policy models with risk analysis and threat detection
 */

// Group Policy Models
export interface GroupPolicyObject {
  name: string | null;
  displayName: string | null;
  path: string | null;
  domain: string | null;
  linkedOUs: string | null;
  enabled: boolean;
  computerSettingsEnabled: boolean;
  userSettingsEnabled: boolean;
  hasWMIFilter: boolean;
  wmiFilter: string | null;
  securityFiltering: string | null;
  policySettings: string | null;
  createdTime: Date | string | null;
  modifiedTime: Date | string | null;
  description: string | null;
  owner: string | null;
  lastModifiedBy: string | null;
  version: number;
  status: string | null;
  riskLevel: string;
  riskIcon: string;
  statusIcon: string;
}

// Security Group Models
export interface SecurityGroup {
  displayName: string | null;
  groupType: string | null;
  domain: string | null;
  mailEnabled: boolean;
  securityEnabled: boolean;
  mail: string | null;
  description: string | null;
  managedBy: string | null;
  createdDateTime: Date | string | null;
  lastModified: Date | string | null;
  memberCount: number;
  ownerCount: number;
  visibility: string | null;
  isPrivileged: boolean;
  nestedGroups: string | null;
  permissions: string | null;
  riskFactors: string | null;
  riskLevel: string;
  riskScore: string;
  riskIcon: string;
  groupTypeIcon: string;
  statusColor: string;
}

// Infrastructure Security Models
export interface AntivirusProduct {
  productName: string | null;
  version: string | null;
  vendor: string | null;
  computerName: string | null;
  domain: string | null;
  isEnabled: boolean;
  isUpToDate: boolean;
  lastUpdate: Date | string | null;
  lastScan: Date | string | null;
  scanType: string | null;
  threatsDetected: number;
  status: string | null;
  configurationStatus: string | null;
  statusIcon: string;
  healthColor: string;
  lastScanText: string;
}

export interface FirewallProfile {
  computerName: string | null;
  domain: string | null;
  profileName: string | null;
  isEnabled: boolean;
  inboundAction: string | null;
  outboundAction: string | null;
  allowInboundRules: boolean;
  allowLocalFirewallRules: boolean;
  allowLocalConSecRules: boolean;
  notifyOnListen: boolean;
  enableStealthMode: boolean;
  lastModified: Date | string | null;
  status: string | null;
  profileIcon: string;
  statusColor: string;
}

export interface SecurityAppliance {
  name: string | null;
  type: string | null;
  vendor: string | null;
  model: string | null;
  version: string | null;
  ipAddress: string | null;
  location: string | null;
  status: string | null;
  lastSeen: Date | string | null;
  configurationStatus: string | null;
  isManaged: boolean;
  managementServer: string | null;
  policies: string | null;
  alertCount: number;
  health: string | null;
  typeIcon: string;
  healthColor: string;
}

// Threat Detection Models
export interface SecurityThreatIndicator {
  indicatorType: string | null;
  value: string | null;
  threatType: string | null;
  severity: string | null;
  source: string | null;
  campaign: string | null;
  mitreTactic: string | null;
  mitreTechnique: string | null;
  description: string | null;
  firstSeen: Date | string | null;
  lastSeen: Date | string | null;
  confidenceScore: number;
  iocs: string | null;
  recommendedActions: string | null;
  status: string | null;
  isActive: boolean;
  severityIcon: string;
  typeIcon: string;
  severityColor: string;
  confidenceText: string;
}

// Compliance Models
export interface ComplianceControl {
  controlId: string | null;
  controlName: string | null;
  framework: string | null;
  category: string | null;
  description: string | null;
  status: string | null;
  implementationStatus: string | null;
  owner: string | null;
  evidence: string | null;
  lastAssessed: Date | string | null;
  nextReview: Date | string | null;
  findings: string | null;
  remediation: string | null;
  riskRating: number;
  isCompliant: boolean;
  statusIcon: string;
  statusColor: string;
  riskLevel: string;
  frameworkIcon: string;
}

// Critical Issues Models
export interface CriticalIssue {
  issueId: string | null;
  title: string | null;
  description: string | null;
  severity: string | null;
  category: string | null;
  affectedSystem: string | null;
  owner: string | null;
  detectedDate: Date | string | null;
  dueDate: Date | string | null;
  status: string | null;
  recommendation: string | null;
  businessImpact: string | null;
  priority: number;
  isEscalated: boolean;
  severityIcon: string;
  categoryIcon: string;
  isOverdue: boolean;
  timeToResolution: string;
}

// Security Dashboard Models
export interface SecurityKPI {
  name: string;
  value: string;
  trend: string;
  status: string;
  icon: string;
  color: string;
  description: string;
}

export interface EnvironmentInfo {
  type: string; // Azure, OnPrem, Hybrid
  hasAzureAD: boolean;
  hasOnPremAD: boolean;
  hasExchange: boolean;
  hasOffice365: boolean;
  discoveredModules: string[];
  icon: string;
}

// Enums
export enum SecurityFramework {
  ISO27001 = 'ISO27001',
  NIST = 'NIST',
  SOC2 = 'SOC2',
  GDPR = 'GDPR',
  HIPAA = 'HIPAA',
  PCI_DSS = 'PCI_DSS',
  CIS_Controls = 'CIS_Controls',
}

export enum ThreatSeverity {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Info = 'Info',
}

export enum ComplianceStatus {
  Compliant = 'Compliant',
  NonCompliant = 'NonCompliant',
  PartiallyCompliant = 'PartiallyCompliant',
  NotAssessed = 'NotAssessed',
  InProgress = 'InProgress',
}


