/**
 * Computer Detail Type Definitions
 *
 * Comprehensive computer detail projection with correlated data across all discovery modules.
 * Mirrors C# ComputerDetailProjection pattern from UserDetailProjection.
 *
 * Epic 1 Task 1.3: ComputersView Detail Implementation
 */

import { UserData } from './user';
import { GroupData } from './group';
import { ApplicationData } from './application';

/**
 * Computer Data (Base Entity)
 */
export interface ComputerData {
  id: string;
  name: string;
  dns: string | null;
  domain: string | null;
  ou: string | null;
  os: string | null;
  osVersion: string | null;
  status: 'Online' | 'Offline' | 'Unknown';
  lastSeen: Date | string | null;
  ipAddress: string | null;
  macAddress: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  isEnabled: boolean;
  createdDate: Date | string | null;
  modifiedDate: Date | string | null;
  description: string | null;
}

/**
 * Computer User Assignment
 * Users assigned to or using this computer
 */
export interface ComputerUserData {
  userSid: string;
  userPrincipalName: string;
  displayName: string;
  assignmentType: 'Primary' | 'Secondary' | 'LastLogon' | 'ProfilePath';
  lastLogon: Date | string | null;
  profilePath: string | null;
  isPrimaryUser: boolean;
}

/**
 * Hardware Specification
 */
export interface HardwareSpec {
  processor: string | null;
  processorCores: number | null;
  processorSpeed: string | null;
  ramGB: number | null;
  totalDiskGB: number | null;
  freeDiskGB: number | null;
  diskType: 'HDD' | 'SSD' | 'Unknown' | null;
  graphicsCard: string | null;
  biosVersion: string | null;
  biosDate: Date | string | null;
  systemType: '32-bit' | '64-bit' | 'Unknown' | null;
  virtualMachine: boolean;
  hypervisor: string | null;
}

/**
 * Software Installation
 */
export interface SoftwareInstallation {
  name: string;
  version: string | null;
  publisher: string | null;
  installDate: Date | string | null;
  installPath: string | null;
  category: string | null;
  size: number | null; // Size in MB
  licenseKey: string | null;
  licenseType: string | null;
}

/**
 * Security & Compliance Status
 */
export interface SecurityComplianceStatus {
  antivirusInstalled: boolean;
  antivirusProduct: string | null;
  antivirusUpToDate: boolean;
  antivirusLastUpdate: Date | string | null;
  firewallEnabled: boolean;
  firewallProfile: string | null;
  encryptionEnabled: boolean;
  encryptionType: string | null;
  tpmEnabled: boolean;
  secureBoot: boolean;
  lastPatchDate: Date | string | null;
  patchLevel: string | null;
  complianceStatus: 'Compliant' | 'NonCompliant' | 'Unknown';
  complianceIssues: string[];
  vulnerabilityCount: number;
  criticalVulnerabilityCount: number;
}

/**
 * Network Information
 */
export interface NetworkInfo {
  ipAddress: string;
  macAddress: string;
  subnet: string | null;
  gateway: string | null;
  dnsServers: string[];
  dhcpEnabled: boolean;
  dhcpServer: string | null;
  vlan: string | null;
  connectionType: 'Wired' | 'Wireless' | 'Unknown';
  wifiSSID: string | null;
  networkSpeed: string | null;
  adapters: NetworkAdapter[];
}

/**
 * Network Adapter
 */
export interface NetworkAdapter {
  name: string;
  macAddress: string;
  ipAddresses: string[];
  status: 'Connected' | 'Disconnected' | 'Unknown';
  speed: string | null;
  type: 'Ethernet' | 'WiFi' | 'Bluetooth' | 'Virtual' | 'Unknown';
}

/**
 * Computer Risk Item
 */
export interface ComputerRiskItem {
  type: string; // e.g., "OutdatedOS", "MissingPatches", "NoAntivirus"
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  recommendation: string;
  detectedAt: Date | string;
  category: 'Security' | 'Compliance' | 'Performance' | 'Configuration';
  remediation: string | null;
  affectedComponent: string | null;
}

/**
 * Computer Migration Hint
 */
export interface ComputerMigrationHint {
  category: string; // e.g., "Hardware", "Software", "Compatibility"
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  actionRequired: boolean;
  impact: 'High' | 'Medium' | 'Low' | null;
  complexity: 'High' | 'Medium' | 'Low' | null;
  estimatedEffort: string | null;
  dependencies: string[];
}

/**
 * Computer Detail Projection
 *
 * Complete computer data with all correlated entities.
 * This is the primary data structure returned by LogicEngineService.getComputerDetailAsync().
 *
 * Mirrors UserDetailProjection pattern (6 tab structure).
 */
export interface ComputerDetailProjection {
  // Core Computer Data
  computer: ComputerData;

  // Tab 1: Overview (Resource Summary)
  overview: {
    userCount: number;
    softwareCount: number;
    groupCount: number;
    networkAdapterCount: number;
    lastBootTime: Date | string | null;
    uptime: string | null;
    installDate: Date | string | null;
  };

  // Tab 2: Users (Assigned/Primary Users)
  users: ComputerUserData[];

  // Tab 3: Software (Installed Applications)
  software: SoftwareInstallation[];

  // Tab 4: Hardware (Specifications)
  hardware: HardwareSpec;

  // Tab 5: Security & Compliance
  security: SecurityComplianceStatus;

  // Tab 6: Network Info
  network: NetworkInfo;

  // Additional correlated data
  groups: GroupData[]; // Groups this computer is a member of
  apps: ApplicationData[]; // Applications discovered on this computer
  risks: ComputerRiskItem[];
  migrationHints: ComputerMigrationHint[];

  // Computed Properties
  primaryUser: string | null; // UPN of primary user
  assignedUsers: string[]; // UPNs of all assigned users
  memberOfGroups: string[]; // Group names

  // Statistics
  stats?: ComputerDetailStats;
}

/**
 * Computer Detail Statistics
 */
export interface ComputerDetailStats {
  totalUsers: number;
  totalSoftware: number;
  totalGroups: number;
  totalRisks: number;
  highRiskCount: number;
  criticalRiskCount: number;
  diskUsagePercentage: number;
  complianceScore: number; // 0-100
}

/**
 * Computer Detail Load Options
 */
export interface ComputerDetailLoadOptions {
  computerId: string;
  includeUsers?: boolean;
  includeSoftware?: boolean;
  includeHardware?: boolean;
  includeSecurity?: boolean;
  includeNetwork?: boolean;
  includeGroups?: boolean;
  includeRisks?: boolean;
  includeMigrationHints?: boolean;
  forceRefresh?: boolean; // Skip cache
}

/**
 * Computer Detail Export Format
 */
export type ComputerDetailExportFormat = 'json' | 'csv' | 'excel' | 'pdf';

/**
 * Computer Detail Export Options
 */
export interface ComputerDetailExportOptions {
  format: ComputerDetailExportFormat;
  fileName?: string;
  includeOverview?: boolean;
  includeUsers?: boolean;
  includeSoftware?: boolean;
  includeHardware?: boolean;
  includeSecurity?: boolean;
  includeNetwork?: boolean;
  includeRisks?: boolean;
  includeMigrationHints?: boolean;
  includeCharts?: boolean; // For PDF/Excel exports
  includeSummary?: boolean;
}


