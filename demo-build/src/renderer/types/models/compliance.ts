/**
 * Compliance assessment data model
 */
export interface ComplianceItem {
  controlId: string | null;
  framework: string | null;
  title: string | null;
  status: string | null;
  riskLevel: string | null;
  owner: string | null;
  dueDate: Date | string | null;
  description: string | null;
  evidence: string | null;
  remediation: string | null;
  score: number;
  category: string | null;
  isSelected?: boolean;
  id?: string | null;
  statusIcon: string;
  riskIcon: string;
  frameworkIcon: string;
  statusColor: string;
  isOverdue: boolean;
  timeToDeadline: string;
}

/**
 * Compliance Dashboard Metrics
 * Overall compliance posture and framework adherence
 */
export interface ComplianceDashboardMetrics {
  overallScore: number;
  compliantControls: number;
  nonCompliantControls: number;
  partiallyCompliantControls: number;
  totalControls: number;
  criticalFindings: number;
  highRiskFindings: number;
  mediumRiskFindings: number;
  lowRiskFindings: number;
  overdueItems: number;
  upcomingDeadlines: number;
  complianceTrend: number;
  lastAssessmentDate: Date;
  nextAssessmentDate?: Date;
}

/**
 * Framework compliance summary
 */
export interface FrameworkComplianceSummary {
  frameworkId: string;
  frameworkName: string;
  description: string;
  version: string;
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  partiallyCompliantControls: number;
  compliancePercentage: number;
  lastAuditDate?: Date;
  nextAuditDate?: Date;
  certificationStatus: 'Certified' | 'InProgress' | 'NotCertified' | 'Expired';
  auditor?: string;
}

/**
 * Compliance finding/gap
 */
export interface ComplianceFinding {
  id: string;
  controlId: string;
  framework: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  status: 'Open' | 'InRemediation' | 'Resolved' | 'Accepted';
  owner: string;
  discoveredDate: Date;
  dueDate?: Date;
  resolvedDate?: Date;
  evidence?: string[];
  relatedControls: string[];
}

/**
 * Compliance trend data point
 */
export interface ComplianceTrendData {
  date: string;
  overallScore: number;
  compliantControls: number;
  nonCompliantControls: number;
  partiallyCompliantControls: number;
}

/**
 * Control category summary
 */
export interface ControlCategorySummary {
  category: string;
  totalControls: number;
  compliantControls: number;
  compliancePercentage: number;
  criticalGaps: number;
}

/**
 * Compliance assessment result
 */
export interface ComplianceAssessmentResult {
  assessmentId: string;
  assessmentDate: Date;
  framework: string;
  scope: string;
  auditor: string;
  overallScore: number;
  findings: ComplianceFinding[];
  recommendations: string[];
  nextSteps: string[];
  reportUrl?: string;
}

/**
 * Complete compliance dashboard data
 */
export interface ComplianceDashboardData {
  metrics: ComplianceDashboardMetrics;
  frameworks: FrameworkComplianceSummary[];
  findings: ComplianceFinding[];
  trends: ComplianceTrendData[];
  controlCategories: ControlCategorySummary[];
  recentAssessments: ComplianceAssessmentResult[];
  upcomingDeadlines: ComplianceItem[];
}


