// Auto-generated sidebar navigation items for discovery execution views
// Order: Dashboard, Azure/M365 Cloud, Active Directory/On-prem, Rest (alphabetical)

import React from 'react';
import {
  Database, Package, Cloud, Layers, HardDrive, Shield, Key, Lock,
  Tag, Network, AppWindow, Radar, Mail, Users, Server, FileText,
  Cpu, GitBranch, Folders, BarChart3, Workflow, Printer, Calendar,
  MessageSquare, Globe, Smartphone, Folder, Search, FileSearch, Zap,
  Settings, FolderTree, UserCog, Fingerprint, KeyRound
} from 'lucide-react';

export const discoveryNavItems = [
  // Dashboard (always first)
  { path: '/discovery/dashboard', label: 'Dashboard', icon: <Search size={16} /> },

  // =========================================================================
  // AZURE / MICROSOFT 365 CLOUD (alphabetical)
  // =========================================================================
  { path: '/discovery/azure-automation', label: 'Azure Automation', icon: <Settings size={16} /> },
  { path: '/discovery/azure-acr', label: 'Azure Container Registries', icon: <Package size={16} /> },
  { path: '/discovery/azure-functions', label: 'Azure Function Apps', icon: <Zap size={16} /> },
  { path: '/discovery/azure-resource', label: 'Azure Infrastructure', icon: <Layers size={16} /> },
  { path: '/discovery/azure-keyvault-access', label: 'Azure Key Vault Access', icon: <Key size={16} /> },
  { path: '/discovery/azure-logicapps', label: 'Azure Logic Apps', icon: <Workflow size={16} /> },
  { path: '/discovery/azure-managed-identities', label: 'Azure Managed Identities', icon: <Fingerprint size={16} /> },
  { path: '/discovery/azure-mgmt-groups', label: 'Azure Management Groups', icon: <FolderTree size={16} /> },
  { path: '/discovery/azure-sp-credentials', label: 'Azure SP Credentials', icon: <KeyRound size={16} /> },
  { path: '/discovery/azure-storage-access', label: 'Azure Storage Access', icon: <Database size={16} /> },
  { path: '/discovery/azure-pim', label: 'Azure PIM Roles', icon: <Shield size={16} /> },
  { path: '/discovery/azure-sub-owners', label: 'Azure Subscription Owners', icon: <UserCog size={16} /> },
  { path: '/discovery/azure-vmss', label: 'Azure VM Scale Sets', icon: <Layers size={16} /> },
  { path: '/discovery/conditional-access', label: 'Conditional Access', icon: <Lock size={16} /> },
  { path: '/discovery/azure', label: 'Entra ID & M365', icon: <Cloud size={16} /> },
  { path: '/discovery/entra-id-app', label: 'Entra ID Apps', icon: <AppWindow size={16} /> },
  { path: '/discovery/exchange', label: 'Exchange', icon: <Mail size={16} /> },
  { path: '/discovery/intune', label: 'Intune', icon: <Smartphone size={16} /> },
  { path: '/discovery/licensing', label: 'Licensing', icon: <FileText size={16} /> },
  { path: '/discovery/graph', label: 'Microsoft Graph', icon: <Network size={16} /> },
  { path: '/discovery/teams', label: 'Microsoft Teams', icon: <MessageSquare size={16} /> },
  { path: '/discovery/office365', label: 'Office 365', icon: <Package size={16} /> },
  { path: '/discovery/onedrive', label: 'OneDrive', icon: <Folders size={16} /> },
  { path: '/discovery/powerbi', label: 'Power BI', icon: <BarChart3 size={16} /> },
  { path: '/discovery/power-platform', label: 'Power Platform', icon: <Workflow size={16} /> },
  { path: '/discovery/sharepoint', label: 'SharePoint', icon: <Folder size={16} /> },

  // =========================================================================
  // ACTIVE DIRECTORY / ON-PREM DOMAIN (alphabetical)
  // =========================================================================
  { path: '/discovery/active-directory', label: 'Active Directory', icon: <Database size={16} /> },
  { path: '/discovery/domain', label: 'Domain', icon: <Network size={16} /> },
  { path: '/discovery/gpo', label: 'Group Policy', icon: <FileText size={16} /> },
  { path: '/discovery/multi-domain-forest', label: 'Multi-Domain Forest', icon: <GitBranch size={16} /> },

  // =========================================================================
  // OTHER DISCOVERY MODULES (alphabetical)
  // =========================================================================
  { path: '/discovery/applications', label: 'Applications', icon: <Package size={16} /> },
  { path: '/discovery/aws', label: 'AWS', icon: <Cloud size={16} /> },
  { path: '/discovery/backup-recovery', label: 'Backup & Recovery', icon: <HardDrive size={16} /> },
  { path: '/discovery/certificate-authority', label: 'Certificate Authority', icon: <Shield size={16} /> },
  { path: '/discovery/certificate', label: 'Certificates', icon: <Key size={16} /> },
  { path: '/discovery/data-classification', label: 'Data Classification', icon: <Tag size={16} /> },
  { path: '/discovery/database-schema', label: 'Database Schema', icon: <Database size={16} /> },
  { path: '/discovery/dlp', label: 'DLP', icon: <Shield size={16} /> },
  { path: '/discovery/dns-dhcp', label: 'DNS & DHCP', icon: <Network size={16} /> },
  { path: '/discovery/environment', label: 'Environment', icon: <Radar size={16} /> },
  { path: '/discovery/external-identity', label: 'External Identities', icon: <Users size={16} /> },
  { path: '/discovery/file-server', label: 'File Server', icon: <Server size={16} /> },
  { path: '/discovery/file-system', label: 'File System', icon: <HardDrive size={16} /> },
  { path: '/discovery/gcp', label: 'GCP', icon: <Cloud size={16} /> },
  { path: '/discovery/google-workspace', label: 'Google Workspace', icon: <Cloud size={16} /> },
  { path: '/discovery/hyper-v', label: 'Hyper-V', icon: <Cpu size={16} /> },
  { path: '/discovery/infrastructure', label: 'Infrastructure', icon: <Server size={16} /> },
  { path: '/discovery/network', label: 'Network Infrastructure', icon: <Network size={16} /> },
  { path: '/discovery/palo-alto', label: 'Palo Alto', icon: <Shield size={16} /> },
  { path: '/discovery/panorama-interrogation', label: 'Panorama', icon: <Shield size={16} /> },
  { path: '/discovery/physical-server', label: 'Physical Server', icon: <Server size={16} /> },
  { path: '/discovery/printer', label: 'Printers', icon: <Printer size={16} /> },
  { path: '/discovery/scheduled-task', label: 'Scheduled Tasks', icon: <Calendar size={16} /> },
  { path: '/discovery/security', label: 'Security Infrastructure', icon: <Shield size={16} /> },
  { path: '/discovery/sql-server', label: 'SQL Server', icon: <Database size={16} /> },
  { path: '/discovery/storage-array', label: 'Storage Array', icon: <HardDrive size={16} /> },
  { path: '/discovery/virtualization', label: 'Virtualization', icon: <Cpu size={16} /> },
  { path: '/discovery/vmware', label: 'VMware', icon: <Cpu size={16} /> },
  { path: '/discovery/web-server', label: 'Web Server Config', icon: <Globe size={16} /> },
];
