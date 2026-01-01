export type EvidenceSource =
  | "manual"
  | "discovery"
  | "import"
  | "api";

export type LicenseMetricUnit =
  | "user"
  | "device"
  | "server"
  | "processor"
  | "core"
  | "concurrent"
  | "subscription"
  | "storage_gb"
  | "unknown";

export interface LicensingEvidence {
  source: EvidenceSource;
  sourceModule?: string;
  sourceFile?: string;
  sourceRecordId?: string;
  capturedAt: string;
  notes?: string;
}

export interface LicensingVendor {
  vendorId: string;
  name: string;
  website?: string;
}

export interface LicensingProduct {
  productId: string;
  vendorId: string;
  name: string;
  category: "SaaS" | "OnPrem" | "IaaS" | "PaaS" | "Hybrid" | "Unknown";
  normalizedKey: string;
  evidence: LicensingEvidence[];
}

export interface LicensingAgreement {
  agreementId: string;
  vendorId: string;
  name: string;
  agreementType: "EA" | "CSP" | "MCA" | "Subscription" | "Perpetual" | "Support" | "Unknown";
  startDate?: string;
  endDate?: string;
  renewalDate?: string;
  owner?: string;
  costCenter?: string;
  notes?: string;
  evidence: LicensingEvidence[];
}

export interface LicenseEntitlement {
  entitlementId: string;
  agreementId?: string;
  productId: string;
  sku?: string;
  metric: LicenseMetricUnit;
  quantity: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  annualCost?: number;
  currency?: string;
  isActive: boolean;
  evidence: LicensingEvidence[];
}

export interface LicenseAssignment {
  assignmentId: string;
  entitlementId?: string;
  productId: string;
  assigneeType: "user" | "device" | "server" | "group";
  assigneeId: string;
  assignedOn?: string;
  source: EvidenceSource;
  evidence: LicensingEvidence[];
}

export interface LicenseConsumption {
  consumptionId: string;
  productId: string;
  metric: LicenseMetricUnit;
  quantity: number;
  measuredAt: string;
  breakdown?: Record<string, number>;
  source: EvidenceSource;
  evidence: LicensingEvidence[];
}

export interface EffectiveLicensePosition {
  productId: string;
  metric: LicenseMetricUnit;
  entitled: number;
  consumed: number;
  delta: number;
  status: "over" | "under" | "balanced" | "unknown";
  confidence: "high" | "medium" | "low";
  lastComputedAt: string;
  notes?: string;
}

export interface LicensingAlert {
  alertId: string;
  severity: "critical" | "warning" | "info";
  category:
    | "agreement_expired"
    | "agreement_renewal_due"
    | "under_licensed"
    | "over_licensed"
    | "unused_entitlement"
    | "unsupported_software"
    | "eol_eos"
    | "discovery_gap"
    | "azure_cost_spike"
    | "migration_double_run"
    | "unknown";
  title: string;
  detail: string;
  related?: {
    vendorId?: string;
    agreementId?: string;
    productId?: string;
    entitlementId?: string;
  };
  createdAt: string;
  evidence: LicensingEvidence[];
}

export interface CanonicalUserRef {
  userId: string;
  displayName?: string;
  upn?: string;
  samAccountName?: string;
  source: "Entra" | "AD" | "Unknown";
}

export interface CanonicalDeviceRef {
  deviceId: string;
  name?: string;
  os?: string;
  lastSeen?: string;
  source: "Entra" | "Intune" | "AD" | "Unknown";
}

export interface LicensingHubState {
  version: 1;
  companyProfileId: string;
  lastUpdatedAt: string;
  vendors: LicensingVendor[];
  products: LicensingProduct[];
  agreements: LicensingAgreement[];
  entitlements: LicenseEntitlement[];
  assignments: LicenseAssignment[];
  consumptions: LicenseConsumption[];
  effectivePositions: EffectiveLicensePosition[];
  alerts: LicensingAlert[];
  canonicalUsers: CanonicalUserRef[];
  canonicalDevices: CanonicalDeviceRef[];
  normalizationRules: {
    productAliases: Record<string, string>;
    vendorAliases: Record<string, string>;
  };
}