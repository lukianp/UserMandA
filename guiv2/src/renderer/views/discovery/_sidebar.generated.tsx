// Auto-generated sidebar navigation items for discovery execution views
// Generated to match routes in routes.tsx

import React from 'react';
import {
  Database, Package, Cloud, Layers, HardDrive, Shield, Key, Lock,
  Tag, Network, AppWindow, Radar, Mail, Users, Server, FileText,
  Cpu, GitBranch, Folders, BarChart3, Workflow, Printer, Calendar,
  MessageSquare, Globe, Smartphone, Folder, Search, FileSearch
} from 'lucide-react';

export const discoveryNavItems = [
  // Dashboard
  { path: '/discovery/dashboard', label: 'Dashboard', icon: <Search size={16} /> },

  // Identity & Access
  { path: '/discovery/active-directory', label: 'Active Directory', icon: <Database size={16} /> },
  { path: '/discovery/entra-id-app', label: 'Entra ID Apps', icon: <AppWindow size={16} /> },
  { path: '/discovery/external-identity', label: 'External Identities', icon: <Users size={16} /> },
  { path: '/discovery/graph', label: 'Microsoft Graph', icon: <Network size={16} /> },
  { path: '/discovery/multi-domain-forest', label: 'Multi-Domain Forest', icon: <GitBranch size={16} /> },
  { path: '/discovery/conditional-access', label: 'Conditional Access', icon: <Lock size={16} /> },
  { path: '/discovery/gpo', label: 'Group Policy', icon: <FileText size={16} /> },

  // Cloud Platforms
  { path: '/discovery/azure', label: 'Azure', icon: <Cloud size={16} /> },
  { path: '/discovery/azure-resource', label: 'Azure Resource', icon: <Layers size={16} /> },
  { path: '/discovery/aws', label: 'AWS', icon: <Cloud size={16} /> },
  { path: '/discovery/gcp', label: 'GCP', icon: <Cloud size={16} /> },
  { path: '/discovery/google-workspace', label: 'Google Workspace', icon: <Cloud size={16} /> },

  // Microsoft 365
  { path: '/discovery/exchange', label: 'Exchange', icon: <Mail size={16} /> },
  { path: '/discovery/sharepoint', label: 'SharePoint', icon: <Folder size={16} /> },
  { path: '/discovery/teams', label: 'Teams', icon: <MessageSquare size={16} /> },
  { path: '/discovery/onedrive', label: 'OneDrive', icon: <Folders size={16} /> },
  { path: '/discovery/office365', label: 'Office 365', icon: <Package size={16} /> },
  { path: '/discovery/intune', label: 'Intune', icon: <Smartphone size={16} /> },
  { path: '/discovery/power-platform', label: 'Power Platform', icon: <Workflow size={16} /> },
  { path: '/discovery/powerbi', label: 'Power BI', icon: <BarChart3 size={16} /> },

  // Infrastructure
  { path: '/discovery/file-system', label: 'File System', icon: <HardDrive size={16} /> },
  { path: '/discovery/file-server', label: 'File Server', icon: <Server size={16} /> },
  { path: '/discovery/domain', label: 'Domain', icon: <Network size={16} /> },
  { path: '/discovery/network', label: 'Network', icon: <Network size={16} /> },
  { path: '/discovery/applications', label: 'Applications', icon: <Package size={16} /> },
  { path: '/discovery/environment', label: 'Environment', icon: <Radar size={16} /> },
  { path: '/discovery/physical-server', label: 'Physical Server', icon: <Server size={16} /> },
  { path: '/discovery/storage-array', label: 'Storage Array', icon: <HardDrive size={16} /> },
  { path: '/discovery/printer', label: 'Printers', icon: <Printer size={16} /> },
  { path: '/discovery/scheduled-task', label: 'Scheduled Tasks', icon: <Calendar size={16} /> },
  { path: '/discovery/backup-recovery', label: 'Backup & Recovery', icon: <HardDrive size={16} /> },
  { path: '/discovery/web-server', label: 'Web Server', icon: <Globe size={16} /> },

  // Virtualization
  { path: '/discovery/vmware', label: 'VMware', icon: <Cpu size={16} /> },
  { path: '/discovery/hyper-v', label: 'Hyper-V', icon: <Cpu size={16} /> },
  { path: '/discovery/virtualization', label: 'Virtualization', icon: <Cpu size={16} /> },

  // Database
  { path: '/discovery/sql-server', label: 'SQL Server', icon: <Database size={16} /> },
  { path: '/discovery/database-schema', label: 'Database Schema', icon: <Database size={16} /> },

  // Security
  { path: '/discovery/security', label: 'Security', icon: <Shield size={16} /> },
  { path: '/discovery/certificate', label: 'Certificates', icon: <Key size={16} /> },
  { path: '/discovery/certificate-authority', label: 'Certificate Authority', icon: <Shield size={16} /> },
  { path: '/discovery/dlp', label: 'DLP', icon: <Shield size={16} /> },
  { path: '/discovery/palo-alto', label: 'Palo Alto', icon: <Shield size={16} /> },
  { path: '/discovery/panorama-interrogation', label: 'Panorama', icon: <Shield size={16} /> },

  // Data
  { path: '/discovery/data-classification', label: 'Data Classification', icon: <Tag size={16} /> },
  { path: '/discovery/licensing', label: 'Licensing', icon: <FileText size={16} /> },
  { path: '/discovery/dns-dhcp', label: 'DNS & DHCP', icon: <Network size={16} /> },
];
