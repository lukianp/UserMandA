/**
 * Data Classification Type Definitions
 * Enterprise data governance and sensitivity labeling system
 */

/**
 * Classification level
 */
export type ClassificationLevel = 'Public' | 'Internal' | 'Confidential' | 'Restricted' | 'TopSecret';

/**
 * Data asset type
 */
export type DataAssetType = 'File' | 'Database' | 'Email' | 'SharePoint' | 'OneDrive' | 'Teams' | 'Application' | 'Cloud' | 'OnPremise';

/**
 * Classified data item
 */
export interface ClassifiedDataItem {
  id: string;
  name: string;
  path: string;
  assetType: DataAssetType;
  classificationLevel: ClassificationLevel;
  sensitivityScore: number;
  owner: string;
  department: string;
  createdDate: Date;
  modifiedDate: Date;
  lastAccessedDate?: Date;
  size: number;
  detectedLabels: string[];
  appliedLabels: string[];
  encryptionStatus: 'Encrypted' | 'NotEncrypted' | 'Unknown';
  dlpPolicies: string[];
  complianceFlags: string[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  requiresReview: boolean;
  isPubliclyAccessible: boolean;
  hasExternalSharing: boolean;
}

/**
 * Data classification metrics
 */
export interface DataClassificationMetrics {
  totalAssets: number;
  classifiedAssets: number;
  unclassifiedAssets: number;
  publicAssets: number;
  internalAssets: number;
  confidentialAssets: number;
  restrictedAssets: number;
  topSecretAssets: number;
  encryptedAssets: number;
  unencryptedSensitiveAssets: number;
  assetsWithDlpPolicies: number;
  assetsWithExternalSharing: number;
  highRiskAssets: number;
  assetsRequiringReview: number;
  classificationCoveragePercentage: number;
  averageSensitivityScore: number;
}

/**
 * Classification by department
 */
export interface DepartmentClassificationSummary {
  department: string;
  totalAssets: number;
  publicAssets: number;
  internalAssets: number;
  confidentialAssets: number;
  restrictedAssets: number;
  highRiskAssets: number;
  averageSensitivityScore: number;
}

/**
 * Classification by asset type
 */
export interface AssetTypeClassificationSummary {
  assetType: DataAssetType;
  totalAssets: number;
  classifiedAssets: number;
  unclassifiedAssets: number;
  averageSensitivityScore: number;
  highRiskCount: number;
}

/**
 * Sensitive data pattern detection
 */
export interface SensitiveDataPattern {
  patternId: string;
  patternName: string;
  category: 'PII' | 'PHI' | 'PCI' | 'Intellectual Property' | 'Credentials' | 'Financial' | 'Legal';
  description: string;
  detectionCount: number;
  affectedAssets: number;
  lastDetected: Date;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  exampleMatches?: string[];
}

/**
 * Data classification policy
 */
export interface ClassificationPolicy {
  policyId: string;
  policyName: string;
  description: string;
  classificationLevel: ClassificationLevel;
  autoClassificationRules: AutoClassificationRule[];
  encryptionRequired: boolean;
  dlpPoliciesRequired: string[];
  retentionPeriod?: number;
  allowExternalSharing: boolean;
  requiresApprovalForSharing: boolean;
  isActive: boolean;
}

/**
 * Auto-classification rule
 */
export interface AutoClassificationRule {
  ruleId: string;
  ruleName: string;
  conditions: RuleCondition[];
  targetClassificationLevel: ClassificationLevel;
  confidence: number;
  isEnabled: boolean;
}

/**
 * Rule condition
 */
export interface RuleCondition {
  field: string;
  operator: 'contains' | 'equals' | 'matches' | 'greaterThan' | 'lessThan';
  value: string | number;
}

/**
 * Classification recommendation
 */
export interface ClassificationRecommendation {
  assetId: string;
  currentClassification?: ClassificationLevel;
  recommendedClassification: ClassificationLevel;
  confidence: number;
  reasons: string[];
  detectedPatterns: string[];
  suggestedActions: string[];
}

/**
 * Classification audit entry
 */
export interface ClassificationAuditEntry {
  id: string;
  assetId: string;
  assetName: string;
  action: 'Created' | 'Modified' | 'Deleted' | 'Reclassified' | 'Accessed' | 'Shared';
  previousClassification?: ClassificationLevel;
  newClassification?: ClassificationLevel;
  performedBy: string;
  performedDate: Date;
  reason?: string;
  autoClassified: boolean;
}

/**
 * Complete data classification dashboard data
 */
export interface DataClassificationData {
  metrics: DataClassificationMetrics;
  classifiedAssets: ClassifiedDataItem[];
  departmentSummaries: DepartmentClassificationSummary[];
  assetTypeSummaries: AssetTypeClassificationSummary[];
  sensitivePatterns: SensitiveDataPattern[];
  policies: ClassificationPolicy[];
  recommendations: ClassificationRecommendation[];
  recentAuditEntries: ClassificationAuditEntry[];
}

/**
 * Classification filter options
 */
export interface ClassificationFilter {
  classificationLevels?: ClassificationLevel[];
  assetTypes?: DataAssetType[];
  departments?: string[];
  riskLevels?: string[];
  encryptionStatus?: string[];
  hasExternalSharing?: boolean;
  requiresReview?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  searchText?: string;
}


