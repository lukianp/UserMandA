/**
 * User Detail Type Definitions
 *
 * Comprehensive user detail projection with correlated data across all discovery modules.
 * Mirrors C# UserDetailProjection from LogicEngineModels.cs (lines 261-282).
 *
 * Epic 1 Task 1.2: UserDetailView Component
 */

import { UserData } from './user';
import { GroupData } from './group';
import { ApplicationData } from './application';

/**
 * Device Data
 * Correlated device information for user
 */
export interface DeviceData {
  id: string;
  name: string;
  dns: string | null;
  os: string | null;
  ou: string | null;
  primaryUserSid: string | null;
  lastSeen: Date | string | null;
  ipAddress: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  domain: string | null;
  isEnabled: boolean;
  source?: 'Intune' | 'AD' | 'ConfigMgr';  // Origin of this device record
}

/**
 * Mapped Drive Data
 * User's network drive mappings
 */
export interface MappedDriveData {
  driveLetter: string;              // e.g., "Z:"
  uncPath: string;                  // e.g., "\\server\share"
  userSid: string;
  persistent: boolean;
  label?: string;
  connected?: boolean;
}

/**
 * File Access Entry (ACL)
 * Represents a user's file/share access permissions
 */
export interface FileAccessEntry {
  path: string;                     // File/folder path or share name
  rights: string;                   // e.g., "FullControl", "Read", "Modify"
  inherited: boolean;               // Is this an inherited permission?
  isShare: boolean;                 // Is this a share-level permission?
  isNtfs: boolean;                  // Is this an NTFS permission?
  identitySid: string;              // User/group SID with this permission
  accessType?: 'Allow' | 'Deny';
  appliesTo?: string;
}

/**
 * GPO Data
 * Group Policy Object information
 */
export interface GpoData {
  name: string;
  guid: string;
  enabled: boolean;
  wmiFilter?: string;
  linkedOu?: string;
  gpoStatus?: string;
  description?: string;
  createdDate?: Date | string;
  modifiedDate?: Date | string;
}

/**
 * Mailbox Data
 * Exchange/Office 365 mailbox information
 */
export interface MailboxData {
  mailboxGuid: string;
  userPrincipalName: string;
  sizeMb: number;
  type: 'UserMailbox' | 'SharedMailbox' | 'RoomMailbox' | 'EquipmentMailbox';
  itemCount?: number;
  database?: string;
  serverName?: string;
  quotaGB?: number;
  prohibitSendQuotaGB?: number;
  issueWarningQuotaGB?: number;
  lastLogonTime?: Date | string;
}

/**
 * Azure Role Assignment
 * Azure AD/RBAC role assignments
 */
export interface AzureRoleAssignment {
  roleName: string;                 // e.g., "Global Administrator"
  scope: string;                    // e.g., "/subscriptions/xyz" or "Directory"
  principalObjectId: string;        // Azure Object ID
  principalType: 'User' | 'Group' | 'ServicePrincipal';
  assignmentId: string;
  roleDefinitionId?: string;
  createdOn?: Date | string;
  isInherited?: boolean;
}

/**
 * SQL Database Access
 * SQL Server database access information
 */
export interface SqlDatabaseData {
  server: string;
  instance: string;
  database: string;
  role?: string;                    // e.g., "db_owner", "db_datareader"
  loginType?: 'Windows' | 'SQL';
  hasAccess: boolean;
  permissions?: string[];
  appHints?: string;                // Detected application usage
  lastAccessed?: Date | string;
}

/**
 * Risk Item
 * Represents a detected security or compliance risk
 */
export interface RiskItem {
  type: string;                     // e.g., "AdminWithoutMFA", "StaleAccount", "OverprivilegedUser"
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  recommendation: string;
  affectedEntity: string;           // SID, Name, or other identifier
  detectedAt: Date | string;
  category?: 'Security' | 'Compliance' | 'Configuration' | 'Performance';
  remediation?: string;
  cvssScore?: number;
}

/**
 * Migration Hint
 * Suggestions and recommendations for migration planning
 */
export interface MigrationHint {
  category: string;                 // e.g., "Device", "Application", "Group"
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  actionRequired: boolean;
  impact?: 'High' | 'Medium' | 'Low';
  complexity?: 'High' | 'Medium' | 'Low';
  estimatedEffort?: string;
  dependencies?: string[];
}

/**
 * Teams Membership
 * Microsoft Teams the user belongs to
 */
export interface TeamMembership {
  teamName: string;
  teamId: string;
  userRole: 'Owner' | 'Member';     // User's role in the team
  channelCount: number;             // Number of channels in the team
  channels?: string[];              // Specific channels (especially private channels)
  source: 'Teams' | 'TeamsGraph';   // Data source
}

/**
 * SharePoint Site Access
 * SharePoint sites the user has access to
 */
export interface SharePointSiteAccess {
  siteName: string;
  siteUrl: string;
  accessLevel: string;              // e.g., "Owner", "Member", "Visitor"
  isOneDrive: boolean;              // Is this the user's OneDrive?
  source: 'SharePointOnline' | 'SharePointOnPrem';
  lastAccessed?: Date | string;
}

/**
 * User Detail Projection
 *
 * Complete user data with all correlated entities.
 * This is the primary data structure returned by LogicEngineService.getUserDetailAsync().
 *
 * Mirrors C# UserDetailProjection from LogicEngineModels.cs (lines 261-282).
 */
export interface UserDetailProjection {
  // Core User Data (from UserDto)
  user: UserData;

  // Related Entities (correlated by LogicEngineService)
  groups: GroupData[];              // Group memberships
  devices: DeviceData[];            // Assigned/primary devices
  apps: ApplicationData[];          // Used applications (via device correlation)
  drives: MappedDriveData[];        // Mapped network drives
  fileAccess: FileAccessEntry[];    // File/share access permissions
  gpoLinks: GpoData[];              // Applied GPO links
  gpoFilters: GpoData[];            // GPO security filters
  mailbox: MailboxData | null;      // Mailbox data (if exists)
  azureRoles: AzureRoleAssignment[]; // Azure role assignments
  sqlDatabases: SqlDatabaseData[];  // SQL database access
  risks: RiskItem[];                // Detected risks
  migrationHints: MigrationHint[];  // Migration recommendations
  teams: TeamMembership[];          // Microsoft Teams memberships
  sharepointSites: SharePointSiteAccess[]; // SharePoint site access

  // Computed Properties (mirror C# computed properties)
  memberOfGroups: string[];         // Groups.Select(g => g.name)
  managedGroups: string[];          // Groups.Where(g => g.managedBy == User.Dn)
  managerUpn: string;               // User.Manager UPN
  ownedGroups: string[];            // Groups.Where(g => g.managedBy == User.Dn)

  // Statistics
  stats?: UserDetailStats;
}

/**
 * User Detail Statistics
 * Aggregated statistics about user's resources and access
 */
export interface UserDetailStats {
  totalGroups: number;
  totalDevices: number;
  totalApplications: number;
  totalFileAccess: number;
  totalGpos: number;
  totalAzureRoles: number;
  totalSqlDatabases: number;
  totalRisks: number;
  highRiskCount: number;
  criticalRiskCount: number;
}

/**
 * User Detail Load Options
 * Options for loading user detail data
 */
export interface UserDetailLoadOptions {
  userId: string;
  includeDevices?: boolean;
  includeApplications?: boolean;
  includeGroups?: boolean;
  includeFileAccess?: boolean;
  includeGpos?: boolean;
  includeMailbox?: boolean;
  includeAzureRoles?: boolean;
  includeSqlDatabases?: boolean;
  includeRisks?: boolean;
  includeMigrationHints?: boolean;
  forceRefresh?: boolean;           // Skip cache
}

/**
 * User Detail Export Format
 * Supported export formats for user detail snapshot
 */
export type UserDetailExportFormat = 'json' | 'csv' | 'excel' | 'pdf';

/**
 * User Detail Export Options
 * Configuration for exporting user detail data
 */
export interface UserDetailExportOptions {
  format: UserDetailExportFormat;
  fileName?: string;
  includeOverview?: boolean;
  includeDevices?: boolean;
  includeApplications?: boolean;
  includeGroups?: boolean;
  includeFileAccess?: boolean;
  includeGpos?: boolean;
  includeMailbox?: boolean;
  includeAzureRoles?: boolean;
  includeSqlDatabases?: boolean;
  includeRisks?: boolean;
  includeMigrationHints?: boolean;
  includeCharts?: boolean;          // For PDF/Excel exports
  includeSummary?: boolean;
}


