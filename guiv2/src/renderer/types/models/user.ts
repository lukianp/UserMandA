/**
 * User Data Type Definitions
 * Translated from GUI/Models/UserData.cs
 */

import { Identifiable, Selectable, Named, TimestampMetadata } from '../common';

/**
 * Core user data model
 * Immutable record representing user data from CSV files and Active Directory
 */
export interface UserData extends Identifiable, Selectable, Named, TimestampMetadata {
  // Core properties from UserData.cs
  displayName: string | null;
  userPrincipalName: string | null;
  mail: string | null;
  department: string | null;
  jobTitle: string | null;
  accountEnabled: boolean;
  samAccountName: string | null;
  companyName: string | null;
  managerDisplayName: string | null;
  createdDateTime: Date | string | null;
  userSource?: string | null;

  // Compatibility properties
  name?: string | null; // Maps to displayName
  email?: string | null; // Maps to mail
  id?: string; // Maps to userPrincipalName
  domain?: string | null;

  // Additional properties for enhanced functionality
  firstName?: string | null;
  lastName?: string | null;
  country?: string | null;
  company?: string | null; // Maps to companyName

  // UI selection state (mutable)
  isSelected?: boolean;

  // Extended user information
  givenName?: string | null;
  surname?: string | null;
  city?: string | null;
  mobilePhone?: string | null;
  lastSignInDateTime?: Date | string | null;
  groupMembershipCount?: string | null;
  assignedLicenses?: string | null;
  enabled?: boolean; // Maps to accountEnabled
  title?: string | null; // Maps to jobTitle
  isPrivileged?: boolean;
  passwordExpiryDate?: Date | string | null;
  lastLogonDate?: Date | string | null;
  createdDate?: Date | string;

  // Context menu capabilities
  canEdit?: boolean;
  canResetPassword?: boolean;
  canToggleAccount?: boolean;

  // Display properties
  status?: string; // Computed from accountEnabled
  officeLocation?: string | null;
  manager?: string | null; // Maps to managerDisplayName
  groups?: string | null;

  // Object metadata
  objectType?: string;
  userIds?: string[];
  applicationIds?: string[];
}

/**
 * User account status enumeration
 */
export type UserAccountStatus = 'active' | 'disabled' | 'locked' | 'expired' | 'pending';

/**
 * User info model for Active Directory operations
 */
export interface UserInfo extends Named {
  displayName: string;
  email: string;
  department: string;
  title: string;
  officeLocation: string;
  manager: string;
  status: string;
  source: string;
  lastLogon: Date | string | null;
  groups: string;
  canDelete?: boolean;
  isDefault?: boolean;
}

/**
 * User filter criteria
 */
export interface UserFilterCriteria {
  searchText?: string;
  departments?: string[];
  accountStatus?: UserAccountStatus[];
  hasManager?: boolean;
  isPrivileged?: boolean;
  dateRange?: {
    startDate: Date | string;
    endDate: Date | string;
  };
}

/**
 * User export options
 */
export interface UserExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeDisabled: boolean;
  selectedOnly: boolean;
  columns?: string[];
}

/**
 * User bulk operation result
 */
export interface UserBulkOperationResult {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  errors: Array<{
    userPrincipalName: string;
    error: string;
  }>;
}
