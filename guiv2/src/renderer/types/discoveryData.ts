/**
 * Discovery Data Type Definitions
 *
 * TypeScript interfaces for CSV data from PowerShell discovery modules
 * CRITICAL: All properties use PascalCase to match PowerShell output
 */

import { ColDef } from 'ag-grid-community';

/**
 * Base interface for all discovery data
 */
export interface BaseDiscoveryData {
  /** Unique identifier */
  Id?: string;
  /** Display name */
  Name?: string;
  /** Data type discriminator (from _DataType property) */
  _DataType?: string;
  /** Timestamp fields (PowerShell DateTime format) */
  CreatedDate?: any;
  ModifiedDate?: any;
  LastLogonTime?: any;
  WhenCreated?: any;
}

/**
 * AWS Discovery Data
 */
export interface AwsDiscoveryData extends BaseDiscoveryData {
  /** AWS Account ID */
  AccountId?: string;
  /** AWS Region */
  Region?: string;
  /** Resource Type (EC2, S3, RDS, etc.) */
  ResourceType?: string;
  /** Resource ARN */
  Arn?: string;
  /** Resource State */
  State?: string;
  /** Instance Type (for EC2) */
  InstanceType?: string;
  /** VPC ID */
  VpcId?: string;
  /** Subnet ID */
  SubnetId?: string;
  /** Tags (JSON string or comma-separated) */
  Tags?: string;
}

/**
 * GCP Discovery Data
 */
export interface GcpDiscoveryData extends BaseDiscoveryData {
  /** GCP Project ID */
  ProjectId?: string;
  /** GCP Zone */
  Zone?: string;
  /** Resource Type (Compute, Storage, etc.) */
  ResourceType?: string;
  /** Resource ID */
  ResourceId?: string;
  /** Machine Type */
  MachineType?: string;
  /** Network */
  Network?: string;
  /** Status */
  Status?: string;
  /** Labels (JSON string) */
  Labels?: string;
}

/**
 * Azure Discovery Data (existing, for reference)
 */
export interface AzureDiscoveryData extends BaseDiscoveryData {
  /** Subscription ID */
  SubscriptionId?: string;
  /** Resource Group */
  ResourceGroup?: string;
  /** Resource Type */
  ResourceType?: string;
  /** Location */
  Location?: string;
  /** SKU */
  Sku?: string;
  /** Tags */
  Tags?: string;
}

/**
 * VMware Discovery Data
 */
export interface VmwareDiscoveryData extends BaseDiscoveryData {
  /** vCenter Server */
  VCenterServer?: string;
  /** Datacenter */
  Datacenter?: string;
  /** Cluster */
  Cluster?: string;
  /** Host */
  Host?: string;
  /** VM Name */
  VmName?: string;
  /** Power State */
  PowerState?: string;
  /** CPU Count */
  NumCpu?: number;
  /** Memory MB */
  MemoryMB?: number;
  /** Guest OS */
  GuestOS?: string;
  /** IP Address */
  IpAddress?: string;
}

/**
 * Hyper-V Discovery Data
 */
export interface HyperVDiscoveryData extends BaseDiscoveryData {
  /** Hyper-V Host */
  HostName?: string;
  /** VM Name */
  VmName?: string;
  /** State */
  State?: string;
  /** CPU Count */
  ProcessorCount?: number;
  /** Memory MB */
  MemoryMB?: number;
  /** Generation */
  Generation?: number;
  /** Version */
  Version?: string;
  /** Network Adapters */
  NetworkAdapters?: string;
}

/**
 * Intune Discovery Data
 */
export interface IntuneDiscoveryData extends BaseDiscoveryData {
  /** Device Name */
  DeviceName?: string;
  /** User Principal Name */
  UserPrincipalName?: string;
  /** OS */
  OperatingSystem?: string;
  /** OS Version */
  OsVersion?: string;
  /** Compliance State */
  ComplianceState?: string;
  /** Managed Device Owner Type */
  ManagedDeviceOwnerType?: string;
  /** Enrollment Date */
  EnrollmentDate?: any;
  /** Last Sync Date */
  LastSyncDateTime?: any;
  /** Device ID */
  DeviceId?: string;
}

/**
 * Conditional Access Discovery Data
 */
export interface ConditionalAccessData extends BaseDiscoveryData {
  /** Policy Name */
  DisplayName?: string;
  /** Policy State */
  State?: string;
  /** Conditions */
  Conditions?: string;
  /** Grant Controls */
  GrantControls?: string;
  /** Session Controls */
  SessionControls?: string;
  /** Created DateTime */
  CreatedDateTime?: any;
  /** Modified DateTime */
  ModifiedDateTime?: any;
}

/**
 * Certificate Authority Discovery Data
 */
export interface CertificateAuthorityData extends BaseDiscoveryData {
  /** CA Name */
  CAName?: string;
  /** CA Type */
  CAType?: string;
  /** Certificate */
  Certificate?: string;
  /** Thumbprint */
  Thumbprint?: string;
  /** Issuer */
  Issuer?: string;
  /** Subject */
  Subject?: string;
  /** Not Before */
  NotBefore?: any;
  /** Not After */
  NotAfter?: any;
}

/**
 * DLP Discovery Data
 */
export interface DlpData extends BaseDiscoveryData {
  /** Policy Name */
  PolicyName?: string;
  /** Rule Name */
  RuleName?: string;
  /** Mode */
  Mode?: string;
  /** Priority */
  Priority?: number;
  /** Locations */
  Locations?: string;
  /** Content Contains */
  ContentContains?: string;
  /** Actions */
  Actions?: string;
}

/**
 * Entra ID App Discovery Data
 */
export interface EntraIdAppData extends BaseDiscoveryData {
  /** Application ID */
  ApplicationId?: string;
  /** Display Name */
  DisplayName?: string;
  /** Publisher Domain */
  PublisherDomain?: string;
  /** Sign In Audience */
  SignInAudience?: string;
  /** Reply URLs */
  ReplyUrls?: string;
  /** App Roles */
  AppRoles?: string;
  /** Required Resource Access */
  RequiredResourceAccess?: string;
}

/**
 * GPO Discovery Data
 */
export interface GpoData extends BaseDiscoveryData {
  /** GPO Name */
  DisplayName?: string;
  /** GPO GUID */
  GpoId?: string;
  /** Domain Name */
  DomainName?: string;
  /** Owner */
  Owner?: string;
  /** Link Enabled */
  LinkEnabled?: boolean;
  /** GPO Status */
  GpoStatus?: string;
  /** WMI Filter */
  WmiFilter?: string;
}

/**
 * Power BI Discovery Data
 */
export interface PowerBiData extends BaseDiscoveryData {
  /** Workspace Name */
  WorkspaceName?: string;
  /** Workspace ID */
  WorkspaceId?: string;
  /** Report Name */
  ReportName?: string;
  /** Report ID */
  ReportId?: string;
  /** Dataset Name */
  DatasetName?: string;
  /** Dataset ID */
  DatasetId?: string;
  /** Owner */
  Owner?: string;
}

/**
 * Power Platform Discovery Data
 */
export interface PowerPlatformData extends BaseDiscoveryData {
  /** Environment Name */
  EnvironmentName?: string;
  /** Environment ID */
  EnvironmentId?: string;
  /** App Name */
  AppName?: string;
  /** App ID */
  AppId?: string;
  /** App Type */
  AppType?: string;
  /** Owner */
  Owner?: string;
  /** Created By */
  CreatedBy?: string;
}

/**
 * SQL Server Discovery Data
 */
export interface SqlServerData extends BaseDiscoveryData {
  /** Server Name */
  ServerName?: string;
  /** Instance Name */
  InstanceName?: string;
  /** Database Name */
  DatabaseName?: string;
  /** Version */
  Version?: string;
  /** Edition */
  Edition?: string;
  /** Compatibility Level */
  CompatibilityLevel?: number;
  /** Size MB */
  SizeMB?: number;
  /** Recovery Model */
  RecoveryModel?: string;
}

/**
 * Auto-generate AG Grid column definitions from TypeScript interface
 *
 * @param sampleData - Sample data row to extract field names
 * @param customColumns - Optional custom column definitions
 * @returns AG Grid column definitions
 */
export function generateColumnDefs<T extends BaseDiscoveryData>(
  sampleData: T | null,
  customColumns?: Partial<Record<keyof T, Partial<ColDef>>>
): ColDef<T>[] {
  if (!sampleData) {
    return [];
  }

  const fields = Object.keys(sampleData) as (keyof T)[];

  return fields
    .filter((field) => !String(field).startsWith('_')) // Exclude internal fields
    .map((field) => {
      const fieldName = String(field);
      const custom = customColumns?.[field];

      // Default column definition
      const colDef: ColDef<T> = {
        field: fieldName,
        headerName: fieldName.replace(/([A-Z])/g, ' $1').trim(), // Add spaces before capitals
        sortable: true,
        filter: true,
        resizable: true,
        ...custom,
      };

      // Auto-detect number columns
      if (
        fieldName.includes('Count') ||
        fieldName.includes('Size') ||
        fieldName.includes('MB') ||
        fieldName.includes('GB') ||
        fieldName.includes('Priority')
      ) {
        colDef.filter = 'agNumberColumnFilter';
      }

      // Auto-detect date columns
      if (
        fieldName.includes('Date') ||
        fieldName.includes('Time') ||
        fieldName.includes('Created') ||
        fieldName.includes('Modified')
      ) {
        colDef.filter = 'agDateColumnFilter';
      }

      return colDef;
    });
}

/**
 * Parse PowerShell DateTime object to JavaScript Date
 *
 * Handles three formats:
 * 1. PowerShell DateTime property: { DateTime: "01 December 2025 22:33:35" }
 * 2. Microsoft JSON date: { value: "/Date(1764628412765)/" }
 * 3. ISO string: "2025-12-01T22:33:35.000Z"
 */
export function parsePowerShellDate(dateObj: any): Date | undefined {
  if (!dateObj) return undefined;

  // FIRST: Try DateTime property (most reliable)
  if (dateObj.DateTime) {
    return new Date(dateObj.DateTime);
  }

  // SECOND: Try Microsoft JSON date format /Date(timestamp)/
  if (dateObj.value && typeof dateObj.value === 'string' && dateObj.value.startsWith('/Date(')) {
    const timestamp = dateObj.value.match(/\/Date\((\d+)\)\//)?.[1];
    return timestamp ? new Date(parseInt(timestamp)) : undefined;
  }

  // THIRD: Try ISO string or direct conversion
  try {
    return new Date(dateObj);
  } catch {
    return undefined;
  }
}


