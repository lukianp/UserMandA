/**
 * Data Loss Prevention Discovery Types
 */

export type DLPDiscoveryStatus = 'idle' | 'discovering' | 'completed' | 'failed' | 'cancelled';
export type DLPMode = 'enable' | 'testWithNotifications' | 'testWithoutNotifications' | 'disable';

export interface DLPDiscoveryConfig {
  id: string;
  name: string;
  tenantId: string;
  includePolicies: boolean;
  includeRules: boolean;
  includeIncidents: boolean;
  timeout: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DLPDiscoveryResult {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  status: DLPDiscoveryStatus;
  policies: DLPPolicy[];
  rules: DLPRule[];
  incidents: DLPIncident[];
  sensitiveInfoTypes: SensitiveInfoType[];
  totalPoliciesFound: number;
  errors: DLPError[];
  warnings: string[];
}

export interface DLPPolicy {
  id: string;
  name: string;
  description?: string;
  mode: DLPMode;
  createdDateTime: Date;
  lastModifiedDateTime: Date;
  priority: number;
  locations: PolicyLocation[];
  rules: string[];
  isEnabled: boolean;
}

export interface PolicyLocation {
  name: string;
  enabled: boolean;
  type: 'Exchange' | 'SharePoint' | 'OneDrive' | 'Teams' | 'EndpointDevices';
}

export interface DLPRule {
  id: string;
  name: string;
  policyId: string;
  priority: number;
  mode: DLPMode;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isEnabled: boolean;
}

export interface RuleCondition {
  type: string;
  sensitiveInfoTypes?: string[];
  contentContainsSensitiveInformation?: boolean;
  contentIsSharedFrom?: string;
  senderDomainIs?: string[];
  recipientDomainIs?: string[];
  documentNameMatchesWords?: string[];
  documentSizeOver?: number;
}

export interface RuleAction {
  type: string;
  blockAccess?: boolean;
  blockAccessScope?: string;
  notifyUser?: boolean;
  notifyUserMessage?: string;
  allowOverride?: boolean;
  requireJustification?: boolean;
  generateIncidentReport?: boolean;
  notifyEmail?: string[];
  encryptContent?: boolean;
  removeHeader?: boolean;
  applyWatermark?: boolean;
}

export interface DLPIncident {
  id: string;
  policyId: string;
  policyName: string;
  ruleId: string;
  ruleName: string;
  createdDateTime: Date;
  lastModifiedDateTime: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  source: string;
  location: string;
  userPrincipalName: string;
  fileName?: string;
  fileSize?: number;
  matchedSensitiveTypes: string[];
  actionTaken: string;
  justification?: string;
}

export interface SensitiveInfoType {
  id: string;
  name: string;
  description?: string;
  publisherName?: string;
  state: 'enabled' | 'disabled';
  rulePackId?: string;
}

export interface DLPError {
  timestamp: Date;
  message: string;
  policyId?: string;
}

export interface DLPStats {
  totalPolicies: number;
  enabledPolicies: number;
  totalIncidents: number;
  incidentsBySeverity: Record<string, number>;
  topPoliciesByIncidents: { policyName: string; count: number; }[];
}

export interface DLPFilterState {
  searchText: string;
  selectedModes: DLPMode[];
  selectedSeverities: string[];
  showOnlyEnabled: boolean;
}
