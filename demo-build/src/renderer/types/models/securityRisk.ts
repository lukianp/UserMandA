/**
 * Security risk and posture data model from CSV files
 */
export interface SecurityRiskData {
  resourceName: string;
  resourceType: string;
  riskType: string;
  riskLevel: string;
  description: string;
  recommendation: string;
  category: string;
  severity: string;
  status: string;
  owner: string;
  domain: string;
  location: string;
  detectedDate: Date | null;
  lastSeen: Date | null;
  dueDate: Date | null;
  isResolved: boolean;
  resolutionNotes: string;
  riskIcon: string;
  statusIcon: string;
  categoryIcon: string;
  severityColor: string;
  isOverdue: boolean;
  timeToResolution: string;
}


