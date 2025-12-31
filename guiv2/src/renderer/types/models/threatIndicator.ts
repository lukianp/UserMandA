/**
 * Threat detection data model from security modules
 */
export interface ThreatIndicator {
  threatType: string | null;
  severity: string | null;
  source: string | null;
  target: string | null;
  status: string | null;
  detectedDate: Date | string | null;
  lastActivity: Date | string | null;
  description: string | null;
  ioc: string | null;
  mitre_id: string | null;
  response: string | null;
  isActive: boolean;
  isSelected?: boolean;
  id?: string | null;
  severityIcon: string;
  statusIcon: string;
  threatIcon: string;
  severityColor: string;
  isOverdue: boolean;
}


