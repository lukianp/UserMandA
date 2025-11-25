import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Incident data model
 */
export interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'detected' | 'investigating' | 'contained' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
  category: 'security' | 'operational' | 'compliance' | 'privacy' | 'other';
  detectedAt: string;
  reportedBy: string;
  assignedTo?: string;
  resolvedAt?: string;
  impact: IncidentImpact;
  rootCause?: string;
  resolution?: string;
  affectedSystems: string[];
  affectedUsers: number;
  businessImpact: string;
  tags: string[];
  attachments: IncidentAttachment[];
  timeline: IncidentTimelineEntry[];
}

/**
 * Incident impact assessment
 */
export interface IncidentImpact {
  confidentiality: 'none' | 'low' | 'moderate' | 'high' | 'catastrophic';
  integrity: 'none' | 'low' | 'moderate' | 'high' | 'catastrophic';
  availability: 'none' | 'low' | 'moderate' | 'high' | 'catastrophic';
  financialLoss: number;
  reputationDamage: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  operationalDisruption: 'none' | 'low' | 'moderate' | 'high' | 'complete';
}

/**
 * Incident attachment data model
 */
export interface IncidentAttachment {
  id: string;
  fileName: string;
  fileType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

/**
 * Incident timeline entry
 */
export interface IncidentTimelineEntry {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  performedBy: string;
  automated: boolean;
  metadata: { [key: string]: any };
}

/**
 * Incident response plan data model
 */
export interface IncidentResponsePlan {
  id: string;
  name: string;
  description: string;
  category: Incident['category'];
  triggerConditions: PlanTrigger[];
  responseSteps: ResponseStep[];
  stakeholders: Stakeholder[];
  communicationPlan: CommunicationTemplate[];
  createdBy: string;
  createdAt: string;
  lastReviewed: string;
  version: string;
  status: 'draft' | 'active' | 'retired';
}

/**
 * Plan trigger condition
 */
export interface PlanTrigger {
  id: string;
  type: 'alert' | 'threshold' | 'pattern' | 'manual';
  condition: string;
  parameters: { [key: string]: any };
}

/**
 * Response step in the plan
 */
export interface ResponseStep {
  id: string;
  order: number;
  title: string;
  description: string;
  assignedRole: string;
  estimatedDuration: number; // in minutes
  dependencies?: string[]; // step IDs
  automated: boolean;
  required: boolean;
  checklist: string[];
}

/**
 * Stakeholder information
 */
export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  contactInfo: {
    email: string;
    phone?: string;
    slack?: string;
  };
  notificationPreference: 'immediate' | 'hourly' | 'daily' | 'none';
  escalationLevel: number;
}

/**
 * Communication template
 */
export interface CommunicationTemplate {
  id: string;
  type: 'internal_update' | 'external_notification' | 'stakeholder_alert' | 'media_statement';
  template: string;
  recipients: string[];
  trigger: 'incident_created' | 'status_changed' | 'resolution_reached' | 'escalation';
}

/**
 * Incident analytics and metrics
 */
export interface IncidentAnalytics {
  totalIncidents: number;
  incidentsByStatus: { [status: string]: number };
  incidentsByPriority: { [priority: string]: number };
  incidentsByCategory: { [category: string]: number };
  averageResolutionTime: number; // in hours
  meanTimeToDetection: number; // in minutes
  meanTimeToResponse: number; // in minutes
  recurrenceRate: number; // percentage
  costPerIncident: number;
  topAffectedSystems: Array<{ system: string; count: number }>;
  incidentTrends: Array<{ month: string; count: number; severity: string }>;
}

/**
 * Custom hook for incident response logic
 */
export const useIncidentResponseLogic = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [responsePlans, setResponsePlans] = useState<IncidentResponsePlan[]>([]);
  const [analytics, setAnalytics] = useState<IncidentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Create new incident
   */
  const createIncident = useCallback(async (incidentData: Omit<Incident, 'id' | 'detectedAt' | 'status' | 'timeline'>) => {
    try {
      const newIncident: Incident = {
        ...incidentData,
        id: `incident-${Date.now()}`,
        detectedAt: new Date().toISOString(),
        status: 'detected',
        timeline: [{
          id: `timeline-${Date.now()}-1`,
          timestamp: new Date().toISOString(),
          action: 'incident_created',
          description: 'Incident was detected and reported',
          performedBy: incidentData.reportedBy,
          automated: false,
          metadata: {},
        }],
      };

      setIncidents(prev => [...prev, newIncident]);
      console.info('[IncidentResponse] Created incident:', newIncident.id);
      return newIncident;
    } catch (err: any) {
      console.error('[IncidentResponse] Failed to create incident:', err);
      setError(`Failed to create incident: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Update existing incident
   */
  const updateIncident = useCallback(async (id: string, updates: Partial<Incident>) => {
    try {
      setIncidents(prev => prev.map(incident => {
        if (incident.id !== id) return incident;

        const updated = { ...incident, ...updates };

        // Add timeline entry for status changes
        if (updates.status && updates.status !== incident.status) {
          const timelineEntry: IncidentTimelineEntry = {
            id: `timeline-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'status_changed',
            description: `Status changed from ${incident.status} to ${updates.status}`,
            performedBy: updates.assignedTo || 'system',
            automated: true,
            metadata: { previousStatus: incident.status, newStatus: updates.status },
          };
          updated.timeline = [...incident.timeline, timelineEntry];

          // Set resolved timestamp if status is resolved
          if (updates.status === 'resolved' && !incident.resolvedAt) {
            updated.resolvedAt = new Date().toISOString();
          }
        }

        return updated;
      }));

      console.info('[IncidentResponse] Updated incident:', id);
    } catch (err: any) {
      console.error('[IncidentResponse] Failed to update incident:', err);
      setError(`Failed to update incident: ${err.message}`);
    }
  }, []);

  /**
   * Add timeline entry to incident
   */
  const addTimelineEntry = useCallback(async (incidentId: string, entry: Omit<IncidentTimelineEntry, 'id' | 'timestamp'>) => {
    try {
      setIncidents(prev => prev.map(incident => {
        if (incident.id !== incidentId) return incident;

        const newEntry: IncidentTimelineEntry = {
          ...entry,
          id: `timeline-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };

        return {
          ...incident,
          timeline: [...incident.timeline, newEntry],
        };
      }));

      console.info('[IncidentResponse] Added timeline entry to incident:', incidentId);
    } catch (err: any) {
      console.error('[IncidentResponse] Failed to add timeline entry:', err);
      setError(`Failed to add timeline entry: ${err.message}`);
    }
  }, []);

  /**
   * Assign incident to responder
   */
  const assignIncident = useCallback(async (incidentId: string, assignedTo: string) => {
    await updateIncident(incidentId, { assignedTo, status: 'investigating' });
    await addTimelineEntry(incidentId, {
      action: 'assigned',
      description: `Incident assigned to ${assignedTo}`,
      performedBy: 'system',
      automated: true,
      metadata: { assignee: assignedTo },
    });
  }, [updateIncident, addTimelineEntry]);

  /**
   * Escalate incident
   */
  const escalateIncident = useCallback(async (incidentId: string, newPriority: Incident['priority'], reason: string) => {
    await updateIncident(incidentId, { priority: newPriority });
    await addTimelineEntry(incidentId, {
      action: 'escalated',
      description: `Incident escalated to ${newPriority} priority: ${reason}`,
      performedBy: 'system',
      automated: true,
      metadata: { newPriority, reason },
    });
  }, [updateIncident, addTimelineEntry]);

  /**
   * Create incident response plan
   */
  const createResponsePlan = useCallback(async (planData: Omit<IncidentResponsePlan, 'id' | 'createdAt' | 'lastReviewed' | 'version' | 'status'>) => {
    try {
      const newPlan: IncidentResponsePlan = {
        ...planData,
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        lastReviewed: new Date().toISOString(),
        version: '1.0',
        status: 'draft',
      };

      setResponsePlans(prev => [...prev, newPlan]);
      console.info('[IncidentResponse] Created response plan:', newPlan.id);
      return newPlan;
    } catch (err: any) {
      console.error('[IncidentResponse] Failed to create response plan:', err);
      setError(`Failed to create response plan: ${err.message}`);
      return null;
    }
  }, []);

  /**
   * Update response plan
   */
  const updateResponsePlan = useCallback(async (id: string, updates: Partial<IncidentResponsePlan>) => {
    try {
      setResponsePlans(prev => prev.map(plan =>
        plan.id === id ? { ...plan, ...updates, lastReviewed: new Date().toISOString() } : plan
      ));

      console.info('[IncidentResponse] Updated response plan:', id);
    } catch (err: any) {
      console.error('[IncidentResponse] Failed to update response plan:', err);
      setError(`Failed to update response plan: ${err.message}`);
    }
  }, []);

  /**
   * Execute response plan for incident
   */
  const executeResponsePlan = useCallback(async (incidentId: string, planId: string) => {
    try {
      const plan = responsePlans.find(p => p.id === planId);
      if (!plan) throw new Error('Response plan not found');

      // Execute automated steps
      for (const step of plan.responseSteps.filter(s => s.automated)) {
        await addTimelineEntry(incidentId, {
          action: 'plan_step_executed',
          description: `Executed automated step: ${step.title}`,
          performedBy: 'system',
          automated: true,
          metadata: { planId, stepId: step.id },
        });

        // Simulate step execution time
        await new Promise(resolve => setTimeout(resolve, step.estimatedDuration * 1000));
      }

      console.info('[IncidentResponse] Executed response plan for incident:', incidentId);
    } catch (err: any) {
      console.error('[IncidentResponse] Failed to execute response plan:', err);
      setError(`Failed to execute response plan: ${err.message}`);
    }
  }, [responsePlans, addTimelineEntry]);

  /**
   * Calculate incident analytics
   */
  const calculateAnalytics = useCallback((incidents: Incident[]): IncidentAnalytics => {
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'closed');

    const incidentsByStatus = incidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {} as { [status: string]: number });

    const incidentsByPriority = incidents.reduce((acc, incident) => {
      acc[incident.priority] = (acc[incident.priority] || 0) + 1;
      return acc;
    }, {} as { [priority: string]: number });

    const incidentsByCategory = incidents.reduce((acc, incident) => {
      acc[incident.category] = (acc[incident.category] || 0) + 1;
      return acc;
    }, {} as { [category: string]: number });

    const resolutionTimes = resolvedIncidents
      .filter(i => i.resolvedAt)
      .map(i => (new Date(i.resolvedAt!).getTime() - new Date(i.detectedAt).getTime()) / (1000 * 60 * 60));

    const averageResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    const affectedSystemsCount = incidents.reduce((acc, incident) => {
      incident.affectedSystems.forEach(system => {
        acc[system] = (acc[system] || 0) + 1;
      });
      return acc;
    }, {} as { [system: string]: number });

    const topAffectedSystems = Object.entries(affectedSystemsCount)
      .map(([system, count]) => ({ system, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalIncidents: incidents.length,
      incidentsByStatus,
      incidentsByPriority,
      incidentsByCategory,
      averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
      meanTimeToDetection: 15 + Math.floor(Math.random() * 45), // Mock MTTD
      meanTimeToResponse: 30 + Math.floor(Math.random() * 60), // Mock MTTR
      recurrenceRate: 0.15 + Math.random() * 0.2, // Mock recurrence rate
      costPerIncident: 5000 + Math.floor(Math.random() * 15000),
      topAffectedSystems,
      incidentTrends: generateIncidentTrends(),
    };
  }, [incidents]);

  /**
   * Load incident response data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock data loading - replace with actual API calls
      const mockIncidents = generateMockIncidents();
      const mockResponsePlans = generateMockResponsePlans();

      const calculatedAnalytics = calculateAnalytics(mockIncidents);

      setIncidents(mockIncidents);
      setResponsePlans(mockResponsePlans);
      setAnalytics(calculatedAnalytics);

      console.info('[IncidentResponse] Loaded incident response data');
    } catch (err: any) {
      const errorMsg = `Failed to load incident response data: ${err.message}`;
      console.error('[IncidentResponse] Error:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [calculateAnalytics]);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Set up real-time refresh
   */
  const startRealTimeUpdates = useCallback((intervalMs: number = 30000) => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      loadData();
    }, intervalMs);

    console.info('[IncidentResponse] Started real-time updates');
  }, [loadData]);

  /**
   * Stop real-time updates
   */
  const stopRealTimeUpdates = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.info('[IncidentResponse] Stopped real-time updates');
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopRealTimeUpdates();
    };
  }, [stopRealTimeUpdates]);

  /**
   * Get incidents by status
   */
  const getIncidentsByStatus = useCallback((status: Incident['status']) => {
    return incidents.filter(incident => incident.status === status);
  }, [incidents]);

  /**
   * Get incidents by priority
   */
  const getIncidentsByPriority = useCallback((priority: Incident['priority']) => {
    return incidents.filter(incident => incident.priority === priority);
  }, [incidents]);

  /**
   * Get overdue incidents
   */
  const getOverdueIncidents = useCallback(() => {
    const now = new Date();
    return incidents.filter(incident => {
      if (incident.status === 'resolved' || incident.status === 'closed') return false;
      // Mock overdue logic - incidents open for more than 24 hours
      const detectedTime = new Date(incident.detectedAt).getTime();
      return (now.getTime() - detectedTime) > (24 * 60 * 60 * 1000);
    });
  }, [incidents]);

  /**
   * Generate incident report
   */
  const generateIncidentReport = useCallback((startDate: string, endDate: string) => {
    const filteredIncidents = incidents.filter(incident => {
      const incidentDate = new Date(incident.detectedAt);
      return incidentDate >= new Date(startDate) && incidentDate <= new Date(endDate);
    });

    return {
      period: { startDate, endDate },
      summary: {
        totalIncidents: filteredIncidents.length,
        resolvedIncidents: filteredIncidents.filter(i => i.status === 'resolved').length,
        averageResolutionTime: analytics?.averageResolutionTime || 0,
      },
      incidents: filteredIncidents,
      trends: analytics?.incidentTrends || [],
      recommendations: generateIncidentRecommendations(filteredIncidents),
    };
  }, [incidents, analytics]);

  return {
    incidents,
    responsePlans,
    analytics,
    isLoading,
    error,
    createIncident,
    updateIncident,
    addTimelineEntry,
    assignIncident,
    escalateIncident,
    createResponsePlan,
    updateResponsePlan,
    executeResponsePlan,
    getIncidentsByStatus,
    getIncidentsByPriority,
    getOverdueIncidents,
    generateIncidentReport,
    refreshData: loadData,
    startRealTimeUpdates,
    stopRealTimeUpdates,
  };
};

/**
 * Generate mock incidents for development
 */
function generateMockIncidents(): Incident[] {
  const categories: Incident['category'][] = ['security', 'operational', 'compliance', 'privacy'];
  const priorities: Incident['priority'][] = ['low', 'medium', 'high', 'critical'];
  const statuses: Incident['status'][] = ['detected', 'investigating', 'contained', 'resolved', 'closed'];

  return Array.from({ length: 20 }, (_, index) => {
    const detectedAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
    const resolvedAt = index % 4 !== 0 ? new Date(detectedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined;

    return {
      id: `incident-${index + 1}`,
      title: `Incident ${index + 1}: ${['Data Breach', 'System Outage', 'Compliance Violation', 'Unauthorized Access', 'Data Loss'][index % 5]}`,
      description: `Description of incident ${index + 1} affecting company systems.`,
      status: statuses[index % statuses.length],
      priority: priorities[index % priorities.length],
      severity: ['minor', 'moderate', 'major', 'catastrophic'][index % 4] as Incident['severity'],
      category: categories[index % categories.length],
      detectedAt: detectedAt.toISOString(),
      reportedBy: 'security@company.com',
      assignedTo: index > 5 ? 'responder@company.com' : undefined,
      resolvedAt: resolvedAt?.toISOString(),
      impact: {
        confidentiality: ['none', 'low', 'moderate', 'high'][index % 4] as IncidentImpact['confidentiality'],
        integrity: ['none', 'low', 'moderate', 'high'][index % 4] as IncidentImpact['integrity'],
        availability: ['none', 'low', 'moderate', 'high'][index % 4] as IncidentImpact['availability'],
        financialLoss: Math.floor(Math.random() * 50000),
        reputationDamage: ['none', 'low', 'moderate', 'severe'][index % 4] as IncidentImpact['reputationDamage'],
        operationalDisruption: ['none', 'low', 'moderate', 'complete'][index % 4] as IncidentImpact['operationalDisruption'],
      },
      rootCause: index % 3 === 0 ? 'Human error in configuration' : undefined,
      resolution: index % 3 === 0 ? 'Configuration corrected and monitoring enhanced' : undefined,
      affectedSystems: ['web-server', 'database', 'email-system'].slice(0, Math.floor(Math.random() * 3) + 1),
      affectedUsers: Math.floor(Math.random() * 1000) + 10,
      businessImpact: 'Minimal disruption to business operations',
      tags: ['urgent', 'security', 'investigation'][index % 3] ? ['urgent'] : [],
      attachments: index % 4 === 0 ? [
        {
          id: `attachment-${index + 1}`,
          fileName: 'incident_log.txt',
          fileType: 'text/plain',
          size: 2048,
          uploadedBy: 'security@company.com',
          uploadedAt: new Date().toISOString(),
          url: '/attachments/incident_log.txt',
        },
      ] : [],
      timeline: [
        {
          id: `timeline-${index + 1}-1`,
          timestamp: detectedAt.toISOString(),
          action: 'incident_created',
          description: 'Incident detected by monitoring system',
          performedBy: 'monitoring-system',
          automated: true,
          metadata: { source: 'SIEM' },
        },
      ],
    };
  });
}

/**
 * Generate mock response plans for development
 */
function generateMockResponsePlans(): IncidentResponsePlan[] {
  return [
    {
      id: 'plan-1',
      name: 'Security Breach Response Plan',
      description: 'Standard response procedure for security incidents',
      category: 'security',
      triggerConditions: [
        {
          id: 'trigger-1',
          type: 'alert',
          condition: 'Unauthorized access detected',
          parameters: { severity: 'high' },
        },
      ],
      responseSteps: [
        {
          id: 'step-1',
          order: 1,
          title: 'Isolate affected systems',
          description: 'Immediately isolate compromised systems from network',
          assignedRole: 'Security Engineer',
          estimatedDuration: 30,
          automated: false,
          required: true,
          checklist: ['Identify affected systems', 'Disconnect from network', 'Notify stakeholders'],
        },
        {
          id: 'step-2',
          order: 2,
          title: 'Assess breach scope',
          description: 'Determine what data was accessed and potential impact',
          assignedRole: 'Security Analyst',
          estimatedDuration: 60,
          dependencies: ['step-1'],
          automated: false,
          required: true,
          checklist: ['Review access logs', 'Check data integrity', 'Document findings'],
        },
      ],
      stakeholders: [
        {
          id: 'stakeholder-1',
          name: 'Security Team Lead',
          role: 'Incident Commander',
          contactInfo: {
            email: 'security-lead@company.com',
            phone: '+1-555-0100',
            slack: '@security-lead',
          },
          notificationPreference: 'immediate',
          escalationLevel: 1,
        },
      ],
      communicationPlan: [
        {
          id: 'comm-1',
          type: 'internal_update',
          template: 'Security incident detected. Status: {status}. Impact: {impact}',
          recipients: ['security-team@company.com'],
          trigger: 'incident_created',
        },
      ],
      createdBy: 'admin@company.com',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastReviewed: new Date().toISOString(),
      version: '2.1',
      status: 'active',
    },
  ];
}

/**
 * Generate mock incident trends for development
 */
function generateIncidentTrends(): Array<{ month: string; count: number; severity: string }> {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push(date.toISOString().substring(0, 7)); // YYYY-MM format
  }

  return months.map(month => ({
    month,
    count: Math.floor(Math.random() * 15) + 5,
    severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
  }));
}

/**
 * Generate incident recommendations based on analysis
 */
function generateIncidentRecommendations(incidents: Incident[]): string[] {
  const recommendations = [
    'Implement additional monitoring for high-risk systems',
    'Review and update incident response procedures',
    'Conduct security awareness training for staff',
    'Upgrade vulnerable systems and software',
    'Establish regular security assessments',
  ];

  return recommendations.slice(0, Math.floor(Math.random() * 3) + 2);
}