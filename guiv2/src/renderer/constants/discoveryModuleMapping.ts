/**
 * Discovery Module to CSV File Mapping
 *
 * Maps discovery module IDs to their corresponding CSV file patterns
 * used to determine the last successful run date.
 */

/**
 * CSV file pattern for a discovery module
 * Can be a single file or an array of files to check
 */
export type CsvFilePattern = string | string[];

/**
 * Mapping of discovery module IDs to their CSV output files
 *
 * The keys correspond to the module IDs defined in useInfrastructureDiscoveryHubLogic.ts
 * The values are CSV file names (without path) that the module generates in the Raw directory
 */
export const DISCOVERY_MODULE_CSV_MAPPING: Record<string, CsvFilePattern> = {
  // =========================================================================
  // IDENTITY & ACCESS
  // =========================================================================
  'active-directory': [
    'ActiveDirectoryDiscovery.csv',
    'ADUsers.csv',
    'ADGroups.csv',
    'ADComputers.csv',
  ],
  'entra-id-app': [
    'AzureDiscovery_Applications.csv',
    'AzureDiscovery_ApplicationSecrets.csv',
    'AzureDiscovery_ServicePrincipals.csv',
  ],
  'external-identity': 'ExternalIdentity.csv',
  'graph': [
    'AzureDiscovery_Users.csv',
    'AzureDiscovery_Groups.csv',
  ],
  'multi-domain-forest': 'MultiDomainForestDiscovery.csv',
  'conditional-access': [
    'ConditionalAccessDiscovery.csv',
    'ConditionalAccessStatistics.csv',
  ],
  'gpo': 'GroupPolicyDiscovery.csv',

  // =========================================================================
  // CLOUD PLATFORMS
  // =========================================================================
  'azure-infrastructure': [
    'AzureDiscovery_Tenant.csv',
    'AzureInfrastructureDiscovery.csv',
  ],
  'azure-resource': 'AzureResourceDiscovery.csv',
  'aws': 'AWSDiscovery.csv',
  'gcp': 'GCPDiscovery.csv',
  'google-workspace': 'GoogleWorkspaceDiscovery.csv',

  // =========================================================================
  // MICROSOFT 365
  // =========================================================================
  'exchange': 'ExchangeDiscovery.csv',
  'sharepoint': [
    'AzureDiscovery_SharePointSites.csv',
    'SharePointDiscovery.csv',
  ],
  'teams': [
    'AzureDiscovery_MicrosoftTeams.csv',
    'TeamsDiscovery.csv',
  ],
  'onedrive': 'OneDriveDiscovery.csv',
  'office365': [
    'AzureDiscovery_Users.csv',
    'Office365Discovery.csv',
  ],
  'intune': 'IntuneDiscovery.csv',
  'power-platform': 'PowerPlatformDiscovery.csv',
  'powerbi': 'PowerBIDiscovery.csv',

  // =========================================================================
  // INFRASTRUCTURE
  // =========================================================================
  'file-system': [
    'FileSystemFileAnalysis.csv',
    'FileSystemShares.csv',
    'FileSystemServers.csv',
    'FileSystemPermissions.csv',
    'FileSystemLargeFiles.csv',
  ],
  'file-server': 'FileServerDiscovery.csv',
  'domain': [
    'EnvironmentDetection_DomainEnvironment.csv',
    'DomainDiscovery.csv',
  ],
  'network': 'NetworkDiscovery.csv',
  'applications': 'ApplicationDiscovery.csv',
  'environment': [
    'EnvironmentDetection_OperatingSystem.csv',
    'EnvironmentDetection_Hardware.csv',
    'EnvironmentDetection_NetworkAdapter.csv',
    'EnvironmentDetection_CloudEnvironment.csv',
    'EnvironmentDetection_SecurityEnvironment.csv',
  ],
  'physical-server': 'PhysicalServerDiscovery.csv',
  'storage-array': 'StorageArrayDiscovery.csv',
  'printer': 'PrinterDiscovery.csv',
  'scheduled-task': 'ScheduledTaskDiscovery.csv',
  'backup-recovery': [
    'BackupRecoveryDiscovery.csv',
    'Backup_BackupAssessment.csv',
    'Backup_SystemRecovery.csv',
    'Backup_VSS.csv',
  ],
  'web-server': 'WebServerDiscovery.csv',

  // =========================================================================
  // VIRTUALIZATION
  // =========================================================================
  'vmware': 'VMwareDiscovery.csv',
  'hyper-v': 'HyperVDiscovery.csv',
  'virtualization': 'VirtualizationDiscovery.csv',

  // =========================================================================
  // DATABASE
  // =========================================================================
  'sql-server': 'SQLServerDiscovery.csv',
  'database-schema': 'DatabaseSchemaDiscovery.csv',

  // =========================================================================
  // SECURITY
  // =========================================================================
  'security': [
    'EnvironmentDetection_SecurityEnvironment.csv',
    'SecurityDiscovery.csv',
  ],
  'certificate': 'Certificate_LocalCertificate.csv',
  'certificate-authority': [
    'CertificateAuthorityDiscovery.csv',
    'CA_Certificates.csv',
    'Certificate_CertificateAuthority.csv',
  ],
  'dlp': [
    'DLPDiscovery.csv',
    'DLPStatistics.csv',
  ],
  'palo-alto': 'PaloAltoDiscovery.csv',
  'panorama-interrogation': 'PanoramaDiscovery.csv',

  // =========================================================================
  // DATA & LICENSING
  // =========================================================================
  'data-classification': [
    'DataClassification_ClassificationSummary.csv',
    'DataClassification_LocalDriveClassification.csv',
  ],
  'licensing': 'LicensingDiscovery.csv',
  'dns-dhcp': [
    'DNSDHCPDiscovery.csv',
    'DNSDHCPDiscoverySummary.json',
  ],
};

/**
 * Get CSV file pattern(s) for a discovery module
 *
 * @param moduleId - The discovery module ID
 * @returns Array of CSV file names to check, or empty array if not found
 */
export function getModuleCsvFiles(moduleId: string): string[] {
  const pattern = DISCOVERY_MODULE_CSV_MAPPING[moduleId];

  if (!pattern) {
    return [];
  }

  return Array.isArray(pattern) ? pattern : [pattern];
}

/**
 * Get all discovery module IDs that have CSV mappings
 *
 * @returns Array of module IDs with CSV file mappings
 */
export function getMappedModuleIds(): string[] {
  return Object.keys(DISCOVERY_MODULE_CSV_MAPPING);
}


