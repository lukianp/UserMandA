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
  topCostProducts: { product: string; cost: number; count: number; }[];
}

export interface LicenseFilterState {
  searchText: string;
  selectedProducts: string[];
  selectedStatuses: LicenseStatus[];
  showOnlyExpiring: boolean;
  showOnlyUnassigned: boolean;
}
