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
