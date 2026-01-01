/**
 * Certification and Audit Types
 *
 * Tracks compliance certifications, audit results, and certification management
 */

export interface CertificationMetrics {
  totalCertifications: number;
  activeCertifications: number;
  expiringSoon: number; // Within 90 days
  expired: number;
  renewalsPending: number;
  auditScore: number; // 0-100
  findingsCount: number;
  remediatedFindings: number;
}

export interface Certification {
  id: string;
  name: string;
  type: 'iso27001' | 'soc2' | 'hipaa' | 'gdpr' | 'pci' | 'fedramp' | 'custom';
  status: 'active' | 'pending' | 'expired' | 'suspended';
  issueDate: Date;
  expiryDate: Date;
  issuingBody: string;
  scope: string;
  certificateNumber: string;
  contactPerson: string;
  nextAuditDate?: Date;
  documents: CertificationDocument[];
}

export interface CertificationDocument {
  id: string;
  name: string;
  type: 'certificate' | 'audit_report' | 'evidence' | 'policy';
  uploadDate: Date;
  fileSize: number;
  filePath: string;
}

export interface AuditResult {
  id: string;
  certificationId: string;
  certificationName: string;
  auditDate: Date;
  auditor: string;
  auditType: 'initial' | 'surveillance' | 'recertification' | 'special';
  status: 'passed' | 'passed_with_observations' | 'failed';
  score: number;
  findings: AuditFinding[];
  recommendations: string[];
  nextSteps: string;
}

export interface AuditFinding {
  id: string;
  severity: 'critical' | 'major' | 'minor' | 'observation';
  category: string;
  finding: string;
  evidence: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  assignedTo?: string;
  dueDate?: Date;
  resolvedDate?: Date;
}

export interface ComplianceControl {
  id: string;
  controlId: string;
  name: string;
  description: string;
  certifications: string[]; // Which certifications require this
  status: 'implemented' | 'partial' | 'not_implemented';
  effectivenessRating: number; // 0-100
  lastReviewed: Date;
  owner: string;
  evidence: string[];
}

export interface CertificationTimeline {
  date: Date;
  event: 'issued' | 'renewed' | 'audit' | 'finding' | 'remediation' | 'expiry_warning';
  certificationName: string;
  description: string;
  severity?: 'info' | 'warning' | 'critical';
}

export interface CertificationData {
  metrics: CertificationMetrics;
  certifications: Certification[];
  auditResults: AuditResult[];
  controls: ComplianceControl[];
  timeline: CertificationTimeline[];
  upcomingAudits: UpcomingAudit[];
}

export interface UpcomingAudit {
  id: string;
  certificationName: string;
  auditType: 'surveillance' | 'recertification';
  scheduledDate: Date;
  auditor: string;
  preparationStatus: 'not_started' | 'in_progress' | 'ready';
  daysUntil: number;
  requiredDocuments: string[];
  contactPerson: string;
}

export interface CertificationFilter {
  searchText?: string;
  type?: Certification['type'];
  status?: Certification['status'];
}


