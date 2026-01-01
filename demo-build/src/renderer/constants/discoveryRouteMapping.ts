/**
 * Discovery Route Mapping
 *
 * Central mapping of discovery module IDs to their discovered view routes.
 * Used by ViewDiscoveredDataButton to navigate to the correct discovered view.
 *
 * Pattern: Discovery routes use hyphens (e.g., /discovery/azure-resource)
 *          Discovered routes are lowercase without hyphens (e.g., /discovered/azureresource)
 */

export const discoveryToDiscoveredRoutes: Record<string, string> = {
  // ===== AZURE / MICROSOFT 365 CLOUD =====
  'azure-infrastructure': '/discovered/azure',
  'azure-resource': '/discovered/azureresource',
  'azure-vmss': '/discovered/azurevmss',
  'azure-functions': '/discovered/azurefunctions',
  'azure-acr': '/discovered/azureacr',
  'azure-automation': '/discovered/azureautomation',
  'azure-logicapps': '/discovered/azurelogicapps',
  'azure-mgmt-groups': '/discovered/azuremgmtgroups',
  'azure-pim': '/discovered/azurepim',
  'azure-sub-owners': '/discovered/azuresubowners',
  'azure-keyvault': '/discovered/azurekeyvault',
  'azure-keyvault-access': '/discovered/azurekeyvaultaccess',
  'azure-managed-identities': '/discovered/azuremanagedidentities',
  'azure-sp-credentials': '/discovered/azurespcredentials',
  'azure-storage-access': '/discovered/azurestorageaccess',
  'conditional-access': '/discovered/conditionalaccess',
  'entra-id-app': '/discovered/entraidapp',
  'exchange': '/discovered/exchange',
  'intune': '/discovered/intune',
  'licensing': '/discovered/licensing',
  'graph': '/discovered/graph',
  'teams': '/discovered/teams',
  'office365': '/discovered/office365',
  'onedrive': '/discovered/onedrive',
  'powerbi': '/discovered/powerbi',
  'power-platform': '/discovered/powerplatform',
  'sharepoint': '/discovered/sharepoint',

  // ===== ACTIVE DIRECTORY / ON-PREM DOMAIN =====
  'active-directory': '/discovered/activedirectory',
  'domain': '/discovered/domain',
  'gpo': '/discovered/gpo',
  'multi-domain-forest': '/discovered/multidomainforest',

  // ===== INFRASTRUCTURE =====
  'applications': '/discovered/applications',
  'aws': '/discovered/aws',
  'backup-recovery': '/discovered/backuprecovery',
  'certificate-authority': '/discovered/certificateauthority',
  'certificate': '/discovered/certificates',
  'data-classification': '/discovered/dataclassification',
  'database-schema': '/discovered/databaseschema',
  'dlp': '/discovered/dlp',
  'dns-dhcp': '/discovered/dnsdhcp',
  'environment': '/discovered/environmentdetection',
  'external-identity': '/discovered/externalidentity',
  'file-server': '/discovered/fileserver',
  'file-system': '/discovered/filesystem',
  'gcp': '/discovered/gcp',
  'google-workspace': '/discovered/googleworkspace',
  'hyper-v': '/discovered/hyperv',
  'infrastructure': '/discovered/infrastructure',
  'network': '/discovered/networkinfrastructure',
  'palo-alto': '/discovered/paloalto',
  'panorama-interrogation': '/discovered/panoramainterrogation',
  'physical-server': '/discovered/physicalserver',
  'printer': '/discovered/printers',
  'scheduled-task': '/discovered/scheduledtasks',
  'security': '/discovered/securityinfrastructure',
  'sql-server': '/discovered/sqlserver',
  'storage-array': '/discovered/storagearray',
  'virtualization': '/discovered/virtualization',
  'vmware': '/discovered/vmware',
  'web-server': '/discovered/webserverconfig',
};

/**
 * Human-readable labels for each discovery module.
 * Used by ViewDiscoveredDataButton for button text.
 */
export const discoveryModuleLabels: Record<string, string> = {
  // Azure / Microsoft 365
  'azure-infrastructure': 'Entra ID & Microsoft 365',
  'azure-resource': 'Azure Resource',
  'azure-vmss': 'Azure VM Scale Sets',
  'azure-functions': 'Azure Functions',
  'azure-acr': 'Azure Container Registry',
  'azure-automation': 'Azure Automation',
  'azure-logicapps': 'Azure Logic Apps',
  'azure-mgmt-groups': 'Azure Management Groups',
  'azure-pim': 'Azure PIM Roles',
  'azure-sub-owners': 'Azure Subscription Owners',
  'azure-keyvault': 'Azure Key Vaults',
  'azure-keyvault-access': 'Azure Key Vault Access',
  'azure-managed-identities': 'Azure Managed Identities',
  'azure-sp-credentials': 'Service Principal Credentials',
  'azure-storage-access': 'Azure Storage Access',
  'conditional-access': 'Conditional Access',
  'entra-id-app': 'Entra ID Applications',
  'exchange': 'Exchange',
  'intune': 'Intune',
  'licensing': 'Licensing',
  'graph': 'Microsoft Graph',
  'teams': 'Teams',
  'office365': 'Office 365',
  'onedrive': 'OneDrive',
  'powerbi': 'Power BI',
  'power-platform': 'Power Platform',
  'sharepoint': 'SharePoint',

  // Active Directory / On-Prem
  'active-directory': 'Active Directory',
  'domain': 'Domain',
  'gpo': 'Group Policy',
  'multi-domain-forest': 'Multi-Domain Forest',

  // Infrastructure
  'applications': 'Applications',
  'aws': 'AWS Cloud',
  'backup-recovery': 'Backup & Recovery',
  'certificate-authority': 'Certificate Authority',
  'certificate': 'Certificates',
  'data-classification': 'Data Classification',
  'database-schema': 'Database Schema',
  'dlp': 'DLP',
  'dns-dhcp': 'DNS & DHCP',
  'environment': 'Environment Detection',
  'external-identity': 'External Identity',
  'file-server': 'File Server',
  'file-system': 'File System',
  'gcp': 'GCP Cloud',
  'google-workspace': 'Google Workspace',
  'hyper-v': 'Hyper-V',
  'infrastructure': 'Infrastructure',
  'network': 'Network',
  'palo-alto': 'Palo Alto',
  'panorama-interrogation': 'Panorama',
  'physical-server': 'Physical Server',
  'printer': 'Printers',
  'scheduled-task': 'Scheduled Tasks',
  'security': 'Security Infrastructure',
  'sql-server': 'SQL Server',
  'storage-array': 'Storage Array',
  'virtualization': 'Virtualization',
  'vmware': 'VMware',
  'web-server': 'Web Server',
};

/**
 * Get the discovered route for a discovery module.
 * Falls back to a generated path if not explicitly mapped.
 *
 * @param moduleId - The discovery module ID (e.g., 'azure-resource')
 * @returns The discovered view route (e.g., '/discovered/azureresource')
 */
export function getDiscoveredRoute(moduleId: string): string {
  return discoveryToDiscoveredRoutes[moduleId] || `/discovered/${moduleId.replace(/-/g, '')}`;
}

/**
 * Get the display label for a discovery module.
 * Falls back to a formatted version of the moduleId if not explicitly mapped.
 *
 * @param moduleId - The discovery module ID (e.g., 'azure-resource')
 * @returns Human-readable label (e.g., 'Azure Resource')
 */
export function getModuleLabel(moduleId: string): string {
  if (discoveryModuleLabels[moduleId]) {
    return discoveryModuleLabels[moduleId];
  }
  // Fallback: convert 'azure-resource' to 'Azure Resource'
  return moduleId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get the "View Data" button label for a discovery module.
 *
 * @param moduleId - The discovery module ID
 * @returns Button label (e.g., 'View Azure Resource Data')
 */
export function getViewDataLabel(moduleId: string): string {
  return `View ${getModuleLabel(moduleId)} Data`;
}
