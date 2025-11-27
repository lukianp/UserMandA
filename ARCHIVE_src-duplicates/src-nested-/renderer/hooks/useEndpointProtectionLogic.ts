import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Endpoint device information
 */
interface Endpoint {
  id: string;
  hostname: string;
  ipAddress: string;
  macAddress: string;
  osType: string;
  osVersion: string;
  lastSeen: string;
  status: 'online' | 'offline' | 'quarantined' | 'compromised';
  securityAgentVersion?: string;
  policies: string[]; // Policy IDs
  vulnerabilities: string[]; // Vulnerability IDs
  complianceStatus: ComplianceStatus;
  installedSoftware: Software[];
  networkInterfaces: NetworkInterface[];
  hardwareInfo: HardwareInfo;
  location?: string;
  department?: string;
  owner?: string;
}

/**
 * Installed software information
 */
interface Software {
  id: string;
  name: string;
  version: string;
  vendor: string;
  installDate: string;
  isManaged: boolean;
  vulnerabilities: string[];
}

/**
 * Network interface information
 */
interface NetworkInterface {
  id: string;
  name: string;
  ipAddress: string;
  macAddress: string;
  type: 'ethernet' | 'wifi' | 'bluetooth';
  isActive: boolean;
}

/**
 * Hardware information
 */
interface HardwareInfo {
  cpu: string;
  ram: string;
  storage: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
}

/**
 * Security policy definition
 */
interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'endpoint' | 'network' | 'application' | 'data';
  priority: 'low' | 'medium' | 'high' | 'critical';
  rules: PolicyRule[];
  scope: PolicyScope;
  created: string;
  modified: string;
  author: string;
  version: string;
  isActive: boolean;
  complianceCheck: boolean;
  autoRemediate: boolean;
}

/**
 * Policy rule definition
 */
interface PolicyRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: 'allow' | 'block' | 'monitor' | 'quarantine' | 'alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

/**
 * Policy scope definition
 */
interface PolicyScope {
  allEndpoints: boolean;
  specificEndpoints: string[];
  groups: string[];
  departments: string[];
  locations: string[];
  osTypes: string[];
}

/**
 * Threat information
 */
interface Threat {
  id: string;
  type: 'malware' | 'ransomware' | 'phishing' | 'intrusion' | 'data_exfiltration' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  source: string;
  affectedEndpoints: string[];
  detectionTime: string;
  description: string;
  indicators: ThreatIndicator[];
  status: 'active' | 'contained' | 'resolved' | 'false_positive';
  responseActions: ResponseAction[];
  mitigationSteps: string[];
  impact: ThreatImpact;
}

/**
 * Threat indicator
 */
interface ThreatIndicator {
  type: 'file' | 'process' | 'network' | 'registry' | 'behavior';
  value: string;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
}

/**
 * Response action
 */
interface ResponseAction {
  id: string;
  type: 'isolate' | 'quarantine' | 'remove' | 'block' | 'alert' | 'scan';
  status: 'pending' | 'executing' | 'completed' | 'failed';
  executedAt?: string;
  result?: string;
}

/**
 * Threat impact assessment
 */
interface ThreatImpact {
  endpointsAffected: number;
  dataCompromised: boolean;
  downtimeMinutes: number;
  financialImpact: number;
  recoveryTime: string;
}

/**
 * Security incident
 */
interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'contained' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  reportedBy: string;
  assignedTo?: string;
  created: string;
  updated: string;
  resolvedAt?: string;
  affectedEndpoints: string[];
  threats: string[];
  vulnerabilities: string[];
  timeline: IncidentEvent[];
  evidence: Evidence[];
  resolution: string;
  lessonsLearned: string;
}

/**
 * Incident timeline event
 */
interface IncidentEvent {
  id: string;
  timestamp: string;
  type: 'detection' | 'investigation' | 'response' | 'resolution' | 'update';
  description: string;
  actor: string;
  details: any;
}

/**
 * Evidence for incident
 */
interface Evidence {
  id: string;
  type: 'log' | 'screenshot' | 'file' | 'network_traffic' | 'memory_dump';
  description: string;
  collectedAt: string;
  source: string;
  data: any;
}

/**
 * Vulnerability information
 */
interface Vulnerability {
  id: string;
  cveId?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cvssScore: number;
  cvssVector: string;
  published: string;
  modified: string;
  affectedSoftware: string[];
  affectedEndpoints: string[];
  remediation: Remediation[];
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk' | 'false_positive';
  exploitability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  references: string[];
}

/**
 * Remediation information
 */
interface Remediation {
  id: string;
  type: 'patch' | 'configuration' | 'workaround' | 'mitigation';
  description: string;
  effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
  automated: boolean;
  status: 'available' | 'in_progress' | 'completed' | 'failed';
}

/**
 * Patch information
 */
interface Patch {
  id: string;
  title: string;
  description: string;
  kbArticle?: string;
  vendor: string;
  product: string;
  version: string;
  releaseDate: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  prerequisites: string[];
  conflicts: string[];
  size: number;
  downloadUrl?: string;
  deploymentStatus: PatchDeploymentStatus[];
  vulnerabilitiesFixed: string[];
  rollbackSupported: boolean;
}

/**
 * Patch deployment status
 */
interface PatchDeploymentStatus {
  endpointId: string;
  status: 'not_deployed' | 'downloading' | 'installing' | 'installed' | 'failed' | 'rolled_back';
  scheduledAt?: string;
  deployedAt?: string;
  failedAt?: string;
  errorMessage?: string;
  rollbackReason?: string;
}

/**
 * Compliance status
 */
interface ComplianceStatus {
  endpointId: string;
  overall: 'compliant' | 'non_compliant' | 'partial';
  score: number; // 0-100
  lastChecked: string;
  policies: PolicyCompliance[];
  standards: StandardCompliance[];
  issues: ComplianceIssue[];
}

/**
 * Policy compliance
 */
interface PolicyCompliance {
  policyId: string;
  compliant: boolean;
  violations: string[];
  lastChecked: string;
  remediationRequired: boolean;
}

/**
 * Standard compliance (e.g., NIST, CIS, etc.)
 */
interface StandardCompliance {
  standardId: string;
  standardName: string;
  compliant: boolean;
  score: number;
  requirements: RequirementCompliance[];
}

/**
 * Requirement compliance
 */
interface RequirementCompliance {
  requirementId: string;
  description: string;
  compliant: boolean;
  evidence?: string;
}

/**
 * Compliance issue
 */
interface ComplianceIssue {
  id: string;
  type: 'policy_violation' | 'standard_non_compliance' | 'configuration_drift';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedEntities: string[];
  remediation: string;
  status: 'open' | 'in_progress' | 'resolved';
  created: string;
}

/**
 * Security report
 */
interface SecurityReport {
  id: string;
  title: string;
  type: 'threat_summary' | 'vulnerability_assessment' | 'compliance_audit' | 'incident_report' | 'executive_summary';
  period: {
    start: string;
    end: string;
  };
  generatedAt: string;
  generatedBy: string;
  data: any;
  format: 'pdf' | 'html' | 'json' | 'csv';
  recipients: string[];
  status: 'generating' | 'ready' | 'failed';
  downloadUrl?: string;
}

/**
 * Dashboard metrics
 */
interface DashboardMetrics {
  endpoints: {
    total: number;
    online: number;
    offline: number;
    quarantined: number;
    compromised: number;
  };
  threats: {
    active: number;
    contained: number;
    resolved: number;
    bySeverity: Record<string, number>;
  };
  incidents: {
    total: number;
    open: number;
    resolved: number;
    bySeverity: Record<string, number>;
  };
  vulnerabilities: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byStatus: Record<string, number>;
  };
  patches: {
    available: number;
    deployed: number;
    failed: number;
    pending: number;
  };
  compliance: {
    overallScore: number;
    compliantEndpoints: number;
    nonCompliantEndpoints: number;
    policyViolations: number;
  };
  alerts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  lastUpdated: string;
}

/**
 * Complete endpoint protection data
 */
interface EndpointProtectionData {
  endpoints: Endpoint[];
  policies: SecurityPolicy[];
  threats: Threat[];
  incidents: Incident[];
  vulnerabilities: Vulnerability[];
  patches: Patch[];
  complianceStatuses: ComplianceStatus[];
  reports: SecurityReport[];
  dashboardMetrics: DashboardMetrics;
  alerts: Alert[];
}

/**
 * Security alert
 */
interface Alert {
  id: string;
  type: 'threat_detected' | 'policy_violation' | 'vulnerability_found' | 'compliance_issue' | 'endpoint_offline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedEndpoint?: string;
  created: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
  escalationLevel: number;
}

/**
 * Hook return type
 */
interface UseEndpointProtectionLogicReturn {
  protectionData: EndpointProtectionData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date;

  // Endpoint management
  getEndpoints: (filters?: EndpointFilters) => Endpoint[];
  getEndpoint: (endpointId: string) => Endpoint | null;
  updateEndpoint: (endpointId: string, updates: Partial<Endpoint>) => Promise<Endpoint>;
  quarantineEndpoint: (endpointId: string, reason: string) => Promise<boolean>;
  unquarantineEndpoint: (endpointId: string) => Promise<boolean>;
  scanEndpoint: (endpointId: string, scanType: 'quick' | 'full' | 'vulnerability') => Promise<string>; // returns scan job ID

  // Security policy management
  createPolicy: (policy: Partial<SecurityPolicy>) => Promise<SecurityPolicy>;
  updatePolicy: (policyId: string, updates: Partial<SecurityPolicy>) => Promise<SecurityPolicy>;
  deletePolicy: (policyId: string) => Promise<boolean>;
  assignPolicyToEndpoint: (policyId: string, endpointId: string) => Promise<boolean>;
  unassignPolicyFromEndpoint: (policyId: string, endpointId: string) => Promise<boolean>;
  getPolicyCompliance: (policyId: string) => PolicyCompliance[];

  // Threat detection and response
  detectThreats: () => Promise<Threat[]>;
  getThreats: (filters?: ThreatFilters) => Threat[];
  getThreat: (threatId: string) => Threat | null;
  respondToThreat: (threatId: string, actions: ResponseAction[]) => Promise<boolean>;
  updateThreatStatus: (threatId: string, status: Threat['status']) => Promise<Threat>;
  getThreatIntelligence: (threatType: string) => Promise<any>;

  // Incident management
  createIncident: (incident: Partial<Incident>) => Promise<Incident>;
  updateIncident: (incidentId: string, updates: Partial<Incident>) => Promise<Incident>;
  assignIncident: (incidentId: string, assignee: string) => Promise<boolean>;
  resolveIncident: (incidentId: string, resolution: string) => Promise<Incident>;
  getIncidents: (filters?: IncidentFilters) => Incident[];
  getIncident: (incidentId: string) => Incident | null;
  addIncidentEvent: (incidentId: string, event: Omit<IncidentEvent, 'id'>) => Promise<boolean>;

  // Vulnerability assessment
  scanForVulnerabilities: (endpointIds?: string[]) => Promise<string>; // returns scan job ID
  getVulnerabilities: (filters?: VulnerabilityFilters) => Vulnerability[];
  getVulnerability: (vulnerabilityId: string) => Vulnerability | null;
  prioritizeVulnerabilities: (vulnerabilities: Vulnerability[]) => Vulnerability[];
  remediateVulnerability: (vulnerabilityId: string, remediation: Remediation) => Promise<boolean>;
  acceptRisk: (vulnerabilityId: string, reason: string) => Promise<boolean>;

  // Patch management
  getAvailablePatches: (endpointId?: string) => Patch[];
  schedulePatch: (patchId: string, endpointIds: string[], scheduleTime: string) => Promise<boolean>;
  deployPatch: (patchId: string, endpointId: string) => Promise<boolean>;
  rollbackPatch: (patchId: string, endpointId: string) => Promise<boolean>;
  getPatchDeploymentStatus: (patchId: string) => PatchDeploymentStatus[];

  // Compliance monitoring
  checkCompliance: (endpointIds?: string[]) => Promise<ComplianceStatus[]>;
  getComplianceStatus: (endpointId: string) => ComplianceStatus | null;
  generateComplianceReport: (standards?: string[]) => Promise<SecurityReport>;
  enforcePolicy: (policyId: string, endpointId: string) => Promise<boolean>;
  getComplianceIssues: (filters?: ComplianceIssueFilters) => ComplianceIssue[];

  // Security reporting and analytics
  generateReport: (type: SecurityReport['type'], period: { start: string; end: string }) => Promise<SecurityReport>;
  getReports: () => SecurityReport[];
  getAnalytics: (metrics: string[], period: string) => Promise<any>;
  predictThreats: (historicalData: any) => Promise<any>;

  // Real-time dashboard
  getDashboardMetrics: () => DashboardMetrics;
  subscribeToAlerts: (callback: (alert: Alert) => void) => () => void;
  acknowledgeAlert: (alertId: string) => Promise<boolean>;
  getAlerts: (filters?: AlertFilters) => Alert[];

  // Utility functions
  refreshData: () => Promise<void>;
  exportData: (type: 'endpoints' | 'threats' | 'incidents' | 'vulnerabilities', format: 'json' | 'csv') => Promise<Blob>;
  importPolicies: (data: any) => Promise<SecurityPolicy[]>;
}

/**
 * Filter interfaces
 */
interface EndpointFilters {
  status?: Endpoint['status'][];
  osType?: string;
  department?: string;
  location?: string;
  compliance?: 'compliant' | 'non_compliant' | 'partial';
  lastSeenBefore?: string;
  hasVulnerabilities?: boolean;
}

interface ThreatFilters {
  type?: Threat['type'][];
  severity?: Threat['severity'][];
  status?: Threat['status'][];
  affectedEndpoint?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface IncidentFilters {
  status?: Incident['status'][];
  severity?: Incident['severity'][];
  priority?: Incident['priority'][];
  assignedTo?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface VulnerabilityFilters {
  severity?: Vulnerability['severity'][];
  status?: Vulnerability['status'][];
  affectedEndpoint?: string;
  cveId?: string;
  exploitability?: Vulnerability['exploitability'];
  dateFrom?: string;
  dateTo?: string;
}

interface ComplianceIssueFilters {
  severity?: ComplianceIssue['severity'][];
  status?: ComplianceIssue['status'][];
  type?: ComplianceIssue['type'];
  endpointId?: string;
}

interface AlertFilters {
  type?: Alert['type'][];
  severity?: Alert['severity'][];
  acknowledged?: boolean;
  resolved?: boolean;
  endpointId?: string;
}

/**
 * The main hook for Endpoint Protection logic
 */
export const useEndpointProtectionLogic = (): UseEndpointProtectionLogicReturn => {
  const [protectionData, setProtectionData] = useState<EndpointProtectionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Refs for managing real-time updates
  const alertSubscribers = useRef<Set<(alert: Alert) => void>>(new Set());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch complete protection data
   */
  const fetchProtectionData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, these would be API calls
      const [
        endpoints,
        policies,
        threats,
        incidents,
        vulnerabilities,
        patches,
        complianceStatuses,
        reports,
        dashboardMetrics,
        alerts
      ] = await Promise.all([
        getMockEndpoints(),
        getMockPolicies(),
        getMockThreats(),
        getMockIncidents(),
        getMockVulnerabilities(),
        getMockPatches(),
        getMockComplianceStatuses(),
        getMockReports(),
        getMockDashboardMetrics(),
        getMockAlerts(),
      ]);

      const completeData: EndpointProtectionData = {
        endpoints,
        policies,
        threats,
        incidents,
        vulnerabilities,
        patches,
        complianceStatuses,
        reports,
        dashboardMetrics,
        alerts,
      };

      setProtectionData(completeData);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch protection data';
      setError(errorMessage);
      console.error('Protection data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Endpoint management functions
   */
  const getEndpoints = useCallback((filters?: EndpointFilters): Endpoint[] => {
    if (!protectionData) return [];

    let filtered = [...protectionData.endpoints];

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(e => filters.status!.includes(e.status));
      }
      if (filters.osType) {
        filtered = filtered.filter(e => e.osType === filters.osType);
      }
      if (filters.department) {
        filtered = filtered.filter(e => e.department === filters.department);
      }
      if (filters.location) {
        filtered = filtered.filter(e => e.location === filters.location);
      }
      if (filters.compliance) {
        filtered = filtered.filter(e =>
          filters.compliance === 'compliant' ? e.complianceStatus.overall === 'compliant' :
          filters.compliance === 'non_compliant' ? e.complianceStatus.overall === 'non_compliant' :
          e.complianceStatus.overall === 'partial'
        );
      }
      if (filters.lastSeenBefore) {
        const beforeDate = new Date(filters.lastSeenBefore);
        filtered = filtered.filter(e => new Date(e.lastSeen) < beforeDate);
      }
      if (filters.hasVulnerabilities !== undefined) {
        filtered = filtered.filter(e =>
          filters.hasVulnerabilities ? e.vulnerabilities.length > 0 : e.vulnerabilities.length === 0
        );
      }
    }

    return filtered;
  }, [protectionData]);

  const getEndpoint = useCallback((endpointId: string): Endpoint | null => {
    return protectionData?.endpoints.find(e => e.id === endpointId) || null;
  }, [protectionData]);

  const updateEndpoint = useCallback(async (endpointId: string, updates: Partial<Endpoint>): Promise<Endpoint> => {
    if (!protectionData) throw new Error('Protection data not available');

    const existingEndpoint = protectionData.endpoints.find(e => e.id === endpointId);
    if (!existingEndpoint) throw new Error('Endpoint not found');

    const updatedEndpoint: Endpoint = { ...existingEndpoint, ...updates };

    setProtectionData(prev => prev ? {
      ...prev,
      endpoints: prev.endpoints.map(e => e.id === endpointId ? updatedEndpoint : e),
    } : null);

    return updatedEndpoint;
  }, [protectionData]);

  const quarantineEndpoint = useCallback(async (endpointId: string, reason: string): Promise<boolean> => {
    try {
      await updateEndpoint(endpointId, { status: 'quarantined' });

      // Log quarantine action
      const alert: Alert = {
        id: `alert-${Date.now()}`,
        type: 'endpoint_offline',
        severity: 'high',
        title: 'Endpoint Quarantined',
        description: `Endpoint ${endpointId} has been quarantined. Reason: ${reason}`,
        affectedEndpoint: endpointId,
        created: new Date().toISOString(),
        acknowledged: false,
        resolved: false,
        escalationLevel: 1,
      };

      setProtectionData(prev => prev ? {
        ...prev,
        alerts: [alert, ...prev.alerts],
      } : null);

      // Notify subscribers
      alertSubscribers.current.forEach(callback => callback(alert));

      return true;
    } catch (error) {
      return false;
    }
  }, [updateEndpoint]);

  const unquarantineEndpoint = useCallback(async (endpointId: string): Promise<boolean> => {
    try {
      await updateEndpoint(endpointId, { status: 'online' });
      return true;
    } catch (error) {
      return false;
    }
  }, [updateEndpoint]);

  const scanEndpoint = useCallback(async (endpointId: string, scanType: 'quick' | 'full' | 'vulnerability'): Promise<string> => {
    const scanId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Simulate scan initiation
    setTimeout(() => {
      // In real implementation, this would trigger actual scanning
      console.log(`Starting ${scanType} scan for endpoint ${endpointId}, scan ID: ${scanId}`);
    }, 1000);

    return scanId;
  }, []);

  /**
   * Security policy management functions
   */
  const createPolicy = useCallback(async (policyData: Partial<SecurityPolicy>): Promise<SecurityPolicy> => {
    if (!protectionData) throw new Error('Protection data not available');

    const newPolicy: SecurityPolicy = {
      id: `policy-${Date.now()}`,
      name: policyData.name || 'New Policy',
      description: policyData.description || '',
      category: policyData.category || 'endpoint',
      priority: policyData.priority || 'medium',
      rules: policyData.rules || [],
      scope: policyData.scope || {
        allEndpoints: false,
        specificEndpoints: [],
        groups: [],
        departments: [],
        locations: [],
        osTypes: [],
      },
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      author: 'current-user',
      version: '1.0.0',
      isActive: true,
      complianceCheck: policyData.complianceCheck || true,
      autoRemediate: policyData.autoRemediate || false,
    };

    setProtectionData(prev => prev ? {
      ...prev,
      policies: [...prev.policies, newPolicy],
    } : null);

    return newPolicy;
  }, [protectionData]);

  const updatePolicy = useCallback(async (policyId: string, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy> => {
    if (!protectionData) throw new Error('Protection data not available');

    const existingPolicy = protectionData.policies.find(p => p.id === policyId);
    if (!existingPolicy) throw new Error('Policy not found');

    const updatedPolicy: SecurityPolicy = {
      ...existingPolicy,
      ...updates,
      modified: new Date().toISOString(),
      version: updates.rules || updates.scope ? getNextPolicyVersion(existingPolicy.version) : existingPolicy.version,
    };

    setProtectionData(prev => prev ? {
      ...prev,
      policies: prev.policies.map(p => p.id === policyId ? updatedPolicy : p),
    } : null);

    return updatedPolicy;
  }, [protectionData]);

  const deletePolicy = useCallback(async (policyId: string): Promise<boolean> => {
    if (!protectionData) return false;

    // Check if policy is assigned to endpoints
    const assignedEndpoints = protectionData.endpoints.filter(e => e.policies.includes(policyId));
    if (assignedEndpoints.length > 0) {
      throw new Error('Cannot delete policy assigned to endpoints');
    }

    setProtectionData(prev => prev ? {
      ...prev,
      policies: prev.policies.filter(p => p.id !== policyId),
    } : null);

    return true;
  }, [protectionData]);

  const assignPolicyToEndpoint = useCallback(async (policyId: string, endpointId: string): Promise<boolean> => {
    const endpoint = getEndpoint(endpointId);
    if (!endpoint) return false;

    const currentPolicies = endpoint.policies;
    if (currentPolicies.includes(policyId)) return true; // Already assigned

    return updateEndpoint(endpointId, {
      policies: [...currentPolicies, policyId]
    }).then(() => true).catch(() => false);
  }, [getEndpoint, updateEndpoint]);

  const unassignPolicyFromEndpoint = useCallback(async (policyId: string, endpointId: string): Promise<boolean> => {
    const endpoint = getEndpoint(endpointId);
    if (!endpoint) return false;

    const currentPolicies = endpoint.policies.filter(p => p !== policyId);
    return updateEndpoint(endpointId, {
      policies: currentPolicies
    }).then(() => true).catch(() => false);
  }, [getEndpoint, updateEndpoint]);

  const getPolicyCompliance = useCallback((policyId: string): PolicyCompliance[] => {
    if (!protectionData) return [];

    return protectionData.complianceStatuses
      .map(cs => cs.policies.find(p => p.policyId === policyId))
      .filter((pc): pc is PolicyCompliance => pc !== undefined);
  }, [protectionData]);

  /**
   * Threat detection and response functions
   */
  const detectThreats = useCallback(async (): Promise<Threat[]> => {
    // Simulate threat detection
    const mockThreats = await getMockThreats();
    const newThreats = mockThreats.filter((t: Threat) => Math.random() > 0.7); // Random subset

    if (newThreats.length > 0) {
      setProtectionData(prev => prev ? {
        ...prev,
        threats: [...prev.threats, ...newThreats],
      } : null);

      // Generate alerts for new threats
      const alerts: Alert[] = newThreats.map(threat => ({
        id: `alert-${Date.now()}-${threat.id}`,
        type: 'threat_detected' as const,
        severity: threat.severity,
        title: `Threat Detected: ${threat.type}`,
        description: threat.description,
        affectedEndpoint: threat.affectedEndpoints[0],
        created: new Date().toISOString(),
        acknowledged: false,
        resolved: false,
        escalationLevel: threat.severity === 'critical' ? 2 : 1,
      }));

      setProtectionData(prev => prev ? {
        ...prev,
        alerts: [...alerts, ...prev.alerts],
      } : null);

      // Notify subscribers
      alerts.forEach(alert => {
        alertSubscribers.current.forEach((callback: (alert: Alert) => void) => callback(alert));
      });
    }

    return newThreats;
  }, []);

  const getThreats = useCallback((filters?: ThreatFilters): Threat[] => {
    if (!protectionData) return [];

    let filtered = [...protectionData.threats];

    if (filters) {
      if (filters.type && filters.type.length > 0) {
        filtered = filtered.filter(t => filters.type!.includes(t.type));
      }
      if (filters.severity && filters.severity.length > 0) {
        filtered = filtered.filter(t => filters.severity!.includes(t.severity));
      }
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(t => filters.status!.includes(t.status));
      }
      if (filters.affectedEndpoint) {
        filtered = filtered.filter(t => t.affectedEndpoints.includes(filters.affectedEndpoint!));
      }
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filtered = filtered.filter(t => new Date(t.detectionTime) >= fromDate);
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filtered = filtered.filter(t => new Date(t.detectionTime) <= toDate);
      }
    }

    return filtered.sort((a, b) => new Date(b.detectionTime).getTime() - new Date(a.detectionTime).getTime());
  }, [protectionData]);

  const getThreat = useCallback((threatId: string): Threat | null => {
    return protectionData?.threats.find(t => t.id === threatId) || null;
  }, [protectionData]);

  const respondToThreat = useCallback(async (threatId: string, actions: ResponseAction[]): Promise<boolean> => {
    const threat = getThreat(threatId);
    if (!threat) return false;

    const updatedActions = actions.map(action => ({
      ...action,
      id: action.id || `action-${Date.now()}`,
      status: 'completed' as const,
      executedAt: new Date().toISOString(),
    }));

    const updatedThreat: Threat = {
      ...threat,
      responseActions: [...threat.responseActions, ...updatedActions],
      status: threat.status === 'active' ? 'contained' : threat.status,
    };

    setProtectionData(prev => prev ? {
      ...prev,
      threats: prev.threats.map(t => t.id === threatId ? updatedThreat : t),
    } : null);

    return true;
  }, [getThreat]);

  const updateThreatStatus = useCallback(async (threatId: string, status: Threat['status']): Promise<Threat> => {
    const threat = getThreat(threatId);
    if (!threat) throw new Error('Threat not found');

    const updatedThreat: Threat = { ...threat, status };

    setProtectionData(prev => prev ? {
      ...prev,
      threats: prev.threats.map(t => t.id === threatId ? updatedThreat : t),
    } : null);

    return updatedThreat;
  }, [getThreat]);

  const getThreatIntelligence = useCallback(async (threatType: string): Promise<any> => {
    // Simulate threat intelligence lookup
    return {
      threatType,
      prevalence: Math.random(),
      tactics: ['Initial Access', 'Execution', 'Persistence'],
      mitigation: 'Apply latest patches and use EDR solutions',
      lastUpdated: new Date().toISOString(),
    };
  }, []);

  /**
   * Incident management functions
   */
  const createIncident = useCallback(async (incidentData: Partial<Incident>): Promise<Incident> => {
    if (!protectionData) throw new Error('Protection data not available');

    const newIncident: Incident = {
      id: `incident-${Date.now()}`,
      title: incidentData.title || 'New Security Incident',
      description: incidentData.description || '',
      severity: incidentData.severity || 'medium',
      status: 'new',
      priority: incidentData.priority || 'normal',
      category: incidentData.category || 'general',
      reportedBy: 'current-user',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      affectedEndpoints: incidentData.affectedEndpoints || [],
      threats: incidentData.threats || [],
      vulnerabilities: incidentData.vulnerabilities || [],
      timeline: [{
        id: `event-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'detection',
        description: 'Incident created',
        actor: 'current-user',
        details: {},
      }],
      evidence: [],
      resolution: '',
      lessonsLearned: '',
    };

    setProtectionData(prev => prev ? {
      ...prev,
      incidents: [...prev.incidents, newIncident],
    } : null);

    // Generate alert
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      type: 'threat_detected',
      severity: newIncident.severity,
      title: `New Incident: ${newIncident.title}`,
      description: newIncident.description,
      created: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      escalationLevel: newIncident.severity === 'critical' ? 3 : 2,
    };

    setProtectionData(prev => prev ? {
      ...prev,
      alerts: [alert, ...prev.alerts],
    } : null);

    alertSubscribers.current.forEach(callback => callback(alert));

    return newIncident;
  }, [protectionData]);

  const updateIncident = useCallback(async (incidentId: string, updates: Partial<Incident>): Promise<Incident> => {
    if (!protectionData) throw new Error('Protection data not available');

    const existingIncident = protectionData.incidents.find(i => i.id === incidentId);
    if (!existingIncident) throw new Error('Incident not found');

    const updatedIncident: Incident = {
      ...existingIncident,
      ...updates,
      updated: new Date().toISOString(),
      resolvedAt: updates.status === 'resolved' ? new Date().toISOString() : existingIncident.resolvedAt,
    };

    setProtectionData(prev => prev ? {
      ...prev,
      incidents: prev.incidents.map(i => i.id === incidentId ? updatedIncident : i),
    } : null);

    return updatedIncident;
  }, [protectionData]);

  const assignIncident = useCallback(async (incidentId: string, assignee: string): Promise<boolean> => {
    return updateIncident(incidentId, { assignedTo: assignee, status: 'investigating' })
      .then(() => true)
      .catch(() => false);
  }, [updateIncident]);

  const resolveIncident = useCallback(async (incidentId: string, resolution: string): Promise<Incident> => {
    return updateIncident(incidentId, {
      status: 'resolved',
      resolution,
      resolvedAt: new Date().toISOString()
    });
  }, [updateIncident]);

  const getIncidents = useCallback((filters?: IncidentFilters): Incident[] => {
    if (!protectionData) return [];

    let filtered = [...protectionData.incidents];

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(i => filters.status!.includes(i.status));
      }
      if (filters.severity && filters.severity.length > 0) {
        filtered = filtered.filter(i => filters.severity!.includes(i.severity));
      }
      if (filters.priority && filters.priority.length > 0) {
        filtered = filtered.filter(i => filters.priority!.includes(i.priority));
      }
      if (filters.assignedTo) {
        filtered = filtered.filter(i => i.assignedTo === filters.assignedTo);
      }
      if (filters.category) {
        filtered = filtered.filter(i => i.category === filters.category);
      }
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filtered = filtered.filter(i => new Date(i.created) >= fromDate);
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filtered = filtered.filter(i => new Date(i.created) <= toDate);
      }
    }

    return filtered.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  }, [protectionData]);

  const getIncident = useCallback((incidentId: string): Incident | null => {
    return protectionData?.incidents.find(i => i.id === incidentId) || null;
  }, [protectionData]);

  const addIncidentEvent = useCallback(async (incidentId: string, event: Omit<IncidentEvent, 'id'>): Promise<boolean> => {
    const incident = getIncident(incidentId);
    if (!incident) return false;

    const newEvent: IncidentEvent = {
      ...event,
      id: `event-${Date.now()}`,
    };

    return updateIncident(incidentId, {
      timeline: [...incident.timeline, newEvent]
    }).then(() => true).catch(() => false);
  }, [getIncident, updateIncident]);

  /**
   * Vulnerability assessment functions
   */
  const scanForVulnerabilities = useCallback(async (endpointIds?: string[]): Promise<string> => {
    const scanId = `vuln-scan-${Date.now()}`;

    // Simulate vulnerability scanning
    setTimeout(async () => {
      const mockVulnerabilities = await getMockVulnerabilities();
      const newVulnerabilities = mockVulnerabilities.filter((v: Vulnerability) => Math.random() > 0.8);

      if (newVulnerabilities.length > 0) {
        setProtectionData(prev => prev ? {
          ...prev,
          vulnerabilities: [...prev.vulnerabilities, ...newVulnerabilities],
        } : null);

        // Generate alerts
        const alerts: Alert[] = newVulnerabilities.map(vuln => ({
          id: `alert-${Date.now()}-${vuln.id}`,
          type: 'vulnerability_found' as const,
          severity: vuln.severity,
          title: `Vulnerability Found: ${vuln.title}`,
          description: vuln.description,
          created: new Date().toISOString(),
          acknowledged: false,
          resolved: false,
          escalationLevel: vuln.severity === 'critical' ? 2 : 1,
        }));
  
        setProtectionData(prev => prev ? {
          ...prev,
          alerts: [...alerts, ...prev.alerts],
        } : null);
  
        alerts.forEach(alert => alertSubscribers.current.forEach((callback: (alert: Alert) => void) => callback(alert)));
      }
    }, 2000);

    return scanId;
  }, []);

  const getVulnerabilities = useCallback((filters?: VulnerabilityFilters): Vulnerability[] => {
    if (!protectionData) return [];

    let filtered = [...protectionData.vulnerabilities];

    if (filters) {
      if (filters.severity && filters.severity.length > 0) {
        filtered = filtered.filter(v => filters.severity!.includes(v.severity));
      }
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(v => filters.status!.includes(v.status));
      }
      if (filters.affectedEndpoint) {
        filtered = filtered.filter(v => v.affectedEndpoints.includes(filters.affectedEndpoint!));
      }
      if (filters.cveId) {
        filtered = filtered.filter(v => v.cveId === filters.cveId);
      }
      if (filters.exploitability) {
        filtered = filtered.filter(v => v.exploitability === filters.exploitability);
      }
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filtered = filtered.filter(v => new Date(v.published) >= fromDate);
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filtered = filtered.filter(v => new Date(v.published) <= toDate);
      }
    }

    return filtered.sort((a, b) => {
      // Sort by CVSS score descending
      return b.cvssScore - a.cvssScore;
    });
  }, [protectionData]);

  const getVulnerability = useCallback((vulnerabilityId: string): Vulnerability | null => {
    return protectionData?.vulnerabilities.find(v => v.id === vulnerabilityId) || null;
  }, [protectionData]);

  const prioritizeVulnerabilities = useCallback((vulnerabilities: Vulnerability[]): Vulnerability[] => {
    return vulnerabilities.sort((a, b) => {
      // Priority based on CVSS score and exploitability
      const scoreA = a.cvssScore * (a.exploitability === 'high' ? 1.5 : a.exploitability === 'medium' ? 1.2 : 1.0);
      const scoreB = b.cvssScore * (b.exploitability === 'high' ? 1.5 : b.exploitability === 'medium' ? 1.2 : 1.0);
      return scoreB - scoreA;
    });
  }, []);

  const remediateVulnerability = useCallback(async (vulnerabilityId: string, remediation: Remediation): Promise<boolean> => {
    const vulnerability = getVulnerability(vulnerabilityId);
    if (!vulnerability) return false;

    const updatedRemediations = vulnerability.remediation.map(r =>
      r.id === remediation.id ? { ...r, status: 'completed' as const } : r
    );

    setProtectionData(prev => prev ? {
      ...prev,
      vulnerabilities: prev.vulnerabilities.map(v =>
        v.id === vulnerabilityId ? { ...v, remediation: updatedRemediations, status: 'resolved' } : v
      ),
    } : null);

    return true;
  }, [getVulnerability]);

  const acceptRisk = useCallback(async (vulnerabilityId: string, reason: string): Promise<boolean> => {
    return updateVulnerabilityStatus(vulnerabilityId, 'accepted_risk');
  }, []);

  /**
   * Patch management functions
   */
  const getAvailablePatches = useCallback((endpointId?: string): Patch[] => {
    if (!protectionData) return [];

    let patches = [...protectionData.patches];

    if (endpointId) {
      // Filter patches applicable to specific endpoint
      const endpoint = getEndpoint(endpointId);
      if (endpoint) {
        patches = patches.filter(p =>
          p.vulnerabilitiesFixed.some(vulnId =>
            endpoint.vulnerabilities.includes(vulnId)
          )
        );
      }
    }

    return patches.filter(p =>
      p.deploymentStatus.some(ds => ds.status !== 'installed')
    );
  }, [protectionData, getEndpoint]);

  const schedulePatch = useCallback(async (patchId: string, endpointIds: string[], scheduleTime: string): Promise<boolean> => {
    if (!protectionData) return false;

    const patch = protectionData.patches.find(p => p.id === patchId);
    if (!patch) return false;

    const scheduledTime = new Date(scheduleTime);
    const newStatuses: PatchDeploymentStatus[] = endpointIds.map(endpointId => ({
      endpointId,
      status: 'not_deployed',
      scheduledAt: scheduledTime.toISOString(),
    }));

    setProtectionData(prev => prev ? {
      ...prev,
      patches: prev.patches.map(p =>
        p.id === patchId ? {
          ...p,
          deploymentStatus: [...p.deploymentStatus, ...newStatuses]
        } : p
      ),
    } : null);

    return true;
  }, [protectionData]);

  const deployPatch = useCallback(async (patchId: string, endpointId: string): Promise<boolean> => {
    // Simulate patch deployment
    setTimeout(() => {
      updatePatchDeploymentStatus(patchId, endpointId, 'installed');
    }, Math.floor(Math.random() * 10000) + 5000); // 5-15 seconds

    return updatePatchDeploymentStatus(patchId, endpointId, 'installing');
  }, []);

  const rollbackPatch = useCallback(async (patchId: string, endpointId: string): Promise<boolean> => {
    return updatePatchDeploymentStatus(patchId, endpointId, 'rolled_back');
  }, []);

  const getPatchDeploymentStatus = useCallback((patchId: string): PatchDeploymentStatus[] => {
    const patch = protectionData?.patches.find(p => p.id === patchId);
    return patch?.deploymentStatus || [];
  }, [protectionData]);

  /**
   * Helper function to update patch deployment status
   */
  const updatePatchDeploymentStatus = useCallback((patchId: string, endpointId: string, status: PatchDeploymentStatus['status']): boolean => {
    if (!protectionData) return false;

    const patch = protectionData.patches.find(p => p.id === patchId);
    if (!patch) return false;

    const updatedStatus: PatchDeploymentStatus = {
      endpointId,
      status,
      deployedAt: status === 'installed' ? new Date().toISOString() : undefined,
    };

    setProtectionData(prev => prev ? {
      ...prev,
      patches: prev.patches.map(p =>
        p.id === patchId ? {
          ...p,
          deploymentStatus: p.deploymentStatus.map(ds =>
            ds.endpointId === endpointId ? updatedStatus : ds
          )
        } : p
      ),
    } : null);

    return true;
  }, [protectionData]);

  /**
   * Helper function to update vulnerability status
   */
  const updateVulnerabilityStatus = useCallback((vulnerabilityId: string, status: Vulnerability['status']): boolean => {
    if (!protectionData) return false;

    setProtectionData(prev => prev ? {
      ...prev,
      vulnerabilities: prev.vulnerabilities.map(v =>
        v.id === vulnerabilityId ? { ...v, status } : v
      ),
    } : null);

    return true;
  }, [protectionData]);

  /**
   * Compliance monitoring functions
   */
  const checkCompliance = useCallback(async (endpointIds?: string[]): Promise<ComplianceStatus[]> => {
    const endpoints = endpointIds ?
      endpointIds.map(id => getEndpoint(id)).filter(e => e !== null) as Endpoint[] :
      getEndpoints();

    // Simulate compliance checking
    const complianceStatuses: ComplianceStatus[] = endpoints.map(endpoint => {
      const policies = endpoint.policies.map(policyId => {
        const policy = protectionData?.policies.find(p => p.id === policyId);
        return policy ? {
          policyId,
          compliant: Math.random() > 0.3, // 70% compliance rate
          violations: [],
          lastChecked: new Date().toISOString(),
          remediationRequired: Math.random() > 0.7,
        } : null;
      }).filter(p => p !== null) as PolicyCompliance[];

      const score = policies.filter(p => p.compliant).length / policies.length * 100;

      return {
        endpointId: endpoint.id,
        overall: score >= 80 ? 'compliant' : score >= 50 ? 'partial' : 'non_compliant',
        score,
        lastChecked: new Date().toISOString(),
        policies,
        standards: [],
        issues: [],
      };
    });

    setProtectionData(prev => prev ? {
      ...prev,
      complianceStatuses,
    } : null);

    return complianceStatuses;
  }, [getEndpoint, getEndpoints, protectionData]);

  const getComplianceStatus = useCallback((endpointId: string): ComplianceStatus | null => {
    return protectionData?.complianceStatuses.find(cs => cs.endpointId === endpointId) || null;
  }, [protectionData]);

  const generateComplianceReport = useCallback(async (standards?: string[]): Promise<SecurityReport> => {
    const reportId = `report-${Date.now()}`;
    const report: SecurityReport = {
      id: reportId,
      title: 'Compliance Audit Report',
      type: 'compliance_audit',
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      generatedAt: new Date().toISOString(),
      generatedBy: 'current-user',
      data: {
        standards: standards || ['NIST', 'CIS'],
        compliance: protectionData?.complianceStatuses || [],
        recommendations: [],
      },
      format: 'pdf',
      recipients: [],
      status: 'ready',
    };

    setProtectionData(prev => prev ? {
      ...prev,
      reports: [...prev.reports, report],
    } : null);

    return report;
  }, [protectionData]);

  const enforcePolicy = useCallback(async (policyId: string, endpointId: string): Promise<boolean> => {
    // Simulate policy enforcement
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 3000) + 1000));
    return Math.random() > 0.1; // 90% success rate
  }, []);

  const getComplianceIssues = useCallback((filters?: ComplianceIssueFilters): ComplianceIssue[] => {
    if (!protectionData) return [];

    const allIssues: ComplianceIssue[] = protectionData.complianceStatuses.flatMap(cs => cs.issues);

    let filtered = [...allIssues];

    if (filters) {
      if (filters.severity && filters.severity.length > 0) {
        filtered = filtered.filter(i => filters.severity!.includes(i.severity));
      }
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(i => filters.status!.includes(i.status));
      }
      if (filters.type) {
        filtered = filtered.filter(i => i.type === filters.type);
      }
      if (filters.endpointId) {
        filtered = filtered.filter(i => i.affectedEntities.includes(filters.endpointId!));
      }
    }

    return filtered;
  }, [protectionData]);

  /**
   * Security reporting and analytics functions
   */
  const generateReport = useCallback(async (type: SecurityReport['type'], period: { start: string; end: string }): Promise<SecurityReport> => {
    const reportId = `report-${Date.now()}`;
    const report: SecurityReport = {
      id: reportId,
      title: `${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Report`,
      type,
      period,
      generatedAt: new Date().toISOString(),
      generatedBy: 'current-user',
      data: generateReportData(type, period),
      format: 'pdf',
      recipients: [],
      status: 'ready',
    };

    setProtectionData(prev => prev ? {
      ...prev,
      reports: [...prev.reports, report],
    } : null);

    return report;
  }, [protectionData]);

  const getReports = useCallback((): SecurityReport[] => {
    return protectionData?.reports || [];
  }, [protectionData]);

  const getAnalytics = useCallback(async (metrics: string[], period: string): Promise<any> => {
    // Simulate analytics calculation
    const analytics: any = {};

    metrics.forEach(metric => {
      switch (metric) {
        case 'threat_trends':
          analytics[metric] = {
            trend: 'increasing',
            changePercent: 15,
            data: generateTimeSeriesData(period),
          };
          break;
        case 'vulnerability_exposure':
          analytics[metric] = {
            total: protectionData?.vulnerabilities.length || 0,
            critical: protectionData?.vulnerabilities.filter(v => v.severity === 'critical').length || 0,
            riskScore: 7.5,
          };
          break;
        case 'compliance_trends': {
          const complianceStatuses = protectionData?.complianceStatuses ?? [];
          const totalScore = complianceStatuses.reduce((sum, cs) => sum + cs.score, 0);
          analytics[metric] = {
            averageScore: complianceStatuses.length > 0 ? totalScore / complianceStatuses.length : 0,
            trend: 'stable',
            changePercent: 2,
          };
          break;
        }
        default:
          analytics[metric] = {};
      }
    });

    return analytics;
  }, [protectionData]);

  const predictThreats = useCallback(async (historicalData: any): Promise<any> => {
    // Simulate threat prediction
    return {
      predictions: [
        {
          threatType: 'ransomware',
          probability: 0.75,
          timeWindow: 'next_30_days',
          confidence: 0.85,
        },
        {
          threatType: 'phishing',
          probability: 0.60,
          timeWindow: 'next_7_days',
          confidence: 0.92,
        },
      ],
      recommendations: [
        'Increase email security training',
        'Deploy advanced endpoint protection',
        'Regular backup verification',
      ],
    };
  }, []);

  /**
   * Real-time dashboard functions
   */
  const getDashboardMetrics = useCallback((): DashboardMetrics => {
    return protectionData?.dashboardMetrics || {
      endpoints: { total: 0, online: 0, offline: 0, quarantined: 0, compromised: 0 },
      threats: { active: 0, contained: 0, resolved: 0, bySeverity: {} },
      incidents: { total: 0, open: 0, resolved: 0, bySeverity: {} },
      vulnerabilities: { total: 0, critical: 0, high: 0, medium: 0, low: 0, byStatus: {} },
      patches: { available: 0, deployed: 0, failed: 0, pending: 0 },
      compliance: { overallScore: 0, compliantEndpoints: 0, nonCompliantEndpoints: 0, policyViolations: 0 },
      alerts: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
      lastUpdated: new Date().toISOString(),
    };
  }, [protectionData]);

  const subscribeToAlerts = useCallback((callback: (alert: Alert) => void) => {
    alertSubscribers.current.add(callback);
    return () => {
      alertSubscribers.current.delete(callback);
    };
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string): Promise<boolean> => {
    if (!protectionData) return false;

    setProtectionData(prev => prev ? {
      ...prev,
      alerts: prev.alerts.map(a =>
        a.id === alertId ? {
          ...a,
          acknowledged: true,
          acknowledgedBy: 'current-user',
          acknowledgedAt: new Date().toISOString(),
        } : a
      ),
    } : null);

    return true;
  }, [protectionData]);

  const getAlerts = useCallback((filters?: AlertFilters): Alert[] => {
    if (!protectionData) return [];

    let filtered = [...protectionData.alerts];

    if (filters) {
      if (filters.type && filters.type.length > 0) {
        filtered = filtered.filter(a => filters.type!.includes(a.type));
      }
      if (filters.severity && filters.severity.length > 0) {
        filtered = filtered.filter(a => filters.severity!.includes(a.severity));
      }
      if (filters.acknowledged !== undefined) {
        filtered = filtered.filter(a => a.acknowledged === filters.acknowledged);
      }
      if (filters.resolved !== undefined) {
        filtered = filtered.filter(a => a.resolved === filters.resolved);
      }
      if (filters.endpointId) {
        filtered = filtered.filter(a => a.affectedEndpoint === filters.endpointId);
      }
    }

    return filtered.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  }, [protectionData]);

  /**
   * Utility functions
   */
  const refreshData = useCallback(async (): Promise<void> => {
    await fetchProtectionData();
  }, [fetchProtectionData]);

  const exportData = useCallback(async (type: 'endpoints' | 'threats' | 'incidents' | 'vulnerabilities', format: 'json' | 'csv'): Promise<Blob> => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'endpoints':
        data = getEndpoints();
        filename = 'endpoints';
        break;
      case 'threats':
        data = getThreats();
        filename = 'threats';
        break;
      case 'incidents':
        data = getIncidents();
        filename = 'incidents';
        break;
      case 'vulnerabilities':
        data = getVulnerabilities();
        filename = 'vulnerabilities';
        break;
    }

    if (format === 'json') {
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } else {
      // Simple CSV conversion
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = (data ?? []).map(item =>
        Object.values(item).map(val =>
          typeof val === 'object' ? JSON.stringify(val) : String(val)
        ).join(',')
      );
      const csv = [headers, ...rows].join('\n');
      return new Blob([csv], { type: 'text/csv' });
    }
  }, [getEndpoints, getThreats, getIncidents, getVulnerabilities]);

  const importPolicies = useCallback(async (data: any): Promise<SecurityPolicy[]> => {
    const policies = Array.isArray(data) ? data : [data];
    const importedPolicies: SecurityPolicy[] = [];

    for (const policyData of policies) {
      try {
        const policy = await createPolicy(policyData);
        importedPolicies.push(policy);
      } catch (error) {
        console.error('Failed to import policy:', error);
      }
    }

    return importedPolicies;
  }, [createPolicy]);

  /**
   * Initialize data and start real-time updates
   */
  useEffect(() => {
    fetchProtectionData();

    // Start periodic updates
    updateIntervalRef.current = setInterval(() => {
      // Update dashboard metrics
      if (protectionData) {
        const updatedMetrics = calculateDashboardMetrics(protectionData);
        setProtectionData(prev => prev ? { ...prev, dashboardMetrics: updatedMetrics } : null);
      }

      // Random threat detection
      if (Math.random() > 0.95) { // 5% chance every update
        detectThreats().catch(console.error);
      }
    }, 30000); // Update every 30 seconds

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [fetchProtectionData]);

  return {
    protectionData,
    isLoading,
    error,
    lastUpdate,
    // Endpoint management
    getEndpoints,
    getEndpoint,
    updateEndpoint,
    quarantineEndpoint,
    unquarantineEndpoint,
    scanEndpoint,
    // Security policy management
    createPolicy,
    updatePolicy,
    deletePolicy,
    assignPolicyToEndpoint,
    unassignPolicyFromEndpoint,
    getPolicyCompliance,
    // Threat detection and response
    detectThreats,
    getThreats,
    getThreat,
    respondToThreat,
    updateThreatStatus,
    getThreatIntelligence,
    // Incident management
    createIncident,
    updateIncident,
    assignIncident,
    resolveIncident,
    getIncidents,
    getIncident,
    addIncidentEvent,
    // Vulnerability assessment
    scanForVulnerabilities,
    getVulnerabilities,
    getVulnerability,
    prioritizeVulnerabilities,
    remediateVulnerability,
    acceptRisk,
    // Patch management
    getAvailablePatches,
    schedulePatch,
    deployPatch,
    rollbackPatch,
    getPatchDeploymentStatus,
    // Compliance monitoring
    checkCompliance,
    getComplianceStatus,
    generateComplianceReport,
    enforcePolicy,
    getComplianceIssues,
    // Security reporting and analytics
    generateReport,
    getReports,
    getAnalytics,
    predictThreats,
    // Real-time dashboard
    getDashboardMetrics,
    subscribeToAlerts,
    acknowledgeAlert,
    getAlerts,
    // Utility functions
    refreshData,
    exportData,
    importPolicies,
  };
};

/**
 * Helper function to generate report data
 */
function generateReportData(type: SecurityReport['type'], period: { start: string; end: string }): any {
  switch (type) {
    case 'threat_summary':
      return {
        totalThreats: 125,
        threatsByType: { malware: 45, phishing: 32, intrusion: 28, ransomware: 20 },
        threatsBySeverity: { critical: 15, high: 35, medium: 45, low: 30 },
        topAffectedEndpoints: ['endpoint-001', 'endpoint-005', 'endpoint-012'],
        mitigationEffectiveness: 0.85,
      };
    case 'vulnerability_assessment':
      return {
        totalVulnerabilities: 89,
        vulnerabilitiesBySeverity: { critical: 12, high: 28, medium: 35, low: 14 },
        averageTimeToRemediate: '15 days',
        complianceScore: 78,
        topVulnerableSoftware: ['Windows Server 2019', 'Apache HTTP Server', 'MySQL'],
      };
    case 'compliance_audit':
      return {
        overallCompliance: 82,
        standardsCompliance: {
          NIST: 85,
          CIS: 78,
          ISO27001: 88,
        },
        policyViolations: 23,
        remediationRequired: 15,
      };
    case 'incident_report':
      return {
        totalIncidents: 18,
        incidentsByCategory: { security: 12, operational: 4, compliance: 2 },
        averageResolutionTime: '4.2 hours',
        incidentTrends: 'decreasing',
        topThreatActors: ['Unknown Actor 1', 'APT Group X', 'Insider Threat'],
      };
    case 'executive_summary':
      return {
        keyMetrics: {
          meanTimeToDetect: '2.5 hours',
          meanTimeToRespond: '1.8 hours',
          securityPosture: 'Good',
          riskLevel: 'Medium',
        },
        topRisks: [
          'Unpatched vulnerabilities',
          'Weak authentication',
          'Insider threats',
        ],
        recommendations: [
          'Implement automated patch management',
          'Deploy multi-factor authentication',
          'Conduct regular security awareness training',
        ],
      };
    default:
      return {};
  }
}

/**
 * Helper function to generate time series data
 */
function generateTimeSeriesData(period: string): any[] {
  const days = period === '30d' ? 30 : period === '7d' ? 7 : 90;
  const data = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 50,
    });
  }

  return data;
}

/**
 * Helper function to calculate dashboard metrics
 */
function calculateDashboardMetrics(data: EndpointProtectionData): DashboardMetrics {
  const endpoints = data.endpoints;
  const threats = data.threats;
  const incidents = data.incidents;
  const vulnerabilities = data.vulnerabilities;
  const patches = data.patches;
  const compliance = data.complianceStatuses;
  const alerts = data.alerts;

  return {
    endpoints: {
      total: endpoints.length,
      online: endpoints.filter(e => e.status === 'online').length,
      offline: endpoints.filter(e => e.status === 'offline').length,
      quarantined: endpoints.filter(e => e.status === 'quarantined').length,
      compromised: endpoints.filter(e => e.status === 'compromised').length,
    },
    threats: {
      active: threats.filter(t => t.status === 'active').length,
      contained: threats.filter(t => t.status === 'contained').length,
      resolved: threats.filter(t => t.status === 'resolved').length,
      bySeverity: {
        critical: threats.filter(t => t.severity === 'critical').length,
        high: threats.filter(t => t.severity === 'high').length,
        medium: threats.filter(t => t.severity === 'medium').length,
        low: threats.filter(t => t.severity === 'low').length,
      },
    },
    incidents: {
      total: incidents.length,
      open: incidents.filter(i => ['new', 'investigating', 'contained'].includes(i.status)).length,
      resolved: incidents.filter((i: Incident) => i.status === 'resolved').length,
      bySeverity: {
        critical: incidents.filter(i => i.severity === 'critical').length,
        high: incidents.filter(i => i.severity === 'high').length,
        medium: incidents.filter(i => i.severity === 'medium').length,
        low: incidents.filter(i => i.severity === 'low').length,
      },
    },
    vulnerabilities: {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length,
      byStatus: {
        open: vulnerabilities.filter(v => v.status === 'open').length,
        in_progress: vulnerabilities.filter(v => v.status === 'in_progress').length,
        resolved: vulnerabilities.filter(v => v.status === 'resolved').length,
        accepted_risk: vulnerabilities.filter(v => v.status === 'accepted_risk').length,
      },
    },
    patches: {
      available: patches.filter(p => p.deploymentStatus.some(ds => ds.status === 'not_deployed')).length,
      deployed: patches.flatMap(p => p.deploymentStatus).filter(ds => ds.status === 'installed').length,
      failed: patches.flatMap(p => p.deploymentStatus).filter(ds => ds.status === 'failed').length,
      pending: patches.flatMap(p => p.deploymentStatus).filter(ds => ds.status === 'installing').length,
    },
    compliance: {
      overallScore: compliance.length > 0 ? compliance.reduce((sum, cs) => sum + cs.score, 0) / compliance.length : 0,
      compliantEndpoints: compliance.filter(cs => cs.overall === 'compliant').length,
      nonCompliantEndpoints: compliance.filter(cs => cs.overall === 'non_compliant').length,
      policyViolations: compliance.flatMap(cs => cs.policies).filter(p => !p.compliant).length,
    },
    alerts: {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Utility function to get next policy version
 */
function getNextPolicyVersion(currentVersion: string): string {
  const parts = currentVersion.split('.');
  const patch = parseInt(parts[2] || '0') + 1;
  return `${parts[0] || '1'}.${parts[1] || '0'}.${patch}`;
}

// Mock data functions for development - these would be replaced with actual API calls

function getMockEndpoints(): Promise<Endpoint[]> {
  return Promise.resolve([
    {
      id: 'endpoint-001',
      hostname: 'WIN-SERVER-01',
      ipAddress: '192.168.1.10',
      macAddress: '00:11:22:33:44:55',
      osType: 'Windows',
      osVersion: 'Windows Server 2019',
      lastSeen: new Date().toISOString(),
      status: 'online',
      securityAgentVersion: '2.1.0',
      policies: ['policy-001', 'policy-002'],
      vulnerabilities: ['vuln-001', 'vuln-002'],
      complianceStatus: {
        endpointId: 'endpoint-001',
        overall: 'compliant',
        score: 95,
        lastChecked: new Date().toISOString(),
        policies: [],
        standards: [],
        issues: [],
      },
      installedSoftware: [
        {
          id: 'sw-001',
          name: 'Windows Server 2019',
          version: '1809',
          vendor: 'Microsoft',
          installDate: '2023-01-15T00:00:00Z',
          isManaged: true,
          vulnerabilities: [],
        },
      ],
      networkInterfaces: [
        {
          id: 'nic-001',
          name: 'Ethernet',
          ipAddress: '192.168.1.10',
          macAddress: '00:11:22:33:44:55',
          type: 'ethernet',
          isActive: true,
        },
      ],
      hardwareInfo: {
        cpu: 'Intel Xeon E5-2650',
        ram: '32GB',
        storage: '500GB SSD',
        manufacturer: 'Dell',
        model: 'PowerEdge R720',
        serialNumber: 'ABC123XYZ',
      },
      location: 'Data Center A',
      department: 'IT',
      owner: 'admin@company.com',
    },
    {
      id: 'endpoint-002',
      hostname: 'UBUNTU-WEB-01',
      ipAddress: '192.168.1.20',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      osType: 'Linux',
      osVersion: 'Ubuntu 22.04 LTS',
      lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      status: 'online',
      securityAgentVersion: '2.0.8',
      policies: ['policy-001'],
      vulnerabilities: ['vuln-003'],
      complianceStatus: {
        endpointId: 'endpoint-002',
        overall: 'partial',
        score: 75,
        lastChecked: new Date().toISOString(),
        policies: [],
        standards: [],
        issues: [],
      },
      installedSoftware: [
        {
          id: 'sw-002',
          name: 'Apache HTTP Server',
          version: '2.4.52',
          vendor: 'Apache',
          installDate: '2023-03-10T00:00:00Z',
          isManaged: true,
          vulnerabilities: ['vuln-003'],
        },
      ],
      networkInterfaces: [
        {
          id: 'nic-002',
          name: 'eth0',
          ipAddress: '192.168.1.20',
          macAddress: 'AA:BB:CC:DD:EE:FF',
          type: 'ethernet',
          isActive: true,
        },
      ],
      hardwareInfo: {
        cpu: 'AMD Ryzen 5 3600',
        ram: '16GB',
        storage: '256GB SSD',
        manufacturer: 'Lenovo',
        model: 'ThinkCentre M70q',
        serialNumber: 'DEF456UVW',
      },
      location: 'Office Floor 3',
      department: 'Web Development',
      owner: 'webadmin@company.com',
    },
  ]);
}

function getMockPolicies(): Promise<SecurityPolicy[]> {
  return Promise.resolve([
    {
      id: 'policy-001',
      name: 'Standard Endpoint Protection',
      description: 'Basic security policies for all endpoints',
      category: 'endpoint',
      priority: 'high',
      rules: [
        {
          id: 'rule-001',
          name: 'Block Known Malware',
          description: 'Prevent execution of known malicious files',
          condition: 'file.signature in malware_database',
          action: 'block',
          severity: 'critical',
          enabled: true,
        },
        {
          id: 'rule-002',
          name: 'Require Password Complexity',
          description: 'Enforce strong password requirements',
          condition: 'password.length >= 8 AND password.contains_special_chars',
          action: 'monitor',
          severity: 'medium',
          enabled: true,
        },
      ],
      scope: {
        allEndpoints: true,
        specificEndpoints: [],
        groups: [],
        departments: [],
        locations: [],
        osTypes: [],
      },
      created: '2023-01-01T00:00:00Z',
      modified: '2023-06-15T00:00:00Z',
      author: 'security-admin',
      version: '2.1.0',
      isActive: true,
      complianceCheck: true,
      autoRemediate: false,
    },
    {
      id: 'policy-002',
      name: 'Server-Specific Security',
      description: 'Enhanced security for server endpoints',
      category: 'endpoint',
      priority: 'critical',
      rules: [
        {
          id: 'rule-003',
          name: 'Monitor Administrative Access',
          description: 'Log all administrative account activities',
          condition: 'user.is_admin AND action.requires_elevation',
          action: 'alert',
          severity: 'high',
          enabled: true,
        },
      ],
      scope: {
        allEndpoints: false,
        specificEndpoints: [],
        groups: ['servers'],
        departments: [],
        locations: [],
        osTypes: ['Windows', 'Linux'],
      },
      created: '2023-02-01T00:00:00Z',
      modified: '2023-07-01T00:00:00Z',
      author: 'security-admin',
      version: '1.5.0',
      isActive: true,
      complianceCheck: true,
      autoRemediate: true,
    },
  ]);
}

function getMockThreats(): Promise<Threat[]> {
  return Promise.resolve([
    {
      id: 'threat-001',
      type: 'malware',
      severity: 'high',
      confidence: 95,
      source: 'endpoint-001',
      affectedEndpoints: ['endpoint-001'],
      detectionTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      description: 'Ransomware variant detected attempting file encryption',
      indicators: [
        {
          type: 'file',
          value: 'C:\\Windows\\System32\\malicious.exe',
          confidence: 98,
          firstSeen: new Date(Date.now() - 7200000).toISOString(),
          lastSeen: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      status: 'contained',
      responseActions: [
        {
          id: 'action-001',
          type: 'isolate',
          status: 'completed',
          executedAt: new Date(Date.now() - 3500000).toISOString(),
          result: 'Endpoint successfully isolated',
        },
        {
          id: 'action-002',
          type: 'remove',
          status: 'completed',
          executedAt: new Date(Date.now() - 3000000).toISOString(),
          result: 'Malicious files removed',
        },
      ],
      mitigationSteps: [
        'Isolate affected endpoint',
        'Remove malicious files',
        'Scan for additional threats',
        'Update security signatures',
      ],
      impact: {
        endpointsAffected: 1,
        dataCompromised: false,
        downtimeMinutes: 30,
        financialImpact: 500,
        recoveryTime: '2 hours',
      },
    },
  ]);
}

function getMockIncidents(): Promise<Incident[]> {
  return Promise.resolve([
    {
      id: 'incident-001',
      title: 'Ransomware Attack Attempt',
      description: 'Ransomware detected and contained on Windows server',
      severity: 'high',
      status: 'resolved',
      priority: 'high',
      category: 'malware',
      reportedBy: 'system',
      assignedTo: 'security-team-lead',
      created: new Date(Date.now() - 7200000).toISOString(),
      updated: new Date(Date.now() - 1800000).toISOString(),
      resolvedAt: new Date(Date.now() - 1800000).toISOString(),
      affectedEndpoints: ['endpoint-001'],
      threats: ['threat-001'],
      vulnerabilities: [],
      timeline: [
        {
          id: 'event-001',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          type: 'detection',
          description: 'Threat detected by endpoint protection agent',
          actor: 'system',
          details: { threatId: 'threat-001' },
        },
        {
          id: 'event-002',
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          type: 'response',
          description: 'Endpoint automatically isolated',
          actor: 'system',
          details: { action: 'isolate' },
        },
        {
          id: 'event-003',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: 'resolution',
          description: 'Incident resolved - threat contained and removed',
          actor: 'security-team-lead',
          details: { resolution: 'Threat successfully mitigated' },
        },
      ],
      evidence: [],
      resolution: 'Malicious files removed, endpoint restored to normal operation',
      lessonsLearned: 'Improve network segmentation to limit lateral movement',
    },
  ]);
}

function getMockVulnerabilities(): Promise<Vulnerability[]> {
  return Promise.resolve([
    {
      id: 'vuln-001',
      cveId: 'CVE-2023-12345',
      title: 'Windows Remote Code Execution Vulnerability',
      description: 'Critical vulnerability allowing remote code execution',
      severity: 'critical',
      cvssScore: 9.8,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
      published: '2023-05-15T00:00:00Z',
      modified: '2023-06-01T00:00:00Z',
      affectedSoftware: ['Windows Server 2019'],
      affectedEndpoints: ['endpoint-001'],
      remediation: [
        {
          id: 'rem-001',
          type: 'patch',
          description: 'Install security update KB5027122',
          effort: 'low',
          priority: 'critical',
          automated: true,
          status: 'available',
        },
      ],
      status: 'open',
      exploitability: 'high',
      impact: 'high',
      references: ['https://msrc.microsoft.com/update-guide/vulnerability/CVE-2023-12345'],
    },
    {
      id: 'vuln-002',
      cveId: 'CVE-2023-23456',
      title: 'Privilege Escalation in Windows Service',
      description: 'Local privilege escalation vulnerability',
      severity: 'high',
      cvssScore: 7.8,
      cvssVector: 'CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H',
      published: '2023-04-20T00:00:00Z',
      modified: '2023-05-10T00:00:00Z',
      affectedSoftware: ['Windows Server 2019'],
      affectedEndpoints: ['endpoint-001'],
      remediation: [
        {
          id: 'rem-002',
          type: 'patch',
          description: 'Install security update KB5027123',
          effort: 'low',
          priority: 'high',
          automated: true,
          status: 'available',
        },
      ],
      status: 'open',
      exploitability: 'medium',
      impact: 'high',
      references: ['https://msrc.microsoft.com/update-guide/vulnerability/CVE-2023-23456'],
    },
    {
      id: 'vuln-003',
      cveId: 'CVE-2023-34567',
      title: 'Apache HTTP Server DoS Vulnerability',
      description: 'Denial of service vulnerability in Apache HTTP Server',
      severity: 'medium',
      cvssScore: 5.3,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:L',
      published: '2023-03-01T00:00:00Z',
      modified: '2023-03-15T00:00:00Z',
      affectedSoftware: ['Apache HTTP Server 2.4.52'],
      affectedEndpoints: ['endpoint-002'],
      remediation: [
        {
          id: 'rem-003',
          type: 'patch',
          description: 'Upgrade to Apache HTTP Server 2.4.53 or later',
          effort: 'medium',
          priority: 'medium',
          automated: false,
          status: 'available',
        },
      ],
      status: 'open',
      exploitability: 'medium',
      impact: 'medium',
      references: ['https://httpd.apache.org/security/vulnerabilities_24.html'],
    },
  ]);
}

function getMockPatches(): Promise<Patch[]> {
  return Promise.resolve([
    {
      id: 'patch-001',
      title: 'Windows Server 2019 Security Update (KB5027122)',
      description: 'Security update addressing multiple vulnerabilities',
      kbArticle: 'KB5027122',
      vendor: 'Microsoft',
      product: 'Windows Server 2019',
      version: '5027122',
      releaseDate: '2023-06-15T00:00:00Z',
      severity: 'critical',
      prerequisites: ['Windows Server 2019 RTM or later'],
      conflicts: [],
      size: 250000000, // 250MB
      deploymentStatus: [
        {
          endpointId: 'endpoint-001',
          status: 'not_deployed',
        },
      ],
      vulnerabilitiesFixed: ['CVE-2023-12345', 'CVE-2023-23456'],
      rollbackSupported: true,
    },
    {
      id: 'patch-002',
      title: 'Apache HTTP Server 2.4.53',
      description: 'Bug fix and security update release',
      vendor: 'Apache',
      product: 'Apache HTTP Server',
      version: '2.4.53',
      releaseDate: '2023-03-15T00:00:00Z',
      severity: 'medium',
      prerequisites: ['Apache HTTP Server 2.4.x'],
      conflicts: [],
      size: 10000000, // 10MB
      deploymentStatus: [
        {
          endpointId: 'endpoint-002',
          status: 'not_deployed',
        },
      ],
      vulnerabilitiesFixed: ['CVE-2023-34567'],
      rollbackSupported: true,
    },
  ]);
}

function getMockComplianceStatuses(): Promise<ComplianceStatus[]> {
  return Promise.resolve([
    {
      endpointId: 'endpoint-001',
      overall: 'compliant',
      score: 95,
      lastChecked: new Date().toISOString(),
      policies: [
        {
          policyId: 'policy-001',
          compliant: true,
          violations: [],
          lastChecked: new Date().toISOString(),
          remediationRequired: false,
        },
        {
          policyId: 'policy-002',
          compliant: true,
          violations: [],
          lastChecked: new Date().toISOString(),
          remediationRequired: false,
        },
      ],
      standards: [
        {
          standardId: 'nist-800-53',
          standardName: 'NIST 800-53',
          compliant: true,
          score: 92,
          requirements: [],
        },
      ],
      issues: [],
    },
    {
      endpointId: 'endpoint-002',
      overall: 'partial',
      score: 75,
      lastChecked: new Date().toISOString(),
      policies: [
        {
          policyId: 'policy-001',
          compliant: false,
          violations: ['Password complexity not enforced'],
          lastChecked: new Date().toISOString(),
          remediationRequired: true,
        },
      ],
      standards: [
        {
          standardId: 'cis-benchmarks',
          standardName: 'CIS Benchmarks',
          compliant: false,
          score: 68,
          requirements: [],
        },
      ],
      issues: [
        {
          id: 'issue-001',
          type: 'policy_violation',
          severity: 'medium',
          description: 'Password policy does not meet complexity requirements',
          affectedEntities: ['endpoint-002'],
          remediation: 'Update password policy settings',
          status: 'open',
          created: new Date().toISOString(),
        },
      ],
    },
  ]);
}

function getMockReports(): Promise<SecurityReport[]> {
  return Promise.resolve([
    {
      id: 'report-001',
      title: 'Monthly Security Summary - June 2023',
      type: 'executive_summary',
      period: {
        start: '2023-06-01T00:00:00Z',
        end: '2023-06-30T23:59:59Z',
      },
      generatedAt: '2023-07-01T09:00:00Z',
      generatedBy: 'security-admin',
      data: {
        keyMetrics: {
          meanTimeToDetect: '2.5 hours',
          meanTimeToRespond: '1.8 hours',
          securityPosture: 'Good',
          riskLevel: 'Medium',
        },
        topRisks: [
          'Unpatched vulnerabilities',
          'Weak authentication',
          'Insider threats',
        ],
        recommendations: [
          'Implement automated patch management',
          'Deploy multi-factor authentication',
          'Conduct regular security awareness training',
        ],
      },
      format: 'pdf',
      recipients: ['ceo@company.com', 'ciso@company.com'],
      status: 'ready',
      downloadUrl: '/api/reports/download/report-001',
    },
  ]);
}

function getMockDashboardMetrics(): Promise<DashboardMetrics> {
  return Promise.resolve({
    endpoints: {
      total: 2,
      online: 2,
      offline: 0,
      quarantined: 0,
      compromised: 0,
    },
    threats: {
      active: 0,
      contained: 1,
      resolved: 0,
      bySeverity: {
        critical: 0,
        high: 1,
        medium: 0,
        low: 0,
      },
    },
    incidents: {
      total: 1,
      open: 0,
      resolved: 1,
      bySeverity: {
        critical: 0,
        high: 1,
        medium: 0,
        low: 0,
      },
    },
    vulnerabilities: {
      total: 3,
      critical: 1,
      high: 1,
      medium: 1,
      low: 0,
      byStatus: {
        open: 3,
        in_progress: 0,
        resolved: 0,
        accepted_risk: 0,
      },
    },
    patches: {
      available: 2,
      deployed: 0,
      failed: 0,
      pending: 0,
    },
    compliance: {
      overallScore: 85,
      compliantEndpoints: 1,
      nonCompliantEndpoints: 0,
      policyViolations: 1,
    },
    alerts: {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    lastUpdated: new Date().toISOString(),
  });
}

function getMockAlerts(): Promise<Alert[]> {
  return Promise.resolve([
    {
      id: 'alert-001',
      type: 'vulnerability_found',
      severity: 'high',
      title: 'Critical Vulnerability Detected',
      description: 'CVE-2023-12345 found on endpoint-001',
      affectedEndpoint: 'endpoint-001',
      created: new Date(Date.now() - 3600000).toISOString(),
      acknowledged: false,
      resolved: false,
      escalationLevel: 1,
    },
  ]);
}
