/**
 * Enhanced Infrastructure View Types
 * Comprehensive type definitions for all infrastructure management views
 */

// ===========================
// Computer Inventory Types
// ===========================

export interface ComputerInventoryMetrics {
  totalComputers: number;
  activeComputers: number;
  offlineComputers: number;
  serverCount: number;
  workstationCount: number;
  laptopCount: number;
  virtualMachines: number;
  averageAge: number;
}

export interface ComputerAsset {
  id: string;
  name: string;
  type: 'server' | 'workstation' | 'laptop' | 'virtual' | 'tablet';
  status: 'online' | 'offline' | 'maintenance' | 'retired';
  ipAddress?: string;
  macAddress?: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  operatingSystem: string;
  osVersion: string;
  cpu: string;
  ramGB: number;
  diskGB: number;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  location?: string;
  department?: string;
  primaryUser?: string;
  lastSeen?: Date;
  domain?: string;
}

export interface ComputerInventoryData {
  metrics: ComputerInventoryMetrics;
  computers: ComputerAsset[];
  osDistribution: { name: string; count: number; percentage: number }[];
  manufacturerDistribution: { name: string; count: number }[];
  ageDistribution: { ageRange: string; count: number }[];
}

export interface ComputerInventoryFilter {
  searchText?: string;
  type?: ComputerAsset['type'];
  status?: ComputerAsset['status'];
  department?: string;
  location?: string;
}

// ===========================
// Device Management Types
// ===========================

export interface DeviceManagementMetrics {
  totalDevices: number;
  managedDevices: number;
  compliantDevices: number;
  nonCompliantDevices: number;
  pendingActions: number;
  criticalIssues: number;
  lastSyncTime?: Date;
}

export interface ManagedDevice {
  id: string;
  deviceName: string;
  deviceType: 'windows' | 'mac' | 'ios' | 'android' | 'linux';
  complianceStatus: 'compliant' | 'non_compliant' | 'in_grace_period' | 'not_evaluated';
  enrollmentDate: Date;
  lastCheckIn: Date;
  osVersion: string;
  serialNumber: string;
  imei?: string;
  phoneNumber?: string;
  owner: string;
  ownerEmail: string;
  managementType: 'mdm' | 'intune' | 'jamf' | 'manual';
  encryptionStatus: 'encrypted' | 'not_encrypted' | 'unknown';
  policies: CompliancePolicy[];
  issues: DeviceIssue[];
}

export interface CompliancePolicy {
  id: string;
  name: string;
  status: 'compliant' | 'non_compliant' | 'not_applicable';
  description: string;
}

export interface DeviceIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detectedDate: Date;
  resolvedDate?: Date;
}

export interface DeviceManagementData {
  metrics: DeviceManagementMetrics;
  devices: ManagedDevice[];
  complianceTrend: { date: Date; compliantCount: number; totalCount: number }[];
  topIssues: { issue: string; count: number }[];
}

// ===========================
// Server Inventory Types
// ===========================

export interface ServerInventoryMetrics {
  totalServers: number;
  physicalServers: number;
  virtualServers: number;
  onlineServers: number;
  criticalServers: number;
  averageCpuUsage: number;
  averageMemoryUsage: number;
  totalStorageCapacityTB: number;
}

export interface ServerAsset {
  id: string;
  hostname: string;
  serverType: 'physical' | 'virtual';
  role: 'domain_controller' | 'file_server' | 'database' | 'web_server' | 'application' | 'backup' | 'other';
  status: 'online' | 'offline' | 'maintenance' | 'degraded';
  ipAddress: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer?: string;
  model?: string;
  cpuCores: number;
  ramGB: number;
  storageGB: number;
  cpuUsagePercent?: number;
  memoryUsagePercent?: number;
  diskUsagePercent?: number;
  uptime?: number;
  location?: string;
  rackPosition?: string;
  owner?: string;
  department?: string;
  applications?: string[];
  lastBackup?: Date;
  virtualizationHost?: string;
}

export interface ServerInventoryData {
  metrics: ServerInventoryMetrics;
  servers: ServerAsset[];
  roleDistribution: { role: string; count: number }[];
  performanceAlerts: { serverId: string; serverName: string; metric: string; value: number }[];
  utilizationTrend: { date: Date; cpu: number; memory: number; storage: number }[];
}

// ===========================
// Network Infrastructure Types
// ===========================

export interface NetworkDeviceMetrics {
  totalDevices: number;
  switches: number;
  routers: number;
  firewalls: number;
  accessPoints: number;
  onlineDevices: number;
  devicesWithAlerts: number;
  averageUptime: number;
}

export interface NetworkDevice {
  id: string;
  name: string;
  type: 'switch' | 'router' | 'firewall' | 'access_point' | 'load_balancer' | 'vpn';
  status: 'online' | 'offline' | 'warning' | 'critical';
  ipAddress: string;
  macAddress?: string;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  firmwareVersion?: string;
  location?: string;
  ports?: number;
  portsInUse?: number;
  uptime?: number;
  bandwidth?: string;
  lastSeen?: Date;
  managementUrl?: string;
  vlanCount?: number;
}

export interface NetworkDeviceData {
  metrics: NetworkDeviceMetrics;
  devices: NetworkDevice[];
  typeDistribution: { type: string; count: number }[];
  topologyMap?: any;
  bandwidthUsage: { deviceId: string; deviceName: string; usagePercent: number }[];
}

// ===========================
// Storage Systems Types
// ===========================

export interface StorageMetrics {
  totalCapacityTB: number;
  usedCapacityTB: number;
  availableCapacityTB: number;
  utilizationPercent: number;
  totalSystems: number;
  criticalSystems: number;
  averagePerformance: number;
  redundancyStatus: 'healthy' | 'degraded' | 'critical';
}

export interface StorageSystem {
  id: string;
  name: string;
  type: 'san' | 'nas' | 'das' | 'cloud' | 'local' | 'object_storage';
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  capacityTB: number;
  usedTB: number;
  availableTB: number;
  utilizationPercent: number;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  location?: string;
  protocol?: string;
  iops?: number;
  throughputMBps?: number;
  volumes: StorageVolume[];
  redundancyLevel?: string;
  lastBackup?: Date;
}

export interface StorageVolume {
  id: string;
  name: string;
  capacityGB: number;
  usedGB: number;
  mountPoint?: string;
  fileSystem?: string;
  status: 'healthy' | 'warning' | 'critical';
}

export interface StorageData {
  metrics: StorageMetrics;
  systems: StorageSystem[];
  capacityTrend: { date: Date; totalTB: number; usedTB: number }[];
  topConsumers: { name: string; usedTB: number }[];
}

// ===========================
// Virtualization Types
// ===========================

export interface VirtualizationMetrics {
  totalHosts: number;
  totalVMs: number;
  runningVMs: number;
  stoppedVMs: number;
  totalCpuCores: number;
  allocatedCpuCores: number;
  totalMemoryGB: number;
  allocatedMemoryGB: number;
  consolidationRatio: number;
}

export interface VirtualizationHost {
  id: string;
  name: string;
  platform: 'vmware' | 'hyperv' | 'kvm' | 'xen' | 'proxmox';
  status: 'online' | 'offline' | 'maintenance';
  version: string;
  cpuCores: number;
  cpuUsagePercent: number;
  ramGB: number;
  ramUsagePercent: number;
  storageGB: number;
  storageUsagePercent: number;
  vmCount: number;
  runningVmCount: number;
  cluster?: string;
  datacenter?: string;
}

export interface VirtualMachine {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'suspended' | 'paused';
  hostId: string;
  hostName: string;
  operatingSystem: string;
  cpuCores: number;
  ramGB: number;
  diskGB: number;
  cpuUsagePercent?: number;
  memoryUsagePercent?: number;
  ipAddress?: string;
  uptime?: number;
  snapshots?: number;
  tools?: string;
  toolsStatus?: 'running' | 'not_running' | 'not_installed';
}

export interface VirtualizationData {
  metrics: VirtualizationMetrics;
  hosts: VirtualizationHost[];
  vms: VirtualMachine[];
  resourceUtilization: { hostId: string; hostName: string; cpu: number; memory: number; storage: number }[];
  vmDistribution: { hostName: string; vmCount: number }[];
}

// ===========================
// Cloud Resources Types
// ===========================

export interface CloudResourceMetrics {
  totalResources: number;
  runningResources: number;
  stoppedResources: number;
  monthlyCostUSD: number;
  monthlyBudgetUSD: number;
  costTrend: 'increasing' | 'stable' | 'decreasing';
  providers: number;
}

export interface CloudResource {
  id: string;
  name: string;
  provider: 'azure' | 'aws' | 'gcp' | 'other';
  type: 'vm' | 'storage' | 'database' | 'network' | 'function' | 'container' | 'other';
  status: 'running' | 'stopped' | 'deallocated' | 'failed';
  region: string;
  resourceGroup?: string;
  subscription?: string;
  tags?: Record<string, string>;
  monthlyCostUSD: number;
  size?: string;
  createdDate: Date;
  owner?: string;
}

export interface CloudResourceData {
  metrics: CloudResourceMetrics;
  resources: CloudResource[];
  costBreakdown: { provider: string; costUSD: number }[];
  resourceTypeDistribution: { type: string; count: number; costUSD: number }[];
  costTrend: { month: string; costUSD: number }[];
}

// ===========================
// Hardware Assets Types
// ===========================

export interface HardwareAssetMetrics {
  totalAssets: number;
  activeAssets: number;
  inStorageAssets: number;
  retiredAssets: number;
  totalValueUSD: number;
  warrantyExpiringCount: number;
  averageAssetAge: number;
}

export interface HardwareAsset {
  id: string;
  assetTag: string;
  name: string;
  category: 'computer' | 'monitor' | 'printer' | 'phone' | 'network' | 'server' | 'storage' | 'other';
  manufacturer: string;
  model: string;
  serialNumber: string;
  status: 'active' | 'in_storage' | 'maintenance' | 'retired' | 'disposed';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  purchaseDate: Date;
  purchaseCostUSD: number;
  currentValueUSD?: number;
  warrantyExpiry?: Date;
  location: string;
  assignedTo?: string;
  department?: string;
  notes?: string;
}

export interface HardwareAssetData {
  metrics: HardwareAssetMetrics;
  assets: HardwareAsset[];
  categoryDistribution: { category: string; count: number; valueUSD: number }[];
  depreciationTrend: { year: number; valueUSD: number }[];
  upcomingWarrantyExpirations: HardwareAsset[];
}

// ===========================
// Software Inventory Types
// ===========================

export interface SoftwareInventoryMetrics {
  totalApplications: number;
  installedInstances: number;
  licensedSeats: number;
  unlicensedInstances: number;
  complianceRate: number;
  totalLicenseCostUSD: number;
  unusedLicenses: number;
}

export interface SoftwareApplication {
  id: string;
  name: string;
  vendor: string;
  version: string;
  category: 'productivity' | 'development' | 'security' | 'collaboration' | 'business' | 'other';
  installedCount: number;
  licensedCount: number;
  licenseType: 'perpetual' | 'subscription' | 'volume' | 'freeware' | 'open_source';
  complianceStatus: 'compliant' | 'over_deployed' | 'under_licensed';
  annualCostUSD?: number;
  renewalDate?: Date;
  installations: SoftwareInstallation[];
}

export interface SoftwareInstallation {
  id: string;
  computerName: string;
  userName?: string;
  version: string;
  installDate: Date;
  lastUsed?: Date;
  isLicensed: boolean;
}

export interface SoftwareInventoryData {
  metrics: SoftwareInventoryMetrics;
  applications: SoftwareApplication[];
  complianceIssues: { appName: string; issue: string; count: number }[];
  usageStatistics: { appName: string; installedCount: number; activeUsers: number }[];
}

// ===========================
// License Management Types
// ===========================

export interface LicenseManagementMetrics {
  totalLicenses: number;
  activeLicenses: number;
  expiringLicenses: number;
  expiredLicenses: number;
  totalAnnualCostUSD: number;
  complianceScore: number;
  utilizationRate: number;
}

export interface SoftwareLicense {
  id: string;
  productName: string;
  vendor: string;
  licenseKey?: string;
  licenseType: 'user' | 'device' | 'concurrent' | 'site' | 'subscription' | 'perpetual';
  totalSeats: number;
  assignedSeats: number;
  availableSeats: number;
  status: 'active' | 'expiring' | 'expired' | 'suspended';
  purchaseDate: Date;
  expiryDate?: Date;
  renewalDate?: Date;
  costUSD: number;
  annualCostUSD?: number;
  isAutoRenew: boolean;
  owner?: string;
  department?: string;
  notes?: string;
}

export interface LicenseManagementData {
  metrics: LicenseManagementMetrics;
  licenses: SoftwareLicense[];
  expirationCalendar: { month: string; expiringCount: number; costUSD: number }[];
  utilizationByProduct: { productName: string; totalSeats: number; assignedSeats: number; utilizationPercent: number }[];
  costBreakdown: { vendor: string; annualCostUSD: number }[];
}

// ===========================
// Asset Lifecycle Types
// ===========================

export interface AssetLifecycleMetrics {
  totalAssets: number;
  newAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  retiredAssets: number;
  averageLifespanYears: number;
  replacementDueCount: number;
}

export interface AssetLifecycle {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  currentStage: 'procurement' | 'deployment' | 'active' | 'maintenance' | 'retirement' | 'disposal';
  procurementDate?: Date;
  deploymentDate?: Date;
  retirementDate?: Date;
  expectedLifespanYears: number;
  currentAgeYears: number;
  remainingLifespanYears: number;
  maintenanceHistory: MaintenanceRecord[];
  totalMaintenanceCostUSD: number;
  replacementRecommended: boolean;
  replacementReason?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: Date;
  type: 'repair' | 'upgrade' | 'inspection' | 'cleaning';
  description: string;
  costUSD: number;
  performedBy?: string;
}

export interface AssetLifecycleData {
  metrics: AssetLifecycleMetrics;
  assets: AssetLifecycle[];
  stageDistribution: { stage: string; count: number }[];
  replacementPipeline: { quarter: string; count: number; estimatedCostUSD: number }[];
  maintenanceTrend: { month: string; costUSD: number; recordCount: number }[];
}

// ===========================
// Capacity Planning Types
// ===========================

export interface CapacityMetrics {
  currentUtilization: number;
  projectedUtilization: number;
  capacityRemaining: number;
  monthsUntilCapacity: number;
  growthRate: number;
  recommendedActions: number;
}

export interface CapacityForecast {
  resourceType: 'compute' | 'storage' | 'network' | 'licenses';
  currentCapacity: number;
  currentUsage: number;
  utilizationPercent: number;
  projectedUsage3Months: number;
  projectedUsage6Months: number;
  projectedUsage12Months: number;
  capacityThreshold: number;
  estimatedDepletion?: Date;
  growthTrend: 'accelerating' | 'steady' | 'declining';
  recommendations: string[];
}

export interface CapacityPlanningData {
  metrics: CapacityMetrics;
  forecasts: CapacityForecast[];
  historicalTrend: { month: string; compute: number; storage: number; network: number }[];
  recommendations: { priority: 'high' | 'medium' | 'low'; category: string; action: string; estimatedCostUSD?: number }[];
}

// ===========================
// Infrastructure Overview Types
// ===========================

export interface InfrastructureOverviewMetrics {
  totalServers: number;
  totalWorkstations: number;
  totalNetworkDevices: number;
  totalStorageTB: number;
  healthScore: number;
  criticalAlerts: number;
  onlineDevices: number;
  totalDevices: number;
}

export interface InfrastructureOverviewData {
  metrics: InfrastructureOverviewMetrics;
  serverHealth: { status: string; count: number }[];
  storageUtilization: { name: string; usedPercent: number }[];
  networkStatus: { type: string; online: number; total: number }[];
  recentAlerts: { id: string; severity: string; message: string; timestamp: Date }[];
  topIssues: { category: string; issue: string; count: number }[];
}

// ===========================
// Common Filter Types
// ===========================

export interface InfrastructureFilter {
  searchText?: string;
  status?: string;
  location?: string;
  department?: string;
  type?: string;
}


