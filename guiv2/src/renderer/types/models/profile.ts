/**
 * Profile Type Definitions
 * Translated from GUI/Models/TargetProfile.cs
 */

import { Identifiable, Named, ConnectionStatus, TimestampMetadata, Dictionary } from '../common';

/**
 * Base profile interface
 */
export interface Profile extends Identifiable, Named, TimestampMetadata {
  id: string;
  name: string;
  tenantId: string;
  clientId: string;

  // Encrypted secrets (stored as Base64 - never log or expose)
  clientSecretEncrypted: string;

  // Environment information
  environment: EnvironmentType;
  domain: string;
  region: string;
  tenantName: string;
  sharePointUrl: string;
  sqlConnectionString: string;

  // Connection credentials (encrypted)
  usernameEncrypted: string;
  passwordEncrypted: string;
  certificateThumbprint: string;

  // Graph API configuration
  scopes: string[];

  // Connection test results
  lastConnectionTest: Date | string | null;
  lastConnectionTestResult: boolean | null;
  lastConnectionTestMessage: string;

  // Metadata
  created: Date | string;
  lastModified: Date | string;
  isActive: boolean;
}

/**
 * Target profile for migrations (extends base profile)
 */
export type TargetProfile = Profile

/**
 * Environment type enumeration
 */
export type EnvironmentType = 'Unknown' | 'OnPremises' | 'Azure' | 'Hybrid';

/**
 * Connection type
 */
export type ConnectionType = 'ClientSecret' | 'Certificate' | 'ServicePrincipal' | 'Interactive';

/**
 * Credential information (for forms, never persisted)
 */
export interface CredentialInfo {
  clientSecret?: string; // Plain text, only used in memory
  username?: string;
  password?: string;
  certificateThumbprint?: string;
  authenticationType: ConnectionType;
}

/**
 * Profile configuration for creation/editing
 */
export interface ProfileConfiguration {
  name: string;
  tenantId: string;
  clientId: string;
  environment: EnvironmentType;
  domain: string;
  region?: string;
  tenantName?: string;
  sharePointUrl?: string;
  sqlConnectionString?: string;
  scopes?: string[];
  credentials: CredentialInfo;
}

/**
 * Connection test result
 */
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  testedAt: Date | string;
  duration: number; // milliseconds
  details: Dictionary<any>;
}

/**
 * Profile validation result
 */
export interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Company profile for discovery operations
 */
export interface CompanyProfile extends Identifiable, Named, TimestampMetadata {
  id: string;
  companyName: string;
  description: string;
  domainController: string;
  tenantId: string;
  isActive: boolean;
  created: Date | string;
  lastModified: Date | string;

  // Discovery metadata
  recordCount: number;
  lastDiscovery: Date | string | null;

  // Legacy compatibility properties
  displayName?: string;
  createdDate?: Date | string;
  lastModifiedDate?: Date | string;
  path?: string;
  industry?: string;
  isHybrid?: boolean;
  hasDatabases?: boolean;
  estimatedUserCount?: number;
  estimatedDeviceCount?: number;
  estimatedDataSize?: number; // bytes
  locations?: string[];

  configuration: Dictionary<any>;
  isDefault: boolean;
  canDelete?: boolean;
}

/**
 * Profile list item (for dropdowns and lists)
 */
export interface ProfileListItem {
  id: string;
  name: string;
  environment: EnvironmentType;
  isActive: boolean;
  lastConnectionTestResult: boolean | null;
  displayText: string; // Formatted display name
}

/**
 * App registration credentials (for import)
 */
export interface AppRegistrationCredentials {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  domain?: string;
  credentialFile?: string;
}

/**
 * Credential summary from file
 */
export interface CredentialSummary {
  tenantId: string;
  clientId: string;
  domain?: string;
  credentialFile?: string;
  createdAt?: Date | string;
}
