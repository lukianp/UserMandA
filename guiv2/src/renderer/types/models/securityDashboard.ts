/**
 * Dashboard metrics for the Group Policy & Security view
 */
export interface SecurityDashboardMetrics {
  groupPolicyCount: number;
  securityGroupCount: number;
  infrastructureItemCount: number;
  threatIndicatorCount: number;
  complianceScore: number;
  passedControls: number;
  failedControls: number;
  totalControls: number;
  activeThreats: number;
  criticalRisks: number;
  highRisks: number;
  lastUpdated: Date | string | null;
  pendingControls: number;
  complianceStatus: string;
  complianceColor: string;
  threatStatus: string;
  securityPosture: string;
}


