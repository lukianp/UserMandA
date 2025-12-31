/**
 * Office 365 / Microsoft 365 Discovery Type Definitions
 * Comprehensive types for Office 365 discovery operations
 */

import { Identifiable, TimestampMetadata } from '../common';

/**
 * Office 365 Tenant Information
 */
export interface Office365Tenant extends Identifiable, TimestampMetadata {
  tenantId: string;
  displayName: string;
  domain: string;
  primaryDomain: string;
  verifiedDomains: VerifiedDomain[];
  technicalContact: Contact | null;

  // License summary
  totalLicenses: number;
  assignedLicenses: number;
  availableLicenses: number;
  licenseSummary: LicenseSummary[];

  // Tenant metadata
  countryLetterCode: string | null;
  preferredLanguage: string | null;
  tenantType: 'public' | 'government' | 'china' | 'education';
  complianceStatus: ComplianceStatus;

  // Discovery metadata
  discoveredOn: Date | string;
  lastSyncDate: Date | string | null;
}

/**
 * Verified Domain
 */
export interface VerifiedDomain {
  name: string;
  type: 'managed' | 'federated';
  isDefault: boolean;
  isInitial: boolean;
  capabilities: string[];
  authenticationType: 'managed' | 'federated';
}

/**
 * Contact Information
 */
export interface Contact {
  email: string | null;
  displayName: string | null;
  phone: string | null;
}

/**
 * License Summary
 */
export interface LicenseSummary {
  skuId: string;
  skuPartNumber: string;
  productName: string;
  totalUnits: number;
  assignedUnits: number;
  availableUnits: number;
  consumedUnits: number;
  suspendedUnits: number;
  warningUnits: number;
  capabilityStatus: 'enabled' | 'warning' | 'suspended' | 'deleted';
}

/**
 * Compliance Status
 */
export interface ComplianceStatus {
  isCompliant: boolean;
  complianceScore: number | null;
  lastAssessment: Date | string | null;
  issues: ComplianceIssue[];
}

/**
 * Compliance Issue
 */
export interface ComplianceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  remediation: string | null;
}

/**
 * Office 365 User
 */
export interface Office365User extends Identifiable, TimestampMetadata {
  userPrincipalName: string;
  displayName: string;
  givenName: string | null;
  surname: string | null;
  mail: string | null;

  // Account status
  accountEnabled: boolean;
  userType: 'member' | 'guest';

  // MFA status
  mfaStatus: MFAStatus;
  strongAuthenticationMethods: StrongAuthMethod[];

  // Licenses
  licenses: Office365License[];
  assignedLicenses: string[];  // SKU IDs

  // Roles
  roles: Office365Role[];
  isAdmin: boolean;
  adminRoles: string[];

  // Usage
  lastSignIn: Date | string | null;
  lastPasswordChange: Date | string | null;
  signInActivity: SignInActivity | null;

  // Location
  usageLocation: string | null;
  officeLocation: string | null;
  country: string | null;
  department: string | null;
  jobTitle: string | null;

  // Manager
  manager: string | null;

  // Discovery metadata
  discoveredOn: Date | string;
}

/**
 * MFA Status
 */
export interface MFAStatus {
  state: 'enabled' | 'enforced' | 'disabled';
  isRegistered: boolean;
  methods: string[];
  defaultMethod: string | null;
}

/**
 * Strong Authentication Method
 */
export interface StrongAuthMethod {
  methodType: 'phone' | 'app' | 'oath' | 'email' | 'fido' | 'windows-hello';
  isDefault: boolean;
  detail: string | null;
}

/**
 * Office 365 License
 */
export interface Office365License extends Identifiable {
  skuId: string;
  skuPartNumber: string;
  productName: string;
  servicePlans: ServicePlan[];
  assignedDate: Date | string;
  disabledPlans: string[];
  status: 'active' | 'suspended' | 'warning' | 'deleted';
}

/**
 * Service Plan (part of license)
 */
export interface ServicePlan {
  servicePlanId: string;
  servicePlanName: string;
  provisioningStatus: 'success' | 'pending' | 'disabled' | 'error';
  appliesTo: string;
}

/**
 * Office 365 Role
 */
export interface Office365Role extends Identifiable {
  roleTemplateId: string;
  displayName: string;
  description: string | null;
  isBuiltIn: boolean;
  isEnabled: boolean;
  assignedOn: Date | string;
}

/**
 * Sign-in Activity
 */
export interface SignInActivity {
  lastSignInDateTime: Date | string | null;
  lastNonInteractiveSignInDateTime: Date | string | null;
  lastSuccessfulSignIn: Date | string | null;
  lastFailedSignIn: Date | string | null;
  failedSignInCount: number;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  riskState: 'none' | 'confirmedSafe' | 'remediated' | 'dismissed' | 'atRisk' | 'confirmedCompromised';
}

/**
 * Office 365 Service
 */
export interface Office365Service extends Identifiable {
  serviceName: string;
  displayName: string;
  featureName: string | null;
  status: ServiceStatus;
  incidentIds: string[];
  healthStatus: 'serviceOperational' | 'serviceDegradation' | 'serviceInterruption' | 'restoringService' | 'extendedRecovery' | 'investigating' | 'serviceRestored' | 'postIncidentReviewPublished';
  lastUpdated: Date | string;
}

/**
 * Service Status
 */
export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unavailable';
  activeIncidents: number;
  activeAdvisories: number;
  lastIncidentDate: Date | string | null;
}

/**
 * Office 365 Security Configuration
 */
export interface Office365SecurityConfig {
  // Conditional Access
  conditionalAccessPolicies: ConditionalAccessPolicy[];

  // MFA
  mfaEnforced: boolean;
  mfaRegisteredUsers: number;
  mfaEnabledUsers: number;
  mfaCoverage: number;  // percentage

  // Security defaults
  securityDefaultsEnabled: boolean;

  // Password policies
  passwordPolicies: PasswordPolicy[];

  // Data Loss Prevention
  dlpPolicies: DLPPolicy[];

  // Threat protection
  threatProtectionEnabled: boolean;
  advancedThreatProtectionEnabled: boolean;

  // Compliance
  retentionPolicies: RetentionPolicy[];
  sensitivityLabels: SensitivityLabel[];

  // Audit
  auditLogEnabled: boolean;
  unifiedAuditLogEnabled: boolean;
}

/**
 * Conditional Access Policy
 */
export interface ConditionalAccessPolicy extends Identifiable {
  displayName: string;
  state: 'enabled' | 'disabled' | 'enabledForReportingButNotEnforced';
  conditions: PolicyConditions;
  grantControls: GrantControls | null;
  sessionControls: SessionControls | null;
  createdDateTime: Date | string;
  modifiedDateTime: Date | string | null;
}

/**
 * Policy Conditions
 */
export interface PolicyConditions {
  users: UserCondition;
  applications: ApplicationCondition;
  locations: LocationCondition | null;
  platforms: PlatformCondition | null;
  signInRiskLevels: string[];
  userRiskLevels: string[];
  clientAppTypes: string[];
}

/**
 * User Condition
 */
export interface UserCondition {
  includeUsers: string[];
  excludeUsers: string[];
  includeGroups: string[];
  excludeGroups: string[];
  includeRoles: string[];
  excludeRoles: string[];
}

/**
 * Application Condition
 */
export interface ApplicationCondition {
  includeApplications: string[];
  excludeApplications: string[];
  includeUserActions: string[];
}

/**
 * Location Condition
 */
export interface LocationCondition {
  includeLocations: string[];
  excludeLocations: string[];
}

/**
 * Platform Condition
 */
export interface PlatformCondition {
  includePlatforms: string[];
  excludePlatforms: string[];
}

/**
 * Grant Controls
 */
export interface GrantControls {
  operator: 'AND' | 'OR';
  builtInControls: string[];
  customAuthenticationFactors: string[];
  termsOfUse: string[];
}

/**
 * Session Controls
 */
export interface SessionControls {
  applicationEnforcedRestrictions: boolean | null;
  cloudAppSecurity: any | null;
  persistentBrowser: any | null;
  signInFrequency: any | null;
}

/**
 * Password Policy
 */
export interface PasswordPolicy {
  id: string;
  displayName: string;
  minimumLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  passwordHistoryCount: number;
  maximumPasswordAge: number | null;
  minimumPasswordAge: number | null;
  lockoutThreshold: number | null;
  lockoutDuration: number | null;
}

/**
 * Data Loss Prevention Policy
 */
export interface DLPPolicy extends Identifiable {
  displayName: string;
  description: string | null;
  state: 'enabled' | 'disabled' | 'testWithNotifications' | 'testWithoutNotifications';
  mode: 'enforce' | 'audit' | 'auditAndNotify' | 'disable';
  locations: string[];
  rules: DLPRule[];
  createdDateTime: Date | string;
  modifiedDateTime: Date | string | null;
}

/**
 * DLP Rule
 */
export interface DLPRule {
  id: string;
  name: string;
  conditions: any[];
  actions: any[];
  priority: number;
  disabled: boolean;
}

/**
 * Retention Policy
 */
export interface RetentionPolicy extends Identifiable {
  displayName: string;
  description: string | null;
  retentionDuration: number;  // days
  retentionAction: 'delete' | 'keepAndDelete' | 'keep';
  locations: string[];
  isEnabled: boolean;
  createdDateTime: Date | string;
  modifiedDateTime: Date | string | null;
}

/**
 * Sensitivity Label
 */
export interface SensitivityLabel extends Identifiable {
  displayName: string;
  description: string | null;
  isDefault: boolean;
  priority: number;
  color: string | null;
  tooltip: string | null;
  sublabels: SensitivityLabel[];
}

/**
 * Office 365 Discovery Configuration
 */
export interface Office365DiscoveryConfig {
  id: string;
  name: string;

  // Tenant
  tenantId: string | null;
  tenantDomain: string | null;

  // Credentials
  useCurrentCredentials: boolean;
  credentialProfileId: string | null;

  // Discovery scope
  includeTenantInfo: boolean;
  includeUsers: boolean;
  includeGuests: boolean;
  includeLicenses: boolean;
  includeServices: boolean;
  includeSecurity: boolean;
  includeCompliance: boolean;
  includeConditionalAccess: boolean;
  includeMFAStatus: boolean;
  includeAdminRoles: boolean;
  includeServiceHealth: boolean;
  includeDomains: boolean;

  // Filters
  userFilter: string | null;
  licenseFilter: string | null;
  departmentFilter: string | null;

  // Options
  includeDisabledUsers: boolean;
  includeDeletedUsers: boolean;
  maxUsers: number | null;

  // Performance
  timeout: number;  // seconds
  batchSize: number;

  // Schedule
  isScheduled: boolean;
  schedule: string | null;  // Cron expression
}

/**
 * Office 365 Discovery Result
 */
export interface Office365DiscoveryResult {
  id: string;
  configId: string;
  configName: string;
  startTime: Date | string;
  endTime: Date | string | null;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;  // 0-100

  // Discovered objects
  tenant: Office365Tenant | null;
  users: Office365User[];
  guestUsers: Office365User[];
  licenses: Office365License[];
  services: Office365Service[];
  securityConfig: Office365SecurityConfig | null;

  // Statistics
  stats: {
    totalUsers: number;
    enabledUsers: number;
    disabledUsers: number;
    guestUsers: number;
    adminUsers: number;
    mfaEnabledUsers: number;
    mfaRegisteredUsers: number;
    totalLicenses: number;
    assignedLicenses: number;
    availableLicenses: number;
    totalServices: number;
    healthyServices: number;
    degradedServices: number;
    unavailableServices: number;
    conditionalAccessPolicies: number;
    dlpPolicies: number;
    retentionPolicies: number;
  };

  // Errors and warnings
  errors: Office365DiscoveryError[];
  warnings: Office365DiscoveryWarning[];

  // Performance
  duration: number;  // milliseconds
  objectsPerSecond: number;
}

/**
 * Discovery Error
 */
export interface Office365DiscoveryError {
  timestamp: Date | string;
  severity: 'critical' | 'error';
  code: string;
  message: string;
  details: string | null;
  objectType: string | null;
  objectId: string | null;
}

/**
 * Discovery Warning
 */
export interface Office365DiscoveryWarning {
  timestamp: Date | string;
  code: string;
  message: string;
  objectType: string | null;
  objectId: string | null;
}

/**
 * Discovery Progress Event
 */
export interface Office365DiscoveryProgress {
  resultId: string;
  phase: 'connecting' | 'tenant-info' | 'users' | 'licenses' | 'services' | 'security' | 'compliance' | 'analyzing' | 'finalizing';
  currentOperation: string;
  progress: number;  // 0-100
  objectsProcessed: number;
  estimatedTimeRemaining: number | null;  // seconds
}

/**
 * Office 365 Discovery Filter
 */
export interface Office365DiscoveryFilter {
  objectType: 'user' | 'license' | 'service' | 'policy' | 'all';
  searchText: string;
  userType: 'member' | 'guest' | 'all';
  accountStatus: 'enabled' | 'disabled' | 'all';
  mfaStatus: 'enabled' | 'disabled' | 'all';
  licenseStatus: 'licensed' | 'unlicensed' | 'all';
  adminStatus: 'admin' | 'non-admin' | 'all';
}

/**
 * Office 365 Discovery Template
 */
export interface Office365DiscoveryTemplate {
  id: string;
  name: string;
  description: string | null;
  category: 'standard' | 'security' | 'compliance' | 'licensing' | 'audit' | 'custom';
  config: Office365DiscoveryConfig;
  createdBy: string;
  createdDate: Date | string;
  modifiedDate: Date | string | null;
  isSystem: boolean;
}

/**
 * Service Health Incident
 */
export interface ServiceHealthIncident {
  id: string;
  title: string;
  service: string;
  feature: string | null;
  classification: 'advisory' | 'incident';
  status: 'serviceOperational' | 'investigating' | 'restoringService' | 'verifyingService' | 'serviceRestored' | 'postIncidentReviewPublished';
  impactDescription: string;
  startDateTime: Date | string;
  endDateTime: Date | string | null;
  lastModifiedDateTime: Date | string;
  posts: IncidentPost[];
}

/**
 * Incident Post (update)
 */
export interface IncidentPost {
  createdDateTime: Date | string;
  postType: 'regular' | 'quick' | 'strategic' | 'unknown';
  description: string;
}


