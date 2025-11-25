/**
 * Security Dashboard and Overview Types
 *
 * Comprehensive security metrics, threat indicators, and compliance status
 */

export interface SecurityDashboardMetrics {
  // Overall Security
  overallSecurityScore: number; // 0-100
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeThreats: number;
  resolvedThreats: number;

  // Identity Security
  totalUsers: number;
  compromisedAccounts: number;
  suspiciousLogins: number;
  mfaAdoption: number; // percentage

  // Device Security
  totalDevices: number;
  compliantDevices: number;
  nonCompliantDevices: number;
  quarantinedDevices: number;

  // Data Protection
  encryptedData: number; // percentage
  dlpPolicies: number;
  dlpViolations: number;
  dataExfiltrationAttempts: number;

  // Access Control
  totalGroups: number;
  overPrivilegedGroups: number;
  orphanedAccounts: number;
  stalePermissions: number;

  // Compliance
  complianceScore: number; // percentage
  totalPolicies: number;
  violatedPolicies: number;
  pendingRemediation: number;
}

export interface SecurityAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'identity' | 'device' | 'data' | 'network' | 'compliance';
  title: string;
  description: string;
  affectedEntities: number;
  detectedAt: Date;
  status: 'new' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: string;
  remediation?: string;
}

export interface ThreatIndicator {
  id: string;
  type: 'malware' | 'phishing' | 'ransomware' | 'data_breach' | 'insider_threat';
  name: string;
  description: string;
  riskScore: number; // 0-100
  detectedCount: number;
  affectedUsers: string[];
  affectedDevices: string[];
  firstSeen: Date;
  lastSeen: Date;
  mitigation: string;
}

export interface CompliancePolicy {
  id: string;
  name: string;
  category: 'gdpr' | 'hipaa' | 'sox' | 'pci' | 'iso27001' | 'custom';
  description: string;
  enabled: boolean;
  compliance: number; // percentage
  violations: number;
  lastAssessed: Date;
  controls: ComplianceControl[];
}

export interface ComplianceControl {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  remediation?: string;
}

export interface SecurityTrend {
  date: Date;
  securityScore: number;
  threats: number;
  vulnerabilities: number;
  incidents: number;
}

export interface VulnerabilityReport {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedSystems: number;
  cve?: string;
  publishedDate: Date;
  patchAvailable: boolean;
  exploitAvailable: boolean;
  remediation: string;
}

export interface SecurityDashboardData {
  metrics: SecurityDashboardMetrics;
  alerts: SecurityAlert[];
  threats: ThreatIndicator[];
  policies: CompliancePolicy[];
  trends: SecurityTrend[];
  vulnerabilities: VulnerabilityReport[];
  recommendations: SecurityRecommendation[];
}

export interface SecurityRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  affectedCount: number;
}

export interface SecurityFilter {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  status?: string;
  searchText?: string;
}
