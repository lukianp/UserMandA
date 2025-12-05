/**
 * Privileged Access Management Types
 *
 * Defines interfaces for managing privileged accounts, admin roles,
 * elevated permissions, and just-in-time access monitoring.
 */

export interface PrivilegedAccessMetrics {
  totalAdminAccounts: number;
  activeAdminAccounts: number;
  inactiveAdminAccounts: number;
  globalAdmins: number;
  cloudAdmins: number;
  serviceAccounts: number;
  emergencyAccess: number;
  elevatedSessions: number;
  jitAccessRequests: number;
  privilegeEscalations: number;
  mfaCompliance: number; // percentage
  securityScore: number; // 0-100
}

export interface PrivilegedAccount {
  id: string;
  accountName: string;
  accountType: 'user' | 'service' | 'emergency';
  isActive: boolean;
  createdDate: Date;
  lastLogon?: Date;
  roles: AdminRole[];
  mfaEnabled: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  owner: string;
}

export interface AdminRole {
  id: string;
  roleName: string;
  roleType: 'global' | 'cloud' | 'application' | 'privileged';
  assignmentType: 'permanent' | 'eligible' | 'temporary';
  assignedDate: Date;
  expiryDate?: Date;
  scope: string;
  justification?: string;
}

export interface ElevatedSession {
  id: string;
  userId: string;
  userName: string;
  roleName: string;
  sessionStart: Date;
  sessionEnd?: Date;
  duration: number; // minutes
  status: 'active' | 'expired' | 'revoked';
  justification: string;
  approver?: string;
  activitiesPerformed: string[];
}

export interface JITAccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  targetRole: string;
  targetResource: string;
  requestedDuration: number; // hours
  justification: string;
  requestTime: Date;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  approver?: string;
  approvalTime?: Date;
  activationTime?: Date;
}

export interface PrivilegeEscalation {
  id: string;
  userId: string;
  userName: string;
  fromRole: string;
  toRole: string;
  escalationTime: Date;
  method: 'manual' | 'automatic' | 'inherited';
  approved: boolean;
  reviewer?: string;
  riskScore: number;
}

export interface EmergencyAccessAccount {
  id: string;
  accountName: string;
  purpose: string;
  isActive: boolean;
  lastUsed?: Date;
  passwordLastChanged: Date;
  assignedUsers: string[];
  accessLevel: string;
}

export interface PrivilegedAccessData {
  metrics: PrivilegedAccessMetrics;
  privilegedAccounts: PrivilegedAccount[];
  elevatedSessions: ElevatedSession[];
  jitRequests: JITAccessRequest[];
  privilegeEscalations: PrivilegeEscalation[];
  emergencyAccounts: EmergencyAccessAccount[];
  complianceStatus: ComplianceStatus;
}

export interface ComplianceStatus {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  lastAssessment: Date;
  findings: ComplianceFinding[];
}

export interface ComplianceFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  finding: string;
  recommendation: string;
  affected: number;
}

export interface PrivilegedAccessFilter {
  searchText: string;
  accountType?: 'user' | 'service' | 'emergency';
  status?: 'active' | 'inactive';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}
