/**
 * useOrganisationMapLogic Hook
 *
 * Enhanced LeanIX-style Enterprise Architecture data aggregation.
 * Reads all CSV files from discovery modules and constructs Sankey diagram data
 * with comprehensive entity mapping, intelligent relationship inference,
 * and cross-file linking.
 *
 * Phase 1-3: Enhanced Entity Mapping, Relationships, Cross-file Linking
 * Phase 8: Performance Optimizations
 *   - Memoized expensive computations
 *   - Batch processing for large datasets
 *   - Efficient caching with Map structures
 *   - Optimized deduplication algorithms
 *   - Processing time tracking
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  SankeyNode,
  SankeyLink,
  EntityType,
  FactSheetData,
  OrganisationMapData,
  FilterState
} from '../types/models/organisation';

// Performance constants - CRITICAL for handling large datasets
const BATCH_SIZE = 100; // Process nodes in batches to avoid blocking
const MAX_LINKS_PER_NODE = 20; // Limit links per node to prevent performance issues
const MAX_NODES = 5000; // Maximum nodes to render (prevent browser crash with 9000+ objects)
const MAX_LINKS = 10000; // Maximum links to render
const CACHE_VERSION = 'v2'; // Bump to invalidate cache

/**
 * Case-insensitive property getter for CSV records
 * Handles PascalCase, camelCase, and lowercase variations
 */
const getRecordProp = (record: any, propName: string): any => {
  if (!record || !propName) return undefined;

  // Try exact match first
  if (record[propName] !== undefined) return record[propName];

  // Try camelCase version
  const camelCase = propName.charAt(0).toLowerCase() + propName.slice(1);
  if (record[camelCase] !== undefined) return record[camelCase];

  // Try PascalCase version
  const pascalCase = propName.charAt(0).toUpperCase() + propName.slice(1);
  if (record[pascalCase] !== undefined) return record[pascalCase];

  // Try lowercase
  const lowerCase = propName.toLowerCase();
  if (record[lowerCase] !== undefined) return record[lowerCase];

  // Try case-insensitive search as last resort
  const lowerProp = propName.toLowerCase();
  for (const key of Object.keys(record)) {
    if (key.toLowerCase() === lowerProp) {
      return record[key];
    }
  }

  return undefined;
};

interface UseOrganisationMapLogicReturn {
  data: OrganisationMapData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  stats: {
    totalNodes: number;
    totalLinks: number;
    nodesByType: Record<EntityType, number>;
    processingTimeMs: number;
  } | null;
}

/**
 * Comprehensive LeanIX-style mapping for all discovered CSV file types
 * Maps 116+ CSV file types to appropriate EntityType with proper naming extraction
 *
 * Priority determines Sankey layer positioning:
 * 1 = Infrastructure (leftmost)
 * 2 = IT Components & Applications
 * 3 = Platforms & Services
 * 4 = Business Capabilities (rightmost)
 */
const typeMapping: Record<string, {
  type: EntityType;
  getName: (r: any) => string | null;
  priority: number;
  category: string;
}> = {
  // ===== INFRASTRUCTURE LAYER (Priority 1 - Leftmost) =====
  'infrastructure': {
    type: 'datacenter',
    getName: (r) => r.Name || r.DisplayName || r.Location,
    priority: 1,
    category: 'Infrastructure'
  },
  'azureinfrastructure': {
    type: 'datacenter',
    getName: (r) => r.Name || r.DisplayName || r.Location || r.Region,
    priority: 1,
    category: 'Infrastructure'
  },
  'infrastructurediscovery_subnet': {
    type: 'datacenter',
    getName: (r) => r.Name || r.SubnetName || r.AddressPrefix,
    priority: 1,
    category: 'Infrastructure'
  },
  'physicalserverdiscovery': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name || r.ServerName,
    priority: 1,
    category: 'Infrastructure'
  },
  'physicalserver_bios': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name,
    priority: 1,
    category: 'Infrastructure'
  },
  'physicalserver_hardware': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name || r.Manufacturer,
    priority: 1,
    category: 'Infrastructure'
  },
  'physicalserver_networkhardware': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name || r.AdapterName,
    priority: 1,
    category: 'Infrastructure'
  },
  'physicalserver_storage': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name || r.DriveLetter,
    priority: 1,
    category: 'Infrastructure'
  },
  'fileservers': {
    type: 'it-component',
    getName: (r) => r.ServerName || r.Name || r.ComputerName,
    priority: 1,
    category: 'Infrastructure'
  },
  'filesystemservers': {
    type: 'it-component',
    getName: (r) => r.ServerName || r.Name || r.ComputerName,
    priority: 1,
    category: 'Infrastructure'
  },
  'testinfrastructure': {
    type: 'it-component',
    getName: (r) => r.Name || r.ComputerName || r.IPAddress,
    priority: 1,
    category: 'Infrastructure'
  },

  // ===== IT COMPONENTS LAYER (Priority 2) =====
  // Databases & SQL
  'databases': {
    type: 'it-component',
    getName: (r) => r.DatabaseName || r.Name || r.InstanceName,
    priority: 2,
    category: 'Database'
  },
  'sqlinventory': {
    type: 'it-component',
    getName: (r) => r.ServerName || r.InstanceName || r.DatabaseName,
    priority: 2,
    category: 'Database'
  },

  // Storage
  'storage_localstorage': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.DriveLetter || r.Name,
    priority: 2,
    category: 'Storage'
  },
  'storage_storagespaces': {
    type: 'it-component',
    getName: (r) => r.Name || r.FriendlyName,
    priority: 2,
    category: 'Storage'
  },
  'storage_storagesummary': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name,
    priority: 2,
    category: 'Storage'
  },
  'azureresourcediscovery_storageaccounts': {
    type: 'it-component',
    getName: (r) => r.Name || r.StorageAccountName,
    priority: 2,
    category: 'Storage'
  },

  // Network Infrastructure
  'network_dnsservers': {
    type: 'it-component',
    getName: (r) => r.Name || r.ServerName || r.IPAddress,
    priority: 2,
    category: 'Network'
  },
  'networkinfrastructure_arpentry': {
    type: 'it-component',
    getName: (r) => r.IPAddress || r.MACAddress || r.Name,
    priority: 2,
    category: 'Network'
  },
  'networkinfrastructure_dhcpserver': {
    type: 'it-component',
    getName: (r) => r.ServerName || r.Name || r.IPAddress,
    priority: 2,
    category: 'Network'
  },
  'networkinfrastructure_dnsinfrastructure': {
    type: 'it-component',
    getName: (r) => r.Name || r.ZoneName || r.ServerName,
    priority: 2,
    category: 'Network'
  },
  'networkinfrastructure_firewallrule': {
    type: 'it-component',
    getName: (r) => r.Name || r.DisplayName || r.RuleName,
    priority: 2,
    category: 'Network'
  },
  'networkinfrastructure_networkadapter': {
    type: 'it-component',
    getName: (r) => r.Name || r.InterfaceAlias || r.Description,
    priority: 2,
    category: 'Network'
  },
  'networkinfrastructure_networkroute': {
    type: 'it-component',
    getName: (r) => r.DestinationPrefix || r.Name || r.NextHop,
    priority: 2,
    category: 'Network'
  },
  'networkinfrastructure_networkshare': {
    type: 'it-component',
    getName: (r) => r.Name || r.ShareName || r.Path,
    priority: 2,
    category: 'Network'
  },
  'dnsdhcpdiscovery': {
    type: 'it-component',
    getName: (r) => r.Name || r.ServerName || r.IPAddress,
    priority: 2,
    category: 'Network'
  },
  'azureresourcediscovery_virtualnetworks': {
    type: 'it-component',
    getName: (r) => r.Name || r.VirtualNetworkName,
    priority: 2,
    category: 'Network'
  },

  // Azure Resources
  'azureresourcediscovery': {
    type: 'it-component',
    getName: (r) => r.Name || r.ResourceName || r.DisplayName,
    priority: 2,
    category: 'Azure Resource'
  },
  'azureresourcediscovery_keyvaults': {
    type: 'it-component',
    getName: (r) => r.Name || r.VaultName,
    priority: 2,
    category: 'Azure Resource'
  },

  // AzureHound-inspired Azure Resources (Phase 1)
  'azurevmssdiscovery': {
    type: 'it-component',
    getName: (r) => r.Name || r.ScaleSetName || r.DisplayName,
    priority: 2,
    category: 'Azure VM Scale Set'
  },
  'azurefunctionsdiscovery': {
    type: 'application',
    getName: (r) => r.Name || r.FunctionAppName || r.DisplayName,
    priority: 2,
    category: 'Azure Function App'
  },
  'azureacrdiscovery': {
    type: 'it-component',
    getName: (r) => r.Name || r.RegistryName || r.LoginServer,
    priority: 2,
    category: 'Azure Container Registry'
  },

  // AzureHound-inspired Azure Resources (Phase 2)
  'azureautomationdiscovery': {
    type: 'application',
    getName: (r) => r.Name || r.AutomationAccountName || r.DisplayName,
    priority: 2,
    category: 'Azure Automation'
  },
  'azureresourcediscovery_automationaccounts': {
    type: 'application',
    getName: (r) => r.Name || r.AutomationAccountName,
    priority: 2,
    category: 'Azure Automation'
  },
  'azurelogicappsdiscovery': {
    type: 'application',
    getName: (r) => r.Name || r.LogicAppName || r.DisplayName,
    priority: 2,
    category: 'Azure Logic App'
  },
  'azureresourcediscovery_logicapps': {
    type: 'application',
    getName: (r) => r.Name || r.LogicAppName,
    priority: 2,
    category: 'Azure Logic App'
  },

  // AzureHound-inspired Azure Security (Phase 3)
  'azuremanagementgroupsdiscovery': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name || r.ManagementGroupName,
    priority: 3,
    category: 'Azure Management Group'
  },
  'azuresecuritydiscovery_managementgroups': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name || r.ManagementGroupName,
    priority: 3,
    category: 'Azure Management Group'
  },
  'azurepimdiscovery': {
    type: 'platform',
    getName: (r) => r.PrincipalDisplayName || r.RoleDisplayName || r.DisplayName || r.Name,
    priority: 3,
    category: 'Azure PIM Role'
  },
  'azuresecuritydiscovery_pimeligibleroles': {
    type: 'platform',
    getName: (r) => r.PrincipalDisplayName || r.RoleDisplayName || r.DisplayName || r.Name,
    priority: 3,
    category: 'Azure PIM Role'
  },
  'azuresubscriptionownersdiscovery': {
    type: 'platform',
    getName: (r) => r.PrincipalDisplayName || r.DisplayName || r.Name,
    priority: 3,
    category: 'Azure Subscription Owner'
  },
  'azuresecuritydiscovery_subscriptionowners': {
    type: 'platform',
    getName: (r) => r.PrincipalDisplayName || r.DisplayName || r.Name,
    priority: 3,
    category: 'Azure Subscription Owner'
  },

  // AzureHound-inspired Azure Security (Phase 4)
  'azurekeyvaultaccessdiscovery': {
    type: 'platform',
    getName: (r) => r.KeyVaultName || r.PrincipalName || r.DisplayName,
    priority: 3,
    category: 'Azure Key Vault Access'
  },
  'azuresecuritydiscovery_keyvaultaccesspolicies': {
    type: 'platform',
    getName: (r) => r.KeyVaultName || r.PrincipalName || r.DisplayName,
    priority: 3,
    category: 'Azure Key Vault Access'
  },
  'azuremanagedidentitiesdiscovery': {
    type: 'platform',
    getName: (r) => r.Name || r.DisplayName || r.PrincipalId,
    priority: 3,
    category: 'Azure Managed Identity'
  },
  'azuresecuritydiscovery_managedidentities': {
    type: 'platform',
    getName: (r) => r.Name || r.DisplayName || r.PrincipalId,
    priority: 3,
    category: 'Azure Managed Identity'
  },
  'azuresecuritydiscovery_serviceprincipalcredentials': {
    type: 'platform',
    getName: (r) => r.AppName || r.DisplayName || r.AppId,
    priority: 3,
    category: 'Azure Service Principal'
  },
  'azuresecuritydiscovery_storageaccountaccess': {
    type: 'it-component',
    getName: (r) => r.Name || r.StorageAccountName,
    priority: 2,
    category: 'Azure Storage'
  },

  // Certificates
  'ca_certificates': {
    type: 'it-component',
    getName: (r) => r.Subject || r.Name || r.Thumbprint,
    priority: 2,
    category: 'Certificate'
  },
  'certificate_certificateauthority': {
    type: 'it-component',
    getName: (r) => r.Name || r.CAName || r.Subject,
    priority: 2,
    category: 'Certificate'
  },
  'certificate_localcertificate': {
    type: 'it-component',
    getName: (r) => r.Subject || r.Name || r.FriendlyName,
    priority: 2,
    category: 'Certificate'
  },
  'certificateauthoritydiscovery': {
    type: 'it-component',
    getName: (r) => r.Name || r.CAName,
    priority: 2,
    category: 'Certificate'
  },

  // Backup & Recovery - Treat backup systems as applications for better visibility
  'backup_backupassessment': {
    type: 'application',
    getName: (r) => r.BackupSoftware || r.BackupType || r.ComputerName || r.Name,
    priority: 2,
    category: 'Backup System'
  },
  'backup_systemrecovery': {
    type: 'application',
    getName: (r) => r.RecoveryType || r.ComputerName || r.Name,
    priority: 2,
    category: 'Backup System'
  },
  'backup_vss': {
    type: 'application',
    getName: (r) => r.ComputerName || r.Name || r.VolumeName,
    priority: 2,
    category: 'Backup System'
  },
  'backuprecoverydiscovery': {
    type: 'application',
    getName: (r) => r.BackupProduct || r.SoftwareName || r.Name || r.ComputerName,
    priority: 2,
    category: 'Backup System'
  },
  'backup_backupsoftware': {
    type: 'application',
    getName: (r) => r.ProductName || r.SoftwareName || r.Name || r.DisplayName,
    priority: 2,
    category: 'Backup System'
  },

  // Dependencies
  'dependency_configdependency': {
    type: 'it-component',
    getName: (r) => r.Name || r.ConfigFile || r.Path,
    priority: 2,
    category: 'Dependency'
  },
  'dependency_dependencyanalysis': {
    type: 'it-component',
    getName: (r) => r.Name || r.SourceName || r.DependencyName,
    priority: 2,
    category: 'Dependency'
  },
  'dependency_networkconnection': {
    type: 'it-component',
    getName: (r) => r.ProcessName || r.Name || r.LocalAddress,
    priority: 2,
    category: 'Dependency'
  },
  'dependency_processdependency': {
    type: 'it-component',
    getName: (r) => r.ProcessName || r.Name,
    priority: 2,
    category: 'Dependency'
  },
  'dependency_servicedependency': {
    type: 'it-component',
    getName: (r) => r.ServiceName || r.Name || r.DisplayName,
    priority: 2,
    category: 'Dependency'
  },

  // Scheduled Tasks
  'scheduledtask_scheduledtask': {
    type: 'it-component',
    getName: (r) => r.TaskName || r.Name || r.TaskPath,
    priority: 2,
    category: 'Scheduled Task'
  },
  'scheduledtask_taskaction': {
    type: 'it-component',
    getName: (r) => r.TaskName || r.Name || r.Execute,
    priority: 2,
    category: 'Scheduled Task'
  },
  'scheduledtask_tasksummary': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name,
    priority: 2,
    category: 'Scheduled Task'
  },
  'scheduledtask_tasktrigger': {
    type: 'it-component',
    getName: (r) => r.TaskName || r.Name,
    priority: 2,
    category: 'Scheduled Task'
  },

  // Environment Detection
  'environmentdetection_cloudenvironment': {
    type: 'it-component',
    getName: (r) => r.CloudProvider || r.Name || r.Environment,
    priority: 2,
    category: 'Environment'
  },
  'environmentdetection_domainenvironment': {
    type: 'it-component',
    getName: (r) => r.DomainName || r.Name || r.ComputerName,
    priority: 2,
    category: 'Environment'
  },
  'environmentdetection_hardware': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name || r.Model,
    priority: 2,
    category: 'Environment'
  },
  'environmentdetection_networkadapter': {
    type: 'it-component',
    getName: (r) => r.Name || r.InterfaceAlias || r.Description,
    priority: 2,
    category: 'Environment'
  },
  'environmentdetection_operatingsystem': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name || r.Caption,
    priority: 2,
    category: 'Environment'
  },
  'environmentdetection_securityenvironment': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name,
    priority: 2,
    category: 'Environment'
  },
  'environmentdetection_softwareenvironment': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name,
    priority: 2,
    category: 'Environment'
  },
  'environmentdetection_virtualizationenvironment': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name || r.VirtualizationType,
    priority: 2,
    category: 'Environment'
  },

  // File System
  'filesystemfileanalysis': {
    type: 'it-component',
    getName: (r) => r.Path || r.Name || r.FileName,
    priority: 2,
    category: 'File System'
  },
  'filesystemlargefiles': {
    type: 'it-component',
    getName: (r) => r.FullPath || r.Name || r.FileName,
    priority: 2,
    category: 'File System'
  },
  'filesystempermissions': {
    type: 'it-component',
    getName: (r) => r.Path || r.Name || r.FolderPath,
    priority: 2,
    category: 'File System'
  },
  'filesystemshares': {
    type: 'it-component',
    getName: (r) => r.ShareName || r.Name || r.Path,
    priority: 2,
    category: 'File System'
  },

  // Data Classification
  'dataclassification_classificationsummary': {
    type: 'it-component',
    getName: (r) => r.ComputerName || r.Name,
    priority: 2,
    category: 'Data Classification'
  },
  'dataclassification_localdriveclassification': {
    type: 'it-component',
    getName: (r) => r.Path || r.Name || r.ClassificationType,
    priority: 2,
    category: 'Data Classification'
  },

  // ===== APPLICATIONS LAYER (Priority 2 - User-facing apps) =====
  'applications': {
    type: 'application',
    getName: (r) => r.ApplicationName || r.Name || r.DisplayName,
    priority: 2,
    category: 'Application'
  },
  'applicationcatalog': {
    type: 'application',
    getName: (r) => r.Name || r.DisplayName || r.ApplicationName,
    priority: 2,
    category: 'Application'
  },
  'softwareinventory': {
    type: 'application',
    getName: (r) => r.Name || r.DisplayName || r.ProductName,
    priority: 2,
    category: 'Application'
  },
  'azurediscovery_applications': {
    type: 'application',
    getName: (r) => r.DisplayName || r.AppId || r.Name,
    priority: 2,
    category: 'Application'
  },
  'azureresourcediscovery_webapps': {
    type: 'application',
    getName: (r) => r.Name || r.WebAppName || r.DisplayName,
    priority: 2,
    category: 'Application'
  },
  'webserver_webframework': {
    type: 'application',
    getName: (r) => r.Name || r.SiteName || r.ApplicationPool,
    priority: 2,
    category: 'Application'
  },

  // EntraID Applications
  'entraidappregistrations': {
    type: 'application',
    getName: (r) => r.DisplayName || r.AppId || r.ObjectId,
    priority: 2,
    category: 'EntraID App'
  },
  'entraidenterpriseapps': {
    type: 'application',
    getName: (r) => r.DisplayName || r.AppId || r.ObjectId,
    priority: 2,
    category: 'EntraID App'
  },
  'azurediscovery_applicationsecrets': {
    type: 'it-component',
    getName: (r) => r.DisplayName || r.AppId || r.SecretId,
    priority: 2,
    category: 'EntraID App'
  },
  'entraidapplicationsecrets': {
    type: 'it-component',
    getName: (r) => r.DisplayName || r.AppId || r.SecretId,
    priority: 2,
    category: 'EntraID App'
  },

  // Exchange & Mailboxes
  'exchangediscovery': {
    type: 'application',
    getName: (r) => r.Name || r.Identity || r.DisplayName,
    priority: 2,
    category: 'Exchange'
  },
  'exchangemailboxes': {
    type: 'application',
    getName: (r) => r.DisplayName || r.PrimarySmtpAddress || r.UserPrincipalName,
    priority: 2,
    category: 'Exchange'
  },
  'exchangeaccepteddomains': {
    type: 'platform',
    getName: (r) => r.DomainName || r.Name,
    priority: 3,
    category: 'Exchange'
  },
  'exchangedistributiongroups': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name || r.PrimarySmtpAddress,
    priority: 3,
    category: 'Exchange'
  },
  'exchangemailcontacts': {
    type: 'application',
    getName: (r) => r.DisplayName || r.Name || r.ExternalEmailAddress,
    priority: 2,
    category: 'Exchange'
  },
  'exchangeoauthpermissions': {
    type: 'platform',
    getName: (r) => r.AppId || r.Name || r.ResourceAppId,
    priority: 3,
    category: 'Exchange'
  },
  'exchangeorganizationconfig': {
    type: 'platform',
    getName: (r) => r.Name || r.DisplayName || r.OrganizationName,
    priority: 3,
    category: 'Exchange'
  },

  // SharePoint
  'sharepointsites': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name || r.WebUrl,
    priority: 3,
    category: 'SharePoint'
  },
  'sharepointlists': {
    type: 'application',
    getName: (r) => r.Title || r.Name || r.ListName,
    priority: 2,
    category: 'SharePoint'
  },
  'azurediscovery_sharepointsites': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name || r.WebUrl,
    priority: 3,
    category: 'SharePoint'
  },

  // OneDrive
  'onedrivediscovery': {
    type: 'application',
    getName: (r) => r.OwnerDisplayName || r.Name || r.DriveType,
    priority: 2,
    category: 'OneDrive'
  },
  'onedrivestatistics': {
    type: 'application',
    getName: (r) => r.OwnerDisplayName || r.Name,
    priority: 2,
    category: 'OneDrive'
  },

  // Power Platform
  'powerplatformdiscovery': {
    type: 'application',
    getName: (r) => r.Name || r.DisplayName,
    priority: 2,
    category: 'Power Platform'
  },
  'powerplatform_environments': {
    type: 'platform',
    getName: (r) => r.Name || r.DisplayName || r.EnvironmentName,
    priority: 3,
    category: 'Power Platform'
  },
  'powerbidiscovery': {
    type: 'application',
    getName: (r) => r.Name || r.DisplayName || r.WorkspaceName,
    priority: 2,
    category: 'Power BI'
  },
  'powerbistatistics': {
    type: 'application',
    getName: (r) => r.Name || r.WorkspaceName,
    priority: 2,
    category: 'Power BI'
  },

  // Teams
  'azurediscovery_microsoftteams': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name || r.TeamName,
    priority: 3,
    category: 'Microsoft Teams'
  },

  // Users (mapped to application for visualization as people/resources)
  'users': {
    type: 'application',
    getName: (r) => r.DisplayName || r.UserPrincipalName || r.SamAccountName || r.Name,
    priority: 2,
    category: 'User'
  },
  'azurediscovery_users': {
    type: 'application',
    getName: (r) => r.DisplayName || r.UserPrincipalName || r.Name,
    priority: 2,
    category: 'User'
  },
  'azureusers': {
    type: 'application',
    getName: (r) => r.DisplayName || r.UserPrincipalName || r.Name,
    priority: 2,
    category: 'User'
  },

  // ===== PLATFORM LAYER (Priority 3) =====
  // Groups
  'groups': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name || r.GroupName,
    priority: 3,
    category: 'Group'
  },
  'azurediscovery_groups': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name || r.GroupName,
    priority: 3,
    category: 'Group'
  },
  'azuregroups': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name || r.GroupName,
    priority: 3,
    category: 'Group'
  },

  // Subscriptions & Tenants
  'azureresourcediscovery_subscriptions': {
    type: 'platform',
    getName: (r) => r.SubscriptionName || r.Name || r.DisplayName,
    priority: 3,
    category: 'Subscription'
  },
  'azurediscovery_tenant': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name || r.TenantName,
    priority: 3,
    category: 'Tenant'
  },
  'azureresourcediscovery_resourcegroups': {
    type: 'platform',
    getName: (r) => r.Name || r.ResourceGroupName,
    priority: 3,
    category: 'Resource Group'
  },

  // Directory Roles & Service Principals
  'azurediscovery_directoryroles': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.RoleName || r.Name,
    priority: 3,
    category: 'Directory Role'
  },
  'azurediscovery_serviceprincipals': {
    type: 'application',
    getName: (r) => r.DisplayName || r.AppId || r.Name,
    priority: 2,
    category: 'Service Principal'
  },
  'entraidserviceprincipals': {
    type: 'application',
    getName: (r) => r.DisplayName || r.AppId || r.Name,
    priority: 2,
    category: 'Service Principal'
  },

  // Security & Compliance
  'azureresourcediscovery_networksecuritygroups': {
    type: 'platform',
    getName: (r) => r.Name || r.NetworkSecurityGroupName,
    priority: 3,
    category: 'Security'
  },
  'conditionalaccessdiscovery': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name || r.PolicyName,
    priority: 3,
    category: 'Security'
  },
  'conditionalaccessstatistics': {
    type: 'platform',
    getName: (r) => r.Name || r.PolicyName,
    priority: 3,
    category: 'Security'
  },
  'dlpdiscovery': {
    type: 'platform',
    getName: (r) => r.Name || r.PolicyName || r.DisplayName,
    priority: 3,
    category: 'Security'
  },
  'dlpstatistics': {
    type: 'platform',
    getName: (r) => r.Name || r.PolicyName,
    priority: 3,
    category: 'Security'
  },
  'security_antivirusproducts': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name || r.ProductName,
    priority: 3,
    category: 'Security'
  },
  'security_firewallprofiles': {
    type: 'platform',
    getName: (r) => r.Name || r.ProfileName,
    priority: 3,
    category: 'Security'
  },
  'security_securityservices': {
    type: 'platform',
    getName: (r) => r.Name || r.ServiceName || r.DisplayName,
    priority: 3,
    category: 'Security'
  },
  'security_securitysoftware': {
    type: 'platform',
    getName: (r) => r.Name || r.DisplayName || r.ProductName,
    priority: 3,
    category: 'Security'
  },
  'security_vpnservices': {
    type: 'platform',
    getName: (r) => r.Name || r.ConnectionName || r.ServiceName,
    priority: 3,
    category: 'Security'
  },
  'securitydefaults': {
    type: 'platform',
    getName: (r) => r.Name || r.DisplayName || 'Security Defaults',
    priority: 3,
    category: 'Security'
  },
  'securityinfrastructurediscovery': {
    type: 'platform',
    getName: (r) => r.Name || r.ComputerName,
    priority: 3,
    category: 'Security'
  },

  // Policies
  'adpolicies': {
    type: 'platform',
    getName: (r) => r.Name || r.PolicyName || r.DisplayName,
    priority: 3,
    category: 'Policy'
  },
  'authenticationmethods': {
    type: 'platform',
    getName: (r) => r.Method || r.Name || r.DisplayName,
    priority: 3,
    category: 'Policy'
  },
  'grouppolicies': {
    type: 'platform',
    getName: (r) => r.Name || r.DisplayName || r.GPOName,
    priority: 3,
    category: 'Policy'
  },
  'gpo_placeholderdata': {
    type: 'platform',
    getName: (r) => r.Name || r.DisplayName,
    priority: 3,
    category: 'Policy'
  },

  // Licensing
  'licensingdiscoverylicensingsubscriptions': {
    type: 'platform',
    getName: (r) => r.SkuPartNumber || r.Name || r.DisplayName,
    priority: 3,
    category: 'Licensing'
  },
  'licensingsubscriptions': {
    type: 'platform',
    getName: (r) => r.SkuPartNumber || r.Name || r.DisplayName,
    priority: 3,
    category: 'Licensing'
  },
  // User License Assignments - links users to their assigned licenses
  'licensingdiscoveryuserassignment': {
    type: 'platform',
    getName: (r) => `${r.DisplayName || r.UserPrincipalName} - ${r.SkuPartNumber || r.SkuId}`,
    priority: 3,
    category: 'License Assignment'
  },
  'userassignment': {
    type: 'platform',
    getName: (r) => `${r.DisplayName || r.UserPrincipalName} - ${r.SkuPartNumber || r.SkuId}`,
    priority: 3,
    category: 'License Assignment'
  },

  // Subscription Owners
  'subscriptionowners': {
    type: 'platform',
    getName: (r) => r.PrincipalName || r.PrincipalEmail || 'Unknown Owner',
    priority: 2,
    category: 'Subscription Owner'
  },
  'azuresubscriptionownersdiscovery_subscriptionowners': {
    type: 'platform',
    getName: (r) => r.PrincipalName || r.PrincipalEmail || 'Unknown Owner',
    priority: 2,
    category: 'Subscription Owner'
  },

  // Directory Role Assignments (enhanced)
  'directoryroles': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name,
    priority: 3,
    category: 'Directory Role'
  },
  'azuredirectoryroles': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name,
    priority: 3,
    category: 'Directory Role'
  },
  'azuredirectoryroles_directoryroles': {
    type: 'platform',
    getName: (r) => r.DisplayName || r.Name,
    priority: 3,
    category: 'Directory Role'
  },

  // ===== BUSINESS CAPABILITY LAYER (Priority 4 - Rightmost) =====
  // These are inferred from other data - departments, capabilities
  'department': {
    type: 'business-capability',
    getName: (r) => r.Department || r.Name,
    priority: 4,
    category: 'Business Capability'
  },
  'capability': {
    type: 'business-capability',
    getName: (r) => r.Name || r.CapabilityName,
    priority: 4,
    category: 'Business Capability'
  }
};

/**
 * Get file type key from filename (handles various naming patterns)
 */
function getFileTypeKey(filename: string): string {
  // Remove .csv extension and path
  const baseName = filename.replace(/\.csv$/i, '').split(/[/\\]/).pop() || '';
  // Convert to lowercase and replace common separators
  return baseName.toLowerCase().replace(/[-_\s]+/g, '_');
}

/**
 * Create lookup indices for fast node matching
 */
function createNodeIndices(nodes: SankeyNode[]): {
  byId: Map<string, SankeyNode>;
  byName: Map<string, SankeyNode[]>;
  byType: Map<EntityType, SankeyNode[]>;
  byUPN: Map<string, SankeyNode>;
  byAppId: Map<string, SankeyNode>;
} {
  const byId = new Map<string, SankeyNode>();
  const byName = new Map<string, SankeyNode[]>();
  const byType = new Map<EntityType, SankeyNode[]>();
  const byUPN = new Map<string, SankeyNode>();
  const byAppId = new Map<string, SankeyNode>();

  for (const node of nodes) {
    // Index by ID
    byId.set(node.id, node);

    // Index by name (lowercase for case-insensitive matching)
    const nameLower = node.name.toLowerCase();
    if (!byName.has(nameLower)) {
      byName.set(nameLower, []);
    }
    byName.get(nameLower)!.push(node);

    // Index by type
    if (!byType.has(node.type)) {
      byType.set(node.type, []);
    }
    byType.get(node.type)!.push(node);

    // Index by UserPrincipalName if present
    const upn = node.metadata?.record?.UserPrincipalName;
    if (upn) {
      byUPN.set(upn.toLowerCase(), node);
    }

    // Index by AppId if present
    const appId = node.metadata?.record?.AppId;
    if (appId) {
      byAppId.set(appId, node);
    }
  }

  return { byId, byName, byType, byUPN, byAppId };
}

/**
 * Main hook export
 */
export const useOrganisationMapLogic = (): UseOrganisationMapLogicReturn => {
  const [data, setData] = useState<OrganisationMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UseOrganisationMapLogicReturn['stats']>(null);

  // Cache for processed data with version
  const cacheRef = useRef<Map<string, SankeyNode[]>>(new Map());
  const cacheVersionRef = useRef<string>(CACHE_VERSION);

  const fetchData = useCallback(async () => {
    const startTime = performance.now();

    try {
      setLoading(true);
      setError(null);

      console.log('[useOrganisationMapLogic] Starting enhanced LeanIX-style data fetch...');

      // Get all CSV files from discovery data
      const csvFiles = await window.electronAPI.invoke('get-discovery-files');
      console.log('[useOrganisationMapLogic] Found CSV files:', csvFiles.length);

      // Process each CSV file
      const allNodes: SankeyNode[] = [];
      const allLinks: SankeyLink[] = [];
      const nodesBySource: Record<string, SankeyNode[]> = {};

      for (const file of csvFiles) {
        const fileTypeKey = getFileTypeKey(file.path);
        console.log('[useOrganisationMapLogic] Processing file:', file.path, 'Key:', fileTypeKey);

        try {
          // Check cache first
          const cacheKey = `${file.path}_${file.modifiedDate || ''}`;
          let fileNodes = cacheRef.current.get(cacheKey);

          if (!fileNodes) {
            const content = await window.electronAPI.invoke('read-discovery-file', file.path);
            fileNodes = parseCSVToNodes(content, fileTypeKey, file.path);
            cacheRef.current.set(cacheKey, fileNodes);
          }

          const fileLinks = generateLinksForFile(fileNodes, fileTypeKey, allNodes);

          console.log('[useOrganisationMapLogic] File parsed:', {
            path: file.path,
            key: fileTypeKey,
            nodes: fileNodes.length,
            links: fileLinks.length
          });

          // Store nodes by source for cross-file linking
          nodesBySource[fileTypeKey] = fileNodes;

          allNodes.push(...fileNodes);
          allLinks.push(...fileLinks);
        } catch (fileError) {
          console.warn('[useOrganisationMapLogic] Failed to process file:', file.path, fileError);
        }
      }

      console.log('[useOrganisationMapLogic] Total before merge:', {
        nodes: allNodes.length,
        links: allLinks.length
      });

      // Merge duplicate nodes and links
      const mergedData = mergeDuplicateEntities(allNodes, allLinks);

      // Create optimized indices for fast lookups
      const indices = createNodeIndices(mergedData.nodes);
      console.log('[useOrganisationMapLogic] Created indices:', {
        byId: indices.byId.size,
        byName: indices.byName.size,
        byType: indices.byType.size,
        byUPN: indices.byUPN.size,
        byAppId: indices.byAppId.size
      });

      // Generate cross-file relationships using optimized indices
      const crossFileLinks = generateCrossFileLinksOptimized(mergedData.nodes, nodesBySource, indices);

      // REMOVED: Auto-generated business capabilities (inferred data, not from discovery)
      // Only use real nodes from actual CSV discovery files

      // Apply performance limits to prevent rendering 9000+ objects
      let finalNodes = mergedData.nodes;
      let finalLinks = [...mergedData.links, ...crossFileLinks];

      // Limit total nodes to MAX_NODES
      if (finalNodes.length > MAX_NODES) {
        console.warn(`[useOrganisationMapLogic] Limiting nodes from ${finalNodes.length} to ${MAX_NODES} for performance`);
        // Prioritize nodes with more connections
        finalNodes = finalNodes
          .map(node => {
            const linkCount = finalLinks.filter(l =>
              (typeof l.source === 'string' ? l.source : l.source.id) === node.id ||
              (typeof l.target === 'string' ? l.target : l.target.id) === node.id
            ).length;
            return { node, linkCount };
          })
          .sort((a, b) => b.linkCount - a.linkCount)
          .slice(0, MAX_NODES)
          .map(item => item.node);

        // Filter links to only include those between remaining nodes
        const nodeIds = new Set(finalNodes.map(n => n.id));
        finalLinks = finalLinks.filter(l => {
          const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
          const targetId = typeof l.target === 'string' ? l.target : l.target.id;
          return nodeIds.has(sourceId) && nodeIds.has(targetId);
        });
      }

      // Remove duplicate links after all linking
      let uniqueFinalLinks = removeDuplicateLinks(finalLinks);

      // Enforce MAX_LINKS_PER_NODE to prevent cluttered visualization
      uniqueFinalLinks = enforceLinkLimits(uniqueFinalLinks, MAX_LINKS_PER_NODE);

      // Limit total links to MAX_LINKS
      if (uniqueFinalLinks.length > MAX_LINKS) {
        console.warn(`[useOrganisationMapLogic] Limiting links from ${uniqueFinalLinks.length} to ${MAX_LINKS} for performance`);
        // Prioritize certain link types
        const priorityOrder: Record<string, number> = {
          'ownership': 1,
          'deployment': 2,
          'provides': 3,
          'consumes': 4,
          'dependency': 5,
          'realizes': 6
        };
        uniqueFinalLinks = uniqueFinalLinks
          .sort((a, b) => (priorityOrder[a.type] || 99) - (priorityOrder[b.type] || 99))
          .slice(0, MAX_LINKS);
      }

      const finalData: OrganisationMapData = {
        nodes: finalNodes,
        links: uniqueFinalLinks
      };

      const processingTime = performance.now() - startTime;

      console.log('[useOrganisationMapLogic] Final result:', {
        nodes: finalData.nodes.length,
        links: finalData.links.length,
        crossFileLinks: crossFileLinks.length,
        removedInferredCapabilities: 'Removed - only using real discovery data',
        processingTimeMs: processingTime.toFixed(2),
        limits: { MAX_NODES, MAX_LINKS, MAX_LINKS_PER_NODE }
      });

      // Calculate stats by type
      const nodesByType = finalData.nodes.reduce((acc, node) => {
        acc[node.type] = (acc[node.type] || 0) + 1;
        return acc;
      }, {} as Record<EntityType, number>);

      setStats({
        totalNodes: finalData.nodes.length,
        totalLinks: finalData.links.length,
        nodesByType,
        processingTimeMs: processingTime
      });

      setData(finalData);
    } catch (err) {
      console.error('[useOrganisationMapLogic] Error fetching organisation map data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    // Clear cache on manual refetch
    cacheRef.current.clear();
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch, stats };
};

/**
 * Parse CSV content to SankeyNode array with enhanced field detection
 */
function parseCSVToNodes(csvContent: string, fileTypeKey: string, filePath: string): SankeyNode[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Enhanced CSV parsing to handle quoted fields with commas
  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    return values;
  };

  // Helper to clean PowerShell serialization artifacts
  const cleanPSValue = (value: string): string => {
    if (!value) return value;
    // Handle "System.Collections.Hashtable+KeyCollection" and similar
    if (value.includes('System.Collections') || value.includes('Hashtable+KeyCollection')) {
      return ''; // These are PS artifacts, not real values
    }
    // Clean other common artifacts
    return value.replace(/^\[object Object\]$/, '').trim();
  };

  const headers = parseCSVLine(lines[0]);
  const nodes: SankeyNode[] = [];

  // Find the best matching type mapping
  const mapping = findBestMapping(fileTypeKey, filePath);

  if (!mapping) {
    console.log('[parseCSVToNodes] No mapping found for:', fileTypeKey);
    return [];
  }

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length / 2) continue; // Skip malformed rows

    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      // Clean PowerShell serialization artifacts from values
      record[header] = cleanPSValue(values[idx] || '');
    });

    const node = createNodeFromRecord(record, mapping, fileTypeKey, i);
    if (node) {
      nodes.push(node);
    }
  }

  return nodes;
}

/**
 * Find the best type mapping for a file
 */
function findBestMapping(fileTypeKey: string, filePath: string): typeof typeMapping[string] | null {
  // Direct match
  if (typeMapping[fileTypeKey]) {
    return typeMapping[fileTypeKey];
  }

  // Try partial matches (for files like "AzureDiscovery_Users" -> "azurediscovery_users")
  const normalizedKey = fileTypeKey.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [key, mapping] of Object.entries(typeMapping)) {
    const normalizedMappingKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedKey.includes(normalizedMappingKey) || normalizedMappingKey.includes(normalizedKey)) {
      return mapping;
    }
  }

  // Fallback based on common patterns in filename
  const lowerPath = filePath.toLowerCase();

  if (lowerPath.includes('user')) {
    return typeMapping['users'];
  } else if (lowerPath.includes('group')) {
    return typeMapping['groups'];
  } else if (lowerPath.includes('application') || lowerPath.includes('app')) {
    return typeMapping['applications'];
  } else if (lowerPath.includes('server') || lowerPath.includes('infrastructure')) {
    return typeMapping['infrastructure'];
  } else if (lowerPath.includes('security')) {
    return typeMapping['securityinfrastructurediscovery'];
  } else if (lowerPath.includes('network')) {
    return typeMapping['networkinfrastructure_networkadapter'];
  } else if (lowerPath.includes('storage')) {
    return typeMapping['storage_localstorage'];
  } else if (lowerPath.includes('certificate')) {
    return typeMapping['ca_certificates'];
  } else if (lowerPath.includes('policy') || lowerPath.includes('gpo')) {
    return typeMapping['grouppolicies'];
  }

  // Default fallback - treat as IT component
  return {
    type: 'it-component',
    getName: (r) => r.Name || r.DisplayName || r.ComputerName || r.Id,
    priority: 2,
    category: 'Unknown'
  };
}

/**
 * Create SankeyNode from CSV record with enhanced metadata
 */
function createNodeFromRecord(
  record: Record<string, string>,
  mapping: typeof typeMapping[string],
  fileTypeKey: string,
  index: number
): SankeyNode | null {
  const name = mapping.getName(record);
  if (!name || name.trim() === '') {
    return null;
  }

  const cleanName = name.trim();
  const nodeType = mapping.type;

  // Create stable ID based on type, name, and source
  const uniqueId = `${nodeType}-${cleanName.replace(/[^a-zA-Z0-9]/g, '_')}-${fileTypeKey}`;

  return {
    id: uniqueId,
    name: cleanName,
    type: nodeType,
    factSheet: createFactSheet(record, nodeType, mapping.category),
    metadata: {
      source: fileTypeKey,
      record,
      priority: mapping.priority,
      category: mapping.category
    }
  };
}

/**
 * Create FactSheet from CSV record with enhanced metadata extraction
 */
function createFactSheet(
  record: Record<string, string>,
  type: EntityType,
  category: string
): FactSheetData {
  // Extract owner from various possible fields
  const owner = record.Owner ||
                record.OwnerDisplayName ||
                record.ManagerDisplayName ||
                record.CreatedBy ||
                record.AssignedTo ||
                '';

  // Extract description from various fields
  const description = record.Description ||
                      record.Notes ||
                      record.Comment ||
                      record.Summary ||
                      '';

  // Determine status
  let status: 'active' | 'plan' | 'phase-in' | 'phase-out' | 'end-of-life' = 'active';
  const recordStatus = (record.Status || record.State || record.AccountEnabled || '').toLowerCase();

  if (recordStatus === 'false' || recordStatus === 'disabled' || recordStatus === 'inactive') {
    status = 'end-of-life';
  } else if (recordStatus === 'pending' || recordStatus === 'planned') {
    status = 'plan';
  }

  // Extract tags
  const tags: string[] = [];
  if (record.Tags) {
    tags.push(...record.Tags.split(/[;,]/).map(t => t.trim()).filter(Boolean));
  }
  if (category) {
    tags.push(category);
  }

  return {
    baseInfo: {
      name: record.Name || record.DisplayName || record.ApplicationName || 'Unknown',
      type,
      description,
      owner,
      status,
      tags
    },
    relations: {
      incoming: [],
      outgoing: []
    },
    itComponents: [],
    subscriptions: [],
    comments: [],
    todos: [],
    resources: [],
    metrics: [],
    surveys: [],
    lastUpdate: new Date(record.LastModified || record.CreatedDateTime || record.ModifiedDateTime || Date.now())
  };
}

/**
 * Generate links between nodes based on hierarchical relationships
 * Enhanced with comprehensive relationship detection
 */
function generateLinksForFile(
  nodes: SankeyNode[],
  fileTypeKey: string,
  allExistingNodes: SankeyNode[]
): SankeyLink[] {
  const links: SankeyLink[] = [];
  const allNodes = [...allExistingNodes, ...nodes];

  nodes.forEach(node => {
    const record = node.metadata.record;

    // User to Group relationships (GroupMemberships field)
    if (fileTypeKey.includes('user') && record.GroupMemberships) {
      const groups = record.GroupMemberships.split(';').map((g: string) => g.trim()).filter(Boolean);
      groups.forEach((groupName: string) => {
        const groupNode = allNodes.find(n =>
          n.type === 'platform' &&
          (n.name === groupName || n.name.toLowerCase() === groupName.toLowerCase())
        );
        if (groupNode) {
          links.push({
            source: groupNode.id,
            target: node.id,
            value: 1,
            type: 'ownership'
          });
        }
      });
    }

    // Application to Server (ComputerName field)
    if ((fileTypeKey.includes('application') || fileTypeKey.includes('software')) && record.ComputerName) {
      const serverNode = allNodes.find(n =>
        n.type === 'it-component' &&
        (n.name === record.ComputerName || n.metadata?.record?.ComputerName === record.ComputerName)
      );
      if (serverNode) {
        links.push({
          source: serverNode.id,
          target: node.id,
          value: 1,
          type: 'deployment'
        });
      }
    }

    // Mailbox to User (UserPrincipalName or PrimarySmtpAddress matching)
    if ((fileTypeKey.includes('mailbox') || fileTypeKey.includes('exchange')) &&
        (record.UserPrincipalName || record.PrimarySmtpAddress)) {
      const upnOrEmail = record.UserPrincipalName || record.PrimarySmtpAddress;
      const userNode = allNodes.find(n =>
        n.metadata?.record?.UserPrincipalName === upnOrEmail ||
        n.metadata?.record?.Mail === upnOrEmail ||
        n.metadata?.record?.PrimarySmtpAddress === upnOrEmail ||
        // Also check by display name for mailbox owner matching
        (record.DisplayName && n.name === record.DisplayName && n.metadata?.source?.includes('user'))
      );
      if (userNode && userNode.id !== node.id) {
        links.push({
          source: userNode.id,
          target: node.id,
          value: 1,
          type: 'ownership'
        });
      }
    }

    // Network Infrastructure to Servers/Datacenters
    if (fileTypeKey.includes('network') && (record.ComputerName || record.ServerName || record.HostName)) {
      const serverName = record.ComputerName || record.ServerName || record.HostName;
      const serverNode = allNodes.find(n =>
        (n.type === 'it-component' || n.type === 'datacenter') &&
        (n.name === serverName ||
         n.metadata?.record?.ComputerName === serverName ||
         n.metadata?.record?.Name === serverName)
      );
      if (serverNode && serverNode.id !== node.id) {
        links.push({
          source: serverNode.id,
          target: node.id,
          value: 1,
          type: 'deployment'
        });
      }
    }

    // OneDrive to User (OwnerDisplayName/UserPrincipalName)
    if (fileTypeKey.includes('onedrive') && (record.OwnerDisplayName || record.UserPrincipalName)) {
      const userNode = allNodes.find(n =>
        n.type === 'application' &&
        n.metadata?.source?.includes('user') &&
        (n.name === record.OwnerDisplayName || n.metadata?.record?.UserPrincipalName === record.UserPrincipalName)
      );
      if (userNode) {
        links.push({
          source: userNode.id,
          target: node.id,
          value: 1,
          type: 'ownership'
        });
      }
    }

    // SharePoint Site to Owner
    if (fileTypeKey.includes('sharepoint') && record.OwnerDisplayName) {
      const ownerNode = allNodes.find(n =>
        n.type === 'application' &&
        n.name === record.OwnerDisplayName
      );
      if (ownerNode) {
        links.push({
          source: ownerNode.id,
          target: node.id,
          value: 1,
          type: 'ownership'
        });
      }
    }

    // Resource Group relationships
    if (record.ResourceGroupName || record.ResourceGroup) {
      const rgName = record.ResourceGroupName || record.ResourceGroup;
      const rgNode = allNodes.find(n =>
        n.type === 'platform' &&
        n.metadata?.source?.includes('resourcegroup') &&
        n.name === rgName
      );
      if (rgNode) {
        links.push({
          source: rgNode.id,
          target: node.id,
          value: 1,
          type: 'ownership'
        });
      }
    }

    // Subscription relationships
    if (record.SubscriptionId || record.SubscriptionName) {
      const subNode = allNodes.find(n =>
        n.type === 'platform' &&
        n.metadata?.source?.includes('subscription') &&
        (n.metadata?.record?.SubscriptionId === record.SubscriptionId ||
         n.name === record.SubscriptionName)
      );
      if (subNode) {
        links.push({
          source: subNode.id,
          target: node.id,
          value: 1,
          type: 'ownership'
        });
      }
    }

    // Service Principal to Application
    if (fileTypeKey.includes('serviceprincipal') && record.AppId) {
      const appNode = allNodes.find(n =>
        n.type === 'application' &&
        n.metadata?.record?.AppId === record.AppId
      );
      if (appNode) {
        links.push({
          source: node.id,
          target: appNode.id,
          value: 1,
          type: 'provides'
        });
      }
    }

    // Manager relationships
    if (record.ManagerUPN || record.ManagerId || record.ManagerDisplayName) {
      const managerNode = allNodes.find(n =>
        n.type === 'application' &&
        (n.metadata?.record?.UserPrincipalName === record.ManagerUPN ||
         n.metadata?.record?.Id === record.ManagerId ||
         n.name === record.ManagerDisplayName)
      );
      if (managerNode && managerNode.id !== node.id) {
        links.push({
          source: managerNode.id,
          target: node.id,
          value: 1,
          type: 'ownership'
        });
      }
    }
  });

  return links;
}

/**
 * Generate cross-file relationships using optimized indices
 * Phase 8: Performance optimization with pre-computed indices
 */
function generateCrossFileLinksOptimized(
  allNodes: SankeyNode[],
  nodesBySource: Record<string, SankeyNode[]>,
  indices: ReturnType<typeof createNodeIndices>
): SankeyLink[] {
  const links: SankeyLink[] = [];
  const linkSet = new Set<string>(); // Track existing links to avoid duplicates

  const addLink = (source: string, target: string, type: SankeyLink['type']) => {
    const key = `${source}:${target}:${type}`;
    if (!linkSet.has(key) && source !== target) {
      linkSet.add(key);
      links.push({ source, target, value: 1, type });
    }
  };

  const { byType, byUPN, byAppId } = indices;

  // Applications to Databases (using type index)
  const applications = byType.get('application') || [];
  const databases = (byType.get('it-component') || []).filter(n =>
    n.metadata.source?.includes('database') ||
    n.metadata.source?.includes('sql')
  );

  // Create database index for fast lookup
  const dbIndex = new Map<string, SankeyNode>();
  databases.forEach(db => {
    const dbName = db.name.toLowerCase();
    dbIndex.set(dbName, db);
    const recordDbName = getRecordProp(db.metadata?.record, 'DatabaseName');
    if (recordDbName) {
      dbIndex.set(recordDbName.toLowerCase(), db);
    }
  });

  // Link apps to databases
  for (const app of applications) {
    const record = app.metadata.record;
    const databaseName = getRecordProp(record, 'DatabaseName');
    const connectionString = getRecordProp(record, 'ConnectionString');
    if (databaseName || connectionString) {
      const dbName = databaseName || extractDatabaseName(connectionString);
      if (dbName) {
        const dbNode = dbIndex.get(dbName.toLowerCase());
        if (dbNode) {
          addLink(dbNode.id, app.id, 'provides');
        }
      }
    }
  }

  // Azure Subscriptions to Tenant (using type index)
  const platforms = byType.get('platform') || [];
  const subscriptions = platforms.filter(n => n.metadata.source?.includes('subscription'));
  const tenants = platforms.filter(n => n.metadata.source?.includes('tenant'));

  // Create tenant index
  const tenantIndex = new Map<string, SankeyNode>();
  tenants.forEach(t => {
    const tenantRecordId = getRecordProp(t.metadata.record, 'Id');
    const tenantRecordTenantId = getRecordProp(t.metadata.record, 'TenantId');
    if (tenantRecordId) tenantIndex.set(tenantRecordId, t);
    if (tenantRecordTenantId) tenantIndex.set(tenantRecordTenantId, t);
  });

  for (const sub of subscriptions) {
    const tenantId = getRecordProp(sub.metadata.record, 'TenantId');
    if (tenantId) {
      const tenantNode = tenantIndex.get(tenantId);
      if (tenantNode) {
        addLink(tenantNode.id, sub.id, 'ownership');
      }
    }
  }

  // Resource Groups to Subscriptions
  const resourceGroups = platforms.filter(n => n.metadata.source?.includes('resourcegroup'));

  // Create subscription index
  const subIndex = new Map<string, SankeyNode>();
  subscriptions.forEach(s => {
    const subscriptionId = getRecordProp(s.metadata.record, 'SubscriptionId');
    if (subscriptionId) {
      subIndex.set(subscriptionId, s);
    }
  });

  for (const rg of resourceGroups) {
    const subId = getRecordProp(rg.metadata.record, 'SubscriptionId');
    if (subId) {
      const subNode = subIndex.get(subId);
      if (subNode) {
        addLink(subNode.id, rg.id, 'ownership');
      }
    }
  }

  // Teams to Groups (name matching)
  const teams = platforms.filter(n => n.metadata.source?.includes('team'));
  const groups = platforms.filter(n => n.metadata.source?.includes('group'));

  // Create group index by name and ID
  const groupIndex = new Map<string, SankeyNode>();
  groups.forEach(g => {
    groupIndex.set(g.name.toLowerCase(), g);
    const groupId = getRecordProp(g.metadata.record, 'Id');
    if (groupId) {
      groupIndex.set(groupId, g);
    }
  });

  for (const team of teams) {
    const teamId = getRecordProp(team.metadata.record, 'Id');
    const groupNode = groupIndex.get(team.name.toLowerCase()) ||
                      (teamId && groupIndex.get(teamId));
    if (groupNode) {
      addLink(groupNode.id, team.id, 'provides');
    }
  }

  // EntraID Apps to Service Principals (using AppId index)
  const entraidApps = applications.filter(n =>
    n.metadata.source?.includes('entraid') ||
    n.metadata.source?.includes('azurediscovery_application')
  );
  const servicePrincipals = platforms.filter(n => n.metadata.source?.includes('serviceprincipal'));

  // Create SP index by AppId
  const spIndex = new Map<string, SankeyNode>();
  servicePrincipals.forEach(sp => {
    const spAppId = getRecordProp(sp.metadata.record, 'AppId');
    if (spAppId) {
      spIndex.set(spAppId, sp);
    }
  });

  for (const app of entraidApps) {
    const appId = getRecordProp(app.metadata.record, 'AppId');
    if (appId) {
      const spNode = spIndex.get(appId);
      if (spNode) {
        addLink(spNode.id, app.id, 'provides');
      }
    }
  }

  // SharePoint Sites to Lists
  const spSites = platforms.filter(n => n.metadata.source?.includes('sharepointsite') || n.metadata.source?.includes('sharepoint'));
  const spLists = applications.filter(n => n.metadata.source?.includes('sharepointlist'));

  // Create site index by URL
  const siteIndex = new Map<string, SankeyNode>();
  spSites.forEach(site => {
    const webUrl = getRecordProp(site.metadata.record, 'WebUrl');
    const url = getRecordProp(site.metadata.record, 'Url');
    if (webUrl) siteIndex.set(webUrl, site);
    if (url) siteIndex.set(url, site);
  });

  for (const list of spLists) {
    const siteUrl = getRecordProp(list.metadata.record, 'SiteUrl') || getRecordProp(list.metadata.record, 'WebUrl');
    if (siteUrl) {
      const siteNode = siteIndex.get(siteUrl);
      if (siteNode) {
        addLink(siteNode.id, list.id, 'ownership');
      }
    }
  }

  // SharePoint Sites to Owners (users)
  const users = byType.get('application')?.filter(n =>
    n.metadata.source?.includes('user') ||
    n.metadata.category === 'User'
  ) || [];

  // Create user index by display name and UPN
  const userIndex = new Map<string, SankeyNode>();
  users.forEach(user => {
    const displayName = user.name?.toLowerCase();
    if (displayName) userIndex.set(displayName, user);
    const upn = getRecordProp(user.metadata.record, 'UserPrincipalName')?.toLowerCase();
    if (upn) userIndex.set(upn, user);
    const mail = getRecordProp(user.metadata.record, 'Mail')?.toLowerCase();
    if (mail) userIndex.set(mail, user);
  });

  for (const site of spSites) {
    const ownerDisplayName = getRecordProp(site.metadata.record, 'OwnerDisplayName');
    const owner = getRecordProp(site.metadata.record, 'Owner');
    const ownerName = ownerDisplayName?.toLowerCase() || owner?.toLowerCase();
    const ownerEmail = getRecordProp(site.metadata.record, 'OwnerEmail')?.toLowerCase();

    const ownerNode = (ownerName && userIndex.get(ownerName)) ||
                      (ownerEmail && userIndex.get(ownerEmail));
    if (ownerNode) {
      addLink(ownerNode.id, site.id, 'ownership');
    }
  }

  // Mailboxes to Users (cross-file)
  const mailboxes = byType.get('application')?.filter(n =>
    n.metadata.source?.includes('mailbox') ||
    n.metadata.source?.includes('exchange')
  ) || [];

  for (const mailbox of mailboxes) {
    const upn = getRecordProp(mailbox.metadata.record, 'UserPrincipalName')?.toLowerCase();
    const email = getRecordProp(mailbox.metadata.record, 'PrimarySmtpAddress')?.toLowerCase();
    const displayName = getRecordProp(mailbox.metadata.record, 'DisplayName')?.toLowerCase();

    const ownerNode = (upn && userIndex.get(upn)) ||
                      (email && userIndex.get(email)) ||
                      (displayName && userIndex.get(displayName));
    if (ownerNode && ownerNode.id !== mailbox.id) {
      addLink(ownerNode.id, mailbox.id, 'ownership');
    }
  }

  // ===== ENHANCED LINK GENERATION (Phase 10) =====

  // 1. User ↔ License Assignment Links
  // Link users to their license assignments based on UserPrincipalName matching
  const licenseAssignments = platforms.filter(n =>
    n.metadata.source?.includes('userassignment') ||
    n.metadata.source?.includes('licensingdiscoveryuserassignment') ||
    n.metadata.category === 'License Assignment'
  );

  const licenses = platforms.filter(n =>
    n.metadata.source?.includes('licensingsubscriptions') ||
    n.metadata.source?.includes('licensingdiscoverylicensingsubscriptions') ||
    n.metadata.category === 'Licensing'
  );

  // Create license index by SkuId and SkuPartNumber
  const licenseIndex = new Map<string, SankeyNode>();
  licenses.forEach(lic => {
    const skuId = getRecordProp(lic.metadata.record, 'SkuId');
    const skuPartNumber = getRecordProp(lic.metadata.record, 'SkuPartNumber');
    if (skuId) licenseIndex.set(skuId, lic);
    if (skuPartNumber) licenseIndex.set(skuPartNumber.toLowerCase(), lic);
  });

  for (const assignment of licenseAssignments) {
    // Link assignment to user
    const assignmentUPN = getRecordProp(assignment.metadata.record, 'UserPrincipalName')?.toLowerCase();
    const assignmentDisplayName = getRecordProp(assignment.metadata.record, 'DisplayName')?.toLowerCase();

    if (assignmentUPN || assignmentDisplayName) {
      const userNode = (assignmentUPN && userIndex.get(assignmentUPN)) ||
                       (assignmentDisplayName && userIndex.get(assignmentDisplayName));
      if (userNode && userNode.id !== assignment.id) {
        addLink(userNode.id, assignment.id, 'ownership');
      }
    }

    // Link assignment to license
    const skuId = getRecordProp(assignment.metadata.record, 'SkuId');
    const skuPartNumber = getRecordProp(assignment.metadata.record, 'SkuPartNumber')?.toLowerCase();

    const licenseNode = (skuId && licenseIndex.get(skuId)) ||
                        (skuPartNumber && licenseIndex.get(skuPartNumber));
    if (licenseNode && licenseNode.id !== assignment.id) {
      addLink(assignment.id, licenseNode.id, 'provides');
    }
  }

  // 2. Directory Role ↔ User Member Links
  // Link directory roles to their user members using UserMembers field
  const directoryRoles = platforms.filter(n =>
    n.metadata.source?.includes('directoryrole') ||
    n.metadata.category === 'Directory Role'
  );

  for (const role of directoryRoles) {
    const userMembersStr = getRecordProp(role.metadata.record, 'UserMembers');
    if (userMembersStr) {
      // UserMembers is a semicolon-separated list of display names
      const memberNames = userMembersStr.split(';').map((m: string) => m.trim().toLowerCase()).filter(Boolean);

      for (const memberName of memberNames) {
        const memberNode = userIndex.get(memberName);
        if (memberNode && memberNode.id !== role.id) {
          addLink(role.id, memberNode.id, 'ownership');
        }
      }
    }

    // Also link based on GroupMembers for groups that have directory roles
    const groupMembersStr = getRecordProp(role.metadata.record, 'GroupMembers');
    if (groupMembersStr) {
      const groupNames = groupMembersStr.split(';').map((g: string) => g.trim().toLowerCase()).filter(Boolean);

      for (const groupName of groupNames) {
        const groupNode = groupIndex.get(groupName);
        if (groupNode && groupNode.id !== role.id) {
          addLink(role.id, groupNode.id, 'ownership');
        }
      }
    }
  }

  // 3. Subscription Owner ↔ Subscription Links
  // Link subscription owners to their subscriptions
  const subscriptionOwners = platforms.filter(n =>
    n.metadata.source?.includes('subscriptionowner') ||
    n.metadata.category === 'Subscription Owner'
  );

  for (const owner of subscriptionOwners) {
    // Link owner to subscription
    const ownerSubId = getRecordProp(owner.metadata.record, 'SubscriptionId');
    const ownerSubName = getRecordProp(owner.metadata.record, 'SubscriptionName');

    if (ownerSubId || ownerSubName) {
      const subNode = (ownerSubId && subIndex.get(ownerSubId)) ||
                      subscriptions.find(s => s.name === ownerSubName);
      if (subNode && subNode.id !== owner.id) {
        addLink(owner.id, subNode.id, 'ownership');
      }
    }

    // Link owner to user (if owner is a user)
    const principalEmail = getRecordProp(owner.metadata.record, 'PrincipalEmail')?.toLowerCase();
    const principalName = getRecordProp(owner.metadata.record, 'PrincipalName')?.toLowerCase();
    const principalType = getRecordProp(owner.metadata.record, 'PrincipalType');

    if (principalType === 'User' || principalType === 'user') {
      const userNode = (principalEmail && userIndex.get(principalEmail)) ||
                       (principalName && userIndex.get(principalName));
      if (userNode && userNode.id !== owner.id) {
        addLink(userNode.id, owner.id, 'ownership');
      }
    }
  }

  // 4. Application Ownership Links
  // Link applications to their owners from EntraID discovery
  for (const app of applications) {
    const ownerDisplayName = getRecordProp(app.metadata.record, 'OwnerDisplayName')?.toLowerCase();
    const owners = getRecordProp(app.metadata.record, 'Owners');

    if (ownerDisplayName) {
      const ownerNode = userIndex.get(ownerDisplayName);
      if (ownerNode && ownerNode.id !== app.id) {
        addLink(ownerNode.id, app.id, 'ownership');
      }
    }

    // Handle multiple owners from Owners field (semicolon-separated)
    if (owners) {
      const ownerList = owners.split(';').map((o: string) => o.trim().toLowerCase()).filter(Boolean);
      for (const ownerName of ownerList) {
        const ownerNode = userIndex.get(ownerName);
        if (ownerNode && ownerNode.id !== app.id) {
          addLink(ownerNode.id, app.id, 'ownership');
        }
      }
    }
  }

  // 5. Infrastructure Relationship Links
  // Link VMs to their resource groups and virtual networks
  const vms = (byType.get('it-component') || []).filter(n =>
    n.metadata.source?.includes('virtualmachine') ||
    n.metadata.source?.includes('vm')
  );

  for (const vm of vms) {
    // Link to resource group
    const rgName = getRecordProp(vm.metadata.record, 'ResourceGroupName') ||
                   getRecordProp(vm.metadata.record, 'ResourceGroup');
    if (rgName) {
      const rgNode = resourceGroups.find(rg => rg.name === rgName);
      if (rgNode && rgNode.id !== vm.id) {
        addLink(rgNode.id, vm.id, 'ownership');
      }
    }

    // Link to subscription
    const vmSubId = getRecordProp(vm.metadata.record, 'SubscriptionId');
    if (vmSubId) {
      const vmSubNode = subIndex.get(vmSubId);
      if (vmSubNode && vmSubNode.id !== vm.id) {
        addLink(vmSubNode.id, vm.id, 'ownership');
      }
    }
  }

  // Link storage accounts to resource groups
  const storageAccounts = (byType.get('it-component') || []).filter(n =>
    n.metadata.source?.includes('storage') &&
    !n.metadata.source?.includes('local')
  );

  for (const storage of storageAccounts) {
    const rgName = getRecordProp(storage.metadata.record, 'ResourceGroupName') ||
                   getRecordProp(storage.metadata.record, 'ResourceGroup');
    if (rgName) {
      const rgNode = resourceGroups.find(rg => rg.name === rgName);
      if (rgNode && rgNode.id !== storage.id) {
        addLink(rgNode.id, storage.id, 'ownership');
      }
    }
  }

  console.log('[generateCrossFileLinksOptimized] Generated links:', links.length, {
    applications: applications.length,
    databases: databases.length,
    tenants: tenants.length,
    subscriptions: subscriptions.length,
    resourceGroups: resourceGroups.length,
    teams: teams.length,
    groups: groups.length,
    servicePrincipals: servicePrincipals.length,
    spSites: spSites.length,
    spLists: spLists.length,
    users: users.length,
    mailboxes: mailboxes.length,
    licenseAssignments: licenseAssignments.length,
    licenses: licenses.length,
    directoryRoles: directoryRoles.length,
    subscriptionOwners: subscriptionOwners.length,
    vms: vms.length,
    storageAccounts: storageAccounts.length
  });
  return links;
}

/**
 * Generate cross-file relationships after all nodes are created
 * @deprecated Use generateCrossFileLinksOptimized instead
 */
function generateCrossFileLinks(
  allNodes: SankeyNode[],
  nodesBySource: Record<string, SankeyNode[]>
): SankeyLink[] {
  const links: SankeyLink[] = [];

  // Group nodes by type for efficient lookup
  const nodesByType = allNodes.reduce((acc, node) => {
    if (!acc[node.type]) acc[node.type] = [];
    acc[node.type].push(node);
    return acc;
  }, {} as Record<EntityType, SankeyNode[]>);

  // Applications to Databases (ConnectionString parsing)
  const applications = nodesByType['application'] || [];
  const databases = (nodesByType['it-component'] || []).filter(n =>
    n.metadata.source?.includes('database') ||
    n.metadata.source?.includes('sql')
  );

  applications.forEach(app => {
    const record = app.metadata.record;
    if (record.DatabaseName || record.ConnectionString) {
      const dbName = record.DatabaseName || extractDatabaseName(record.ConnectionString);
      if (dbName) {
        const dbNode = databases.find(db =>
          db.name.toLowerCase() === dbName.toLowerCase() ||
          db.metadata?.record?.DatabaseName?.toLowerCase() === dbName.toLowerCase()
        );
        if (dbNode) {
          links.push({
            source: dbNode.id,
            target: app.id,
            value: 1,
            type: 'provides'
          });
        }
      }
    }
  });

  // Azure Subscriptions to Tenant
  const subscriptions = (nodesByType['platform'] || []).filter(n =>
    n.metadata.source?.includes('subscription')
  );
  const tenants = (nodesByType['platform'] || []).filter(n =>
    n.metadata.source?.includes('tenant')
  );

  subscriptions.forEach(sub => {
    const tenantId = sub.metadata.record?.TenantId;
    if (tenantId) {
      const tenantNode = tenants.find(t =>
        t.metadata.record?.Id === tenantId ||
        t.metadata.record?.TenantId === tenantId
      );
      if (tenantNode) {
        links.push({
          source: tenantNode.id,
          target: sub.id,
          value: 1,
          type: 'ownership'
        });
      }
    }
  });

  // Resource Groups to Subscriptions
  const resourceGroups = (nodesByType['platform'] || []).filter(n =>
    n.metadata.source?.includes('resourcegroup')
  );

  resourceGroups.forEach(rg => {
    const subId = rg.metadata.record?.SubscriptionId;
    if (subId) {
      const subNode = subscriptions.find(s =>
        s.metadata.record?.SubscriptionId === subId
      );
      if (subNode) {
        links.push({
          source: subNode.id,
          target: rg.id,
          value: 1,
          type: 'ownership'
        });
      }
    }
  });

  // Teams to Groups (Teams are based on Groups)
  const teams = (nodesByType['platform'] || []).filter(n =>
    n.metadata.source?.includes('team')
  );
  const groups = (nodesByType['platform'] || []).filter(n =>
    n.metadata.source?.includes('group')
  );

  teams.forEach(team => {
    // Teams are often named the same as their associated group
    const groupNode = groups.find(g =>
      g.name === team.name ||
      g.metadata.record?.Id === team.metadata.record?.Id
    );
    if (groupNode) {
      links.push({
        source: groupNode.id,
        target: team.id,
        value: 1,
        type: 'provides'
      });
    }
  });

  // EntraID Apps to Service Principals
  const entraidApps = applications.filter(n =>
    n.metadata.source?.includes('entraid') ||
    n.metadata.source?.includes('azurediscovery_application')
  );
  const servicePrincipals = (nodesByType['platform'] || []).filter(n =>
    n.metadata.source?.includes('serviceprincipal')
  );

  entraidApps.forEach(app => {
    const appId = app.metadata.record?.AppId;
    if (appId) {
      const spNode = servicePrincipals.find(sp =>
        sp.metadata.record?.AppId === appId
      );
      if (spNode) {
        links.push({
          source: spNode.id,
          target: app.id,
          value: 1,
          type: 'provides'
        });
      }
    }
  });

  // SharePoint Sites to SharePoint Lists
  const spSites = (nodesByType['platform'] || []).filter(n =>
    n.metadata.source?.includes('sharepointsite')
  );
  const spLists = applications.filter(n =>
    n.metadata.source?.includes('sharepointlist')
  );

  spLists.forEach(list => {
    const siteUrl = list.metadata.record?.SiteUrl || list.metadata.record?.WebUrl;
    if (siteUrl) {
      const siteNode = spSites.find(site =>
        site.metadata.record?.WebUrl === siteUrl ||
        site.metadata.record?.Url === siteUrl
      );
      if (siteNode) {
        links.push({
          source: siteNode.id,
          target: list.id,
          value: 1,
          type: 'ownership'
        });
      }
    }
  });

  return links;
}

/**
 * REMOVED: inferBusinessCapabilities
 *
 * These functions auto-generated "inferred" business capability nodes that don't exist
 * in actual discovery data. Removed to only show real objects from CSV discovery files.
 *
 * If business capabilities are needed in the future, they should come from:
 * - A dedicated business capability discovery module
 * - Manual CSV file with business capabilities
 * - NOT auto-inferred from user departments
 */

/**
 * Merge duplicate nodes and links
 */
function mergeDuplicateEntities(nodes: SankeyNode[], links: SankeyLink[]): OrganisationMapData {
  // Create a map to track unique nodes by a composite key
  const nodeMap = new Map<string, SankeyNode>();

  nodes.forEach(node => {
    // Use name + type as the composite key for deduplication
    const key = `${node.type}:${node.name.toLowerCase()}`;

    if (!nodeMap.has(key)) {
      nodeMap.set(key, node);
    } else {
      // Merge metadata from duplicate
      const existing = nodeMap.get(key)!;
      // Keep the one with more complete data
      if (Object.keys(node.metadata.record).length > Object.keys(existing.metadata.record).length) {
        nodeMap.set(key, { ...node, id: existing.id }); // Keep original ID
      }
    }
  });

  const uniqueNodes = Array.from(nodeMap.values());

  // Create ID mapping for links
  const idMap = new Map<string, string>();
  nodes.forEach(node => {
    const key = `${node.type}:${node.name.toLowerCase()}`;
    const canonical = nodeMap.get(key);
    if (canonical) {
      idMap.set(node.id, canonical.id);
    }
  });

  // Remap link sources and targets
  const remappedLinks = links.map(link => ({
    ...link,
    source: idMap.get(typeof link.source === 'string' ? link.source : link.source.id) || link.source,
    target: idMap.get(typeof link.target === 'string' ? link.target : link.target.id) || link.target
  }));

  // Remove duplicate links
  const uniqueLinks = removeDuplicateLinks(remappedLinks);

  return { nodes: uniqueNodes, links: uniqueLinks };
}

/**
 * Remove duplicate links
 */
function removeDuplicateLinks(links: SankeyLink[]): SankeyLink[] {
  const linkSet = new Set<string>();

  return links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;

    // Skip self-referencing links
    if (sourceId === targetId) return false;

    const key = `${sourceId}:${targetId}:${link.type}`;
    if (linkSet.has(key)) {
      return false;
    }
    linkSet.add(key);
    return true;
  });
}

/**
 * Enforce MAX_LINKS_PER_NODE limit to prevent cluttered visualization
 * Keeps the most important links per node based on relationship type priority
 */
function enforceLinkLimits(links: SankeyLink[], maxLinksPerNode: number): SankeyLink[] {
  // Count links per node (both incoming and outgoing)
  const nodeLinkCounts = new Map<string, { incoming: SankeyLink[], outgoing: SankeyLink[] }>();

  // Organize links by node
  links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;

    if (!nodeLinkCounts.has(sourceId)) {
      nodeLinkCounts.set(sourceId, { incoming: [], outgoing: [] });
    }
    if (!nodeLinkCounts.has(targetId)) {
      nodeLinkCounts.set(targetId, { incoming: [], outgoing: [] });
    }

    nodeLinkCounts.get(sourceId)!.outgoing.push(link);
    nodeLinkCounts.get(targetId)!.incoming.push(link);
  });

  // Priority for link types (lower number = higher priority)
  const typePriority: Record<string, number> = {
    'ownership': 1,
    'deployment': 2,
    'provides': 3,
    'consumes': 4,
    'dependency': 5,
    'realizes': 6
  };

  const keptLinks = new Set<SankeyLink>();
  const halfLimit = Math.floor(maxLinksPerNode / 2);

  // For each node, keep the most important incoming and outgoing links
  nodeLinkCounts.forEach((linkGroups, nodeId) => {
    // Sort and limit incoming links
    const sortedIncoming = linkGroups.incoming
      .sort((a, b) => (typePriority[a.type] || 99) - (typePriority[b.type] || 99))
      .slice(0, halfLimit);

    // Sort and limit outgoing links
    const sortedOutgoing = linkGroups.outgoing
      .sort((a, b) => (typePriority[a.type] || 99) - (typePriority[b.type] || 99))
      .slice(0, halfLimit);

    sortedIncoming.forEach(link => keptLinks.add(link));
    sortedOutgoing.forEach(link => keptLinks.add(link));
  });

  const result = Array.from(keptLinks);

  if (result.length < links.length) {
    console.log(`[enforceLinkLimits] Reduced links from ${links.length} to ${result.length} (max ${maxLinksPerNode} per node)`);
  }

  return result;
}

/**
 * Extract database name from connection string
 */
function extractDatabaseName(connectionString: string): string | null {
  if (!connectionString) return null;

  const patterns = [
    /Database=([^;]+)/i,
    /Initial Catalog=([^;]+)/i,
    /Data Source=([^;]+)/i
  ];

  for (const pattern of patterns) {
    const match = connectionString.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
}

export default useOrganisationMapLogic;
