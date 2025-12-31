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
    'Users.csv',
    'Groups.csv',
    'ADPolicies.csv',
  ],
  'entra-id-app': [
    'AzureDiscovery_Applications.csv',
    'AzureDiscovery_ApplicationSecrets.csv',
    'AzureDiscovery_ServicePrincipals.csv',
    'EntraIDAppRegistrations.csv',
    'EntraIDEnterpriseApps.csv',
    'EntraIDServicePrincipals.csv',
  ],
  'external-identity': 'AzureDiscovery_Users.csv',
  'graph': [
    'AzureDiscovery_Users.csv',
    'AzureDiscovery_Groups.csv',
    'GraphUsers.csv',
    'GraphGroups.csv',
  ],
  'multi-domain-forest': 'EnvironmentDetection_DomainEnvironment.csv',
  'conditional-access': [
    'ConditionalAccessDiscovery.csv',
    'ConditionalAccessStatistics.csv',
  ],
  'gpo': [
    'GroupPolicies.csv',
    'GPO_PlaceholderData.csv',
  ],

  // =========================================================================
  // AZURE CLOUD
  // =========================================================================
  'azure-infrastructure': [
    'AzureDiscovery_Tenant.csv',
    'AzureInfrastructure.csv',
  ],
  'azure-resource': [
    'AzureResourceDiscovery.csv',
    'AzureResourceDiscovery_KeyVaults.csv',
    'AzureResourceDiscovery_StorageAccounts.csv',
    'AzureResourceDiscovery_Subscriptions.csv',
    'AzureResourceDiscovery_ResourceGroups.csv',
    'AzureResourceDiscovery_VirtualNetworks.csv',
    'AzureResourceDiscovery_WebApps.csv',
    'AzureResourceDiscovery_NetworkSecurityGroups.csv',
  ],
  'azure-automation': 'AzureResourceDiscovery.csv',
  'azure-acr': 'AzureResourceDiscovery.csv',
  'azure-functions': 'AzureResourceDiscovery_WebApps.csv',
  'azure-keyvault-access': 'AzureResourceDiscovery_KeyVaults.csv',
  'azure-logicapps': 'AzureResourceDiscovery.csv',
  'azure-managed-identities': 'AzureDiscovery_ServicePrincipals.csv',
  'azure-mgmt-groups': 'AzureResourceDiscovery_Subscriptions.csv',
  'azure-sp-credentials': [
    'AzureDiscovery_ApplicationSecrets.csv',
    'EntraIDApplicationSecrets.csv',
  ],
  'azure-storage-access': 'AzureResourceDiscovery_StorageAccounts.csv',
  'azure-pim': 'AzureDiscovery_DirectoryRoles.csv',
  'azure-sub-owners': 'AzureResourceDiscovery_Subscriptions.csv',
  'azure-vmss': 'AzureResourceDiscovery.csv',

  // =========================================================================
  // OTHER CLOUD PLATFORMS
  // =========================================================================
  'aws': 'AWSDiscovery.csv',
  'gcp': 'GCPDiscovery.csv',
  'google-workspace': 'GoogleWorkspaceDiscovery.csv',

  // =========================================================================
  // MICROSOFT 365
  // =========================================================================
  'exchange': [
    'ExchangeDiscovery.csv',
    'ExchangeMailboxes.csv',
    'ExchangeDistributionGroups.csv',
  ],
  'sharepoint': [
    'AzureDiscovery_SharePointSites.csv',
    'SharePointSites.csv',
    'SharePointLists.csv',
  ],
  'teams': [
    'AzureDiscovery_MicrosoftTeams.csv',
  ],
  'onedrive': [
    'OneDriveDiscovery.csv',
    'OneDriveStatistics.csv',
  ],
  'office365': [
    'AzureDiscovery_Users.csv',
    'GraphUsers.csv',
  ],
  'intune': 'AzureDiscovery_Users.csv',
  'power-platform': [
    'PowerPlatformDiscovery.csv',
    'PowerPlatform_Environments.csv',
  ],
  'powerbi': [
    'PowerBIDiscovery.csv',
    'PowerBIStatistics.csv',
  ],

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
  'file-server': 'FileServers.csv',
  'domain': [
    'EnvironmentDetection_DomainEnvironment.csv',
  ],
  'network': [
    'NetworkInfrastructure_NetworkAdapter.csv',
    'NetworkInfrastructure_NetworkRoute.csv',
    'NetworkInfrastructure_NetworkShare.csv',
    'NetworkInfrastructure_FirewallRule.csv',
  ],
  'applications': [
    'Applications.csv',
    'ApplicationCatalog.csv',
    'SoftwareInventory.csv',
  ],
  'environment': [
    'EnvironmentDetection_OperatingSystem.csv',
    'EnvironmentDetection_Hardware.csv',
    'EnvironmentDetection_NetworkAdapter.csv',
    'EnvironmentDetection_CloudEnvironment.csv',
    'EnvironmentDetection_SecurityEnvironment.csv',
    'EnvironmentDetection_SoftwareEnvironment.csv',
    'EnvironmentDetection_VirtualizationEnvironment.csv',
  ],
  'physical-server': [
    'PhysicalServerDiscovery.csv',
    'PhysicalServer_Hardware.csv',
    'PhysicalServer_BIOS.csv',
    'PhysicalServer_Storage.csv',
  ],
  'storage-array': [
    'Storage_LocalStorage.csv',
    'Storage_StorageSpaces.csv',
    'Storage_StorageSummary.csv',
  ],
  'infrastructure': [
    'Infrastructure.csv',
    'InfrastructureDiscovery_Subnet.csv',
    'TestInfrastructure.csv',
  ],
  'printer': 'PrinterDiscovery.csv',
  'scheduled-task': [
    'ScheduledTask_ScheduledTask.csv',
    'ScheduledTask_TaskAction.csv',
    'ScheduledTask_TaskSummary.csv',
    'ScheduledTask_TaskTrigger.csv',
  ],
  'backup-recovery': [
    'BackupRecoveryDiscovery.csv',
    'Backup_BackupAssessment.csv',
    'Backup_SystemRecovery.csv',
    'Backup_VSS.csv',
  ],
  'web-server': 'WebServer_WebFramework.csv',

  // =========================================================================
  // VIRTUALIZATION
  // =========================================================================
  'vmware': 'EnvironmentDetection_VirtualizationEnvironment.csv',
  'hyper-v': 'EnvironmentDetection_VirtualizationEnvironment.csv',
  'virtualization': 'EnvironmentDetection_VirtualizationEnvironment.csv',

  // =========================================================================
  // DATABASE
  // =========================================================================
  'sql-server': 'SQLInventory.csv',
  'database-schema': 'Databases.csv',

  // =========================================================================
  // SECURITY
  // =========================================================================
  'security': [
    'EnvironmentDetection_SecurityEnvironment.csv',
    'SecurityInfrastructureDiscovery.csv',
    'Security_AntivirusProducts.csv',
    'Security_FirewallProfiles.csv',
    'Security_SecurityServices.csv',
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
  'palo-alto': 'NetworkInfrastructure_FirewallRule.csv',
  'panorama-interrogation': 'NetworkInfrastructure_FirewallRule.csv',

  // =========================================================================
  // DATA & LICENSING
  // =========================================================================
  'data-classification': [
    'DataClassification_ClassificationSummary.csv',
    'DataClassification_LocalDriveClassification.csv',
  ],
  'licensing': [
    'LicensingDiscovery_Licenses.csv',
    'LicensingDiscovery_Summary.csv',
    'LicensingDiscovery_UserAssignments.csv',
    'LicensingDiscovery_ServicePlans.csv',
    'LicensingSubscriptions.csv',
  ],
  'dns-dhcp': [
    'DNSDHCPDiscovery.csv',
    'NetworkInfrastructure_DNSInfrastructure.csv',
    'NetworkInfrastructure_DHCPServer.csv',
    'Network_DNSServers.csv',
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


