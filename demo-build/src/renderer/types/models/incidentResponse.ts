/**
 * Incident Response Types
 */

export interface IncidentMetrics {
  totalIncidents: number;
  activeIncidents: number;
  resolvedIncidents: number;
  avgResponseTime: number; // minutes
  avgResolutionTime: number; // hours
  criticalIncidents: number;
}

export interface SecurityIncident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'investigating' | 'contained' | 'resolved' | 'closed';
  category: 'malware' | 'phishing' | 'data_breach' | 'unauthorized_access' | 'dos' | 'other';
  detectedAt: Date;
  reportedBy: string;
  assignedTo?: string;
  affectedSystems: string[];
  affectedUsers: string[];
  description: string;
  timeline: IncidentTimelineEvent[];
  responseActions: ResponseAction[];
  rootCause?: string;
  resolution?: string;
  closedAt?: Date;
}

export interface IncidentTimelineEvent {
  timestamp: Date;
  event: string;
  actor: string;
  details: string;
}

export interface ResponseAction {
  id: string;
  action: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string;
  completedAt?: Date;
}

export interface IncidentResponseData {
  metrics: IncidentMetrics;
  incidents: SecurityIncident[];
}


