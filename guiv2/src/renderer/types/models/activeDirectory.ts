/**
 * Active Directory Discovery Type Definitions
 * Comprehensive types for AD discovery operations
 */

import { Identifiable, TimestampMetadata } from '../common';

/**
 * Active Directory Forest Information
 */
export interface ADForest {
  name: string;
  forestMode: string;
  globalCatalogs: string[];
  sites: ADSite[];
  domains: ADDomain[];
  trusts: ADTrust[];
  schema: ADSchema;
}

/**
 * Active Directory Domain Information
 */
export interface ADDomain extends Identifiable {
  name: string;
  distinguishedName: string;
  netBiosName: string;
  domainMode: string;
  domainControllers: string[];
  fsmoRoles: ADFSMORoles;
  parentDomain: string | null;
  childDomains: string[];
  forestName: string;
  created: Date | string;
}

/**
 * FSMO (Flexible Single Master Operations) Roles
 */
export interface ADFSMORoles {
  pdc: string;              // Primary Domain Controller
  rid: string;              // RID Master
  infrastructure: string;   // Infrastructure Master
  schemaMaster: string;     // Schema Master
  domainNaming: string;     // Domain Naming Master
}

/**
 * Active Directory Site Information
 */
export interface ADSite {
  name: string;
  description: string | null;
  subnets: string[];
  domainControllers: string[];
  siteLinks: string[];
}

/**
 * Active Directory Trust Relationship
 */
export interface ADTrust {
  source: string;
  target: string;
  trustType: 'External' | 'Forest' | 'Realm' | 'Shortcut' | 'Unknown';
  trustDirection: 'Inbound' | 'Outbound' | 'Bidirectional';
  trustAttributes: string[];
  created: Date | string;
  whenChanged: Date | string | null;
}

/**
 * Active Directory Schema Information
 */
export interface ADSchema {
  version: number;
  forestMode: string;
  classes: number;
  attributes: number;
  lastModified: Date | string;
}

/**
 * Active Directory User (extends base UserData)
 */
export interface ADUser extends Identifiable, TimestampMetadata {
  displayName: string;
  userPrincipalName: string;
  samAccountName: string;
  distinguishedName: string;
  mail: string | null;
  department: string | null;
  jobTitle: string | null;
  manager: string | null;
  accountEnabled: boolean;
  lastLogon: Date | string | null;
  lastPasswordSet: Date | string | null;
  passwordNeverExpires: boolean;
  passwordExpired: boolean;
  accountExpires: Date | string | null;
  whenCreated: Date | string;
  whenChanged: Date | string | null;
  memberOf: string[];
  directReports: string[];
  thumbnailPhoto: string | null;

  // Security information
  adminCount: number;
  userAccountControl: number;
  sidHistory: string[];

  // Extended attributes
  givenName: string | null;
  surname: string | null;
  initials: string | null;
  description: string | null;
  physicalDeliveryOfficeName: string | null;
  telephoneNumber: string | null;
  mobile: string | null;
  homePhone: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  company: string | null;
  employeeID: string | null;
  employeeType: string | null;
}

/**
 * Active Directory Group
 */
export interface ADGroup extends Identifiable, TimestampMetadata {
  name: string;
  distinguishedName: string;
  samAccountName: string;
  groupType: 'Security' | 'Distribution';
  groupScope: 'DomainLocal' | 'Global' | 'Universal';
  description: string | null;
  mail: string | null;
  managedBy: string | null;
  members: string[];
  memberOf: string[];
  whenCreated: Date | string;
  whenChanged: Date | string | null;
  adminCount: number;
  sidHistory: string[];
}

/**
 * Active Directory Computer
 */
export interface ADComputer extends Identifiable, TimestampMetadata {
  name: string;
  dnsHostName: string;
  distinguishedName: string;
  samAccountName: string;
  operatingSystem: string | null;
  operatingSystemVersion: string | null;
  operatingSystemServicePack: string | null;
  description: string | null;
  location: string | null;
  managedBy: string | null;
  enabled: boolean;
  lastLogon: Date | string | null;
  passwordLastSet: Date | string | null;
  whenCreated: Date | string;
  whenChanged: Date | string | null;
  servicePrincipalNames: string[];
  primaryGroupID: number;
  userAccountControl: number;
}

/**
 * Active Directory Organizational Unit
 */
export interface ADOrganizationalUnit extends Identifiable, TimestampMetadata {
  name: string;
  distinguishedName: string;
  description: string | null;
  managedBy: string | null;
  gpoLinks: ADGPOLink[];
  protectedFromAccidentalDeletion: boolean;
  whenCreated: Date | string;
  whenChanged: Date | string | null;
  childOUs: string[];
  childObjects: number;
}

/**
 * Active Directory Group Policy Object
 */
export interface ADGroupPolicy extends Identifiable, TimestampMetadata {
  displayName: string;
  distinguishedName: string;
  gpoId: string;
  domainName: string;
  owner: string | null;
  description: string | null;
  gpoStatus: 'AllSettingsEnabled' | 'UserSettingsDisabled' | 'ComputerSettingsDisabled' | 'AllSettingsDisabled';
  versionDirectory: number;
  versionSysvol: number;
  created: Date | string;
  modified: Date | string;
  userExtensions: string[];
  computerExtensions: string[];
  links: ADGPOLink[];
  wmiFilter: string | null;
}

/**
 * GPO Link Information
 */
export interface ADGPOLink {
  target: string;              // OU, Site, or Domain DN
  enabled: boolean;
  enforced: boolean;
  order: number;
}

/**
 * Active Directory Discovery Configuration
 */
export interface ADDiscoveryConfig {
  id: string;
  name: string;
  targetForest: string | null;
  targetDomains: string[];

  // Discovery scope
  includeUsers: boolean;
  includeGroups: boolean;
  includeComputers: boolean;
  includeOUs: boolean;
  includeGPOs: boolean;
  includeTrusts: boolean;
  includeSchema: boolean;
  includeSites: boolean;

  // Filters
  userFilter: string | null;
  groupFilter: string | null;
  computerFilter: string | null;
  ouSearchBase: string | null;

  // Options
  maxResults: number | null;
  pageSize: number;
  timeout: number;  // seconds
  includeDisabledAccounts: boolean;
  includeSystemAccounts: boolean;
  resolveNestedGroups: boolean;
  retrieveThumbnails: boolean;

  // Credentials
  useCurrentCredentials: boolean;
  credentialProfileId: string | null;

  // Schedule
  isScheduled: boolean;
  schedule: string | null;  // Cron expression

  // Advanced
  ldapFilter: string | null;
  attributes: string[] | null;
  searchScope: 'Base' | 'OneLevel' | 'Subtree';
}

/**
 * Active Directory Discovery Result
 */
export interface ADDiscoveryResult {
  id: string;
  configId: string;
  configName: string;
  startTime: Date | string;
  endTime: Date | string | null;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;  // 0-100

  // Discovered objects
  users: ADUser[];
  groups: ADGroup[];
  computers: ADComputer[];
  ous: ADOrganizationalUnit[];
  gpos: ADGroupPolicy[];
  trusts: ADTrust[];
  sites: ADSite[];
  forest: ADForest | null;

  // Statistics
  stats: {
    totalUsers: number;
    totalGroups: number;
    totalComputers: number;
    totalOUs: number;
    totalGPOs: number;
    enabledUsers: number;
    disabledUsers: number;
    enabledComputers: number;
    disabledComputers: number;
    securityGroups: number;
    distributionGroups: number;
  };

  // Errors and warnings
  errors: ADDiscoveryError[];
  warnings: ADDiscoveryWarning[];

  // Performance
  duration: number;  // milliseconds
  objectsPerSecond: number;
}

/**
 * Discovery Error
 */
export interface ADDiscoveryError {
  timestamp: Date | string;
  severity: 'critical' | 'error';
  code: string;
  message: string;
  details: string | null;
  objectDN: string | null;
}

/**
 * Discovery Warning
 */
export interface ADDiscoveryWarning {
  timestamp: Date | string;
  code: string;
  message: string;
  objectDN: string | null;
}

/**
 * Discovery Progress Event
 */
export interface ADDiscoveryProgress {
  resultId: string;
  phase: 'connecting' | 'discovering' | 'processing' | 'finalizing';
  currentOperation: string;
  progress: number;  // 0-100
  objectsProcessed: number;
  estimatedTimeRemaining: number | null;  // seconds
}

/**
 * AD Object Type Union
 */
export type ADObject = ADUser | ADGroup | ADComputer | ADOrganizationalUnit | ADGroupPolicy;

/**
 * AD Discovery Filter
 */
export interface ADDiscoveryFilter {
  objectType: 'user' | 'group' | 'computer' | 'ou' | 'gpo' | 'all';
  searchText: string;
  includeDisabled: boolean;
  domain: string | null;
  ou: string | null;
  advanced: {
    ldapFilter: string | null;
    attributes: string[];
  } | null;
}

/**
 * AD Discovery Export Options
 */
export interface ADDiscoveryExportOptions {
  format: 'csv' | 'excel' | 'json' | 'xml' | 'html';
  includeUsers: boolean;
  includeGroups: boolean;
  includeComputers: boolean;
  includeOUs: boolean;
  includeGPOs: boolean;
  includeTrusts: boolean;
  includeSummary: boolean;
  fileName: string;
  outputPath: string;
}

/**
 * AD Discovery Template
 */
export interface ADDiscoveryTemplate {
  id: string;
  name: string;
  description: string | null;
  category: 'standard' | 'security' | 'compliance' | 'migration' | 'audit' | 'custom';
  config: ADDiscoveryConfig;
  createdBy: string;
  createdDate: Date | string;
  modifiedDate: Date | string | null;
  isSystem: boolean;
}


