/**
 * License Discovery Types
 */

export type LicenseDiscoveryStatus = 'idle' | 'discovering' | 'completed' | 'failed' | 'cancelled';
export type LicenseType = 'user' | 'device' | 'subscription';
export type LicenseStatus = 'active' | 'expired' | 'trial' | 'suspended';

export interface LicenseDiscoveryConfig {
  id: string;
  name: string;
  tenantId?: string;
  includeMicrosoft365: boolean;
  includeAzure: boolean;
  includeOffice: boolean;
  includeWindows: boolean;
  includeThirdParty: boolean;
  timeout: number;
  schedule?: { enabled: boolean; cronExpression: string; nextRun?: Date; };
  createdAt: Date;
  updatedAt: Date;
}

export interface LicenseDiscoveryResult {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: LicenseDiscoveryStatus;
  licenses: License[];
  assignments: LicenseAssignment[];
  subscriptions: Subscription[];
  totalLicenses: number;
  totalAssigned: number;
  totalAvailable: number;
  complianceStatus: ComplianceStatus;
  errors: LicenseError[];
  warnings: string[];
}

export interface License {
  id: string;
  skuId: string;
  skuPartNumber: string;
  productName: string;
  servicePlans: ServicePlan[];
  prepaidUnits: { enabled: number; suspended: number; warning: number; };
  consumedUnits: number;
  availableUnits: number;
  appliesTo: LicenseType;
  status: LicenseStatus;
  purchaseDate?: Date;
  expirationDate?: Date;
  autoRenew: boolean;
  cost?: { amount: number; currency: string; billingCycle: string; };
  vendor: string;
}

export interface ServicePlan {
  servicePlanId: string;
  servicePlanName: string;
  provisioningStatus: string;
  appliesTo: string;
}

export interface LicenseAssignment {
  id: string;
  userId: string;
  userPrincipalName: string;
  displayName: string;
  skuId: string;
  assignedDateTime: Date;
  assignedPlans: AssignedPlan[];
  disabledPlans: string[];
  assignmentSource: 'direct' | 'group' | 'inherited';
  groupId?: string;
}

export interface AssignedPlan {
  servicePlanId: string;
  assignedDateTime: Date;
  capabilityStatus: string;
  service: string;
}

export interface Subscription {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  status: LicenseStatus;
  totalLicenses: number;
  assignedLicenses: number;
  startDate: Date;
  endDate: Date;
  isTrial: boolean;
  autoRenew: boolean;
  ownedBy: string;
  createdDateTime: Date;
}

export interface ComplianceStatus {
  isCompliant: boolean;
  underlicensedProducts: string[];
  overlicensedProducts: string[];
  expiringSoon: License[];
  unassignedLicenses: number;
  utilizationRate: number;
}

export interface LicenseError {
  timestamp: Date;
  message: string;
  code?: string;
  skuId?: string;
  userId?: string;
}

export interface LicenseStats {
  totalLicenses: number;
  totalAssigned: number;
  totalAvailable: number;
  utilizationRate: number;
  totalCost: number;
  licensesByProduct: Record<string, number>;
  licensesByStatus: Record<LicenseStatus, number>;
  topCostProducts: { product: string; cost: number; count: number; utilization: number }[];
}

/**
 * Enhanced license statistics with user-centric metrics
 */
export interface EnhancedLicenseStats extends LicenseStats {
  // User-centric metrics
  totalLicensedUsers: number;
  avgLicensesPerUser: number;
  usersWithMultipleLicenses: number;
  usersWithDisabledPlans: number;

  // Assignment analysis
  directAssignments: number;
  groupBasedAssignments: number;
  directAssignmentPercent: number;
  assignmentsBySource: Record<string, number>;

  // Service plan analysis
  totalServicePlans: number;
  enabledServicePlans: number;
  disabledServicePlans: number;

  // Cost analysis
  estimatedMonthlyCost: number;
  costPerMonth: number;
  costPerUser: number;
  wastedLicenseCost: number;

  // Compliance
  expiringCount: number;
  underlicensedCount: number;
  overlicensedCount: number;
  underlicensedProducts: string[];
  overlicensedProducts: string[];
  expiringLicenses: Array<{ skuPartNumber: string; expirationDate: string; daysRemaining: number }>;
}

/**
 * User license assignment from CSV data
 */
export interface UserLicenseAssignment {
  userId: string;
  userPrincipalName: string;
  displayName: string;
  skuId: string;
  skuPartNumber: string;
  assignmentSource: 'Direct' | 'Group' | 'Inherited';
  assignedByGroup?: string;
  disabledPlans: string;
  disabledPlanCount: number;
  lastUpdated?: string;
  assignmentState?: string;
  assignmentError?: string;
  _DataType?: string;
  _DiscoveryTimestamp?: string;
  _DiscoveryModule?: string;
  _SessionId?: string;
}

/**
 * Service plan detail from CSV data
 */
export interface ServicePlanDetail {
  userId: string;
  userPrincipalName: string;
  displayName: string;
  skuId: string;
  skuPartNumber: string;
  servicePlanId: string;
  servicePlanName: string;
  provisioningStatus: 'Success' | 'Disabled' | 'PendingInput' | 'Error' | string;
  appliesTo?: string;
  _DataType?: string;
  _DiscoveryTimestamp?: string;
  _DiscoveryModule?: string;
  _SessionId?: string;
}

/**
 * License/Subscription from enhanced CSV data
 */
export interface LicenseSubscription {
  skuId: string;
  skuPartNumber: string;
  consumedUnits: number;
  prepaidUnits: number;
  availableUnits: number;
  utilizationPercent: number;
  suspendedUnits?: number;
  warningUnits?: number;
  status: 'Active' | 'Warning' | 'Suspended' | 'LockedOut' | string;
  appliesTo?: string;
  servicePlanCount: number;
  servicePlans: string;
  _DataType?: string;
  _DiscoveryTimestamp?: string;
  _DiscoveryModule?: string;
  _SessionId?: string;
}

/**
 * Summary statistics from CSV data
 */
export interface LicensingSummary {
  totalLicenses: number;
  totalAssigned: number;
  totalAvailable: number;
  utilizationPercent: number;
  licensedUsers: number;
  totalAssignments: number;
  directAssignments: number;
  groupBasedAssignments: number;
  directAssignmentPercent: number;
  avgLicensesPerUser: number;
  totalServicePlans: number;
  enabledServicePlans: number;
  disabledServicePlans: number;
  uniqueProducts: number;
  discoveryTimestamp: string;
  _DataType?: string;
}

export interface LicenseFilterState {
  searchText: string;
  selectedProducts: string[];
  selectedStatuses: LicenseStatus[];
  showOnlyExpiring: boolean;
  showOnlyUnassigned: boolean;
}

/**
 * Combined licensing data state for views
 */
export interface LicensingDataState {
  licenses: LicenseSubscription[];
  userAssignments: UserLicenseAssignment[];
  servicePlans: ServicePlanDetail[];
  summary: LicensingSummary | null;
  isLoading: boolean;
  error: string | null;
}


